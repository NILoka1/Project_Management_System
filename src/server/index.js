const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  getManagerStats,
  getTeamLeadStats,
  getDeveloperStats,
} = require("./utils/dashboardStats");

require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Регистрация
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Валидация
    if (!email || !password || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Проверяем существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "DEVELOPER", // По умолчанию
      },
    });

    // Создаем JWT токен
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Возвращаем данные (без пароля)
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Логин
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Создаем токен
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Получить все задачи (с фильтрацией по проекту)
// Получить все задачи (с фильтрацией по проекту)
app.get("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { projectId } = req.query;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    let whereCondition = {};

    if (user.role === "MANAGER") {
      // Менеджер видит все задачи
      whereCondition = {};
    } else if (user.role === "TEAM_LEAD") {
      // Тимлид видит задачи своей команды
      whereCondition = {
        project: {
          teams: {
            some: {
              team: {
                members: {
                  some: {
                    userId: userId,
                    role: "LEADER",
                  },
                },
              },
            },
          },
        },
      };
    } else {
      // DEVELOPER/TESTER: видит задачи команды + свои задачи
      whereCondition = {
        OR: [
          { assigneeId: userId }, // Я исполнитель
          { creatorId: userId }, // Я создатель
          {
            project: {
              teams: {
                some: {
                  team: {
                    members: {
                      some: { userId: userId }, // Задачи проектов моей команды
                    },
                  },
                },
              },
            },
          },
        ],
      };
    }

    // Добавляем фильтрацию по projectId если есть
    if (projectId) {
      whereCondition.projectId = projectId;
    }

    const tasks = await prisma.task.findMany({
      where: whereCondition,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            timeEntries: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Получить задачи текущего пользователя
app.get("/api/tasks/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ assigneeId: userId }, { creatorId: userId }],
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            timeEntries: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Создать задачу
app.post("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, projectId, priority = "MEDIUM" } = req.body;

    if (!title || !projectId) {
      return res
        .status(400)
        .json({ error: "Title and projectId are required" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        priority,
        creatorId: userId,
        status: "BACKLOG",
      },
      include: {
        project: {
          select: { name: true },
        },
        creator: {
          select: { name: true },
        },
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// 📊 ДАШБОРД - ОБЩАЯ СТАТИСТИКА
app.get("/api/dashboard/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teams: {
          include: {
            team: {
              include: {
                members: true,
                projects: {
                  include: {
                    project: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    let stats = {};

    // 📈 СТАТИСТИКА ПО РОЛЯМ
    switch (user.role) {
      case "MANAGER":
        stats = await getManagerStats();
        break;
      case "TEAM_LEAD":
        stats = await getTeamLeadStats(userId);
        break;
      case "DEVELOPER":
        stats = await getDeveloperStats(userId);
        break;
      case "TESTER":
        stats = await getDeveloperStats(userId);
        break;
      default:
        stats = await getDeveloperStats(userId);
    }

    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// 🚀 ПРОЕКТЫ ДЛЯ ДАШБОРДА
app.get("/api/dashboard/projects", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    let projects = [];

    switch (user.role) {
      case "MANAGER":
        projects = await prisma.project.findMany({
          include: {
            tasks: {
              select: {
                id: true,
                status: true,
              },
            },
            teams: {
              include: {
                team: {
                  include: {
                    members: {
                      include: {
                        user: {
                          select: { name: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        break;

      case "TEAM_LEAD":
        projects = await prisma.project.findMany({
          where: {
            teams: {
              some: {
                team: {
                  members: {
                    some: {
                      userId: userId,
                      role: "LEADER",
                    },
                  },
                },
              },
            },
          },
          include: {
            tasks: true,
            teams: true,
          },
        });
        break;

      default: // DEVELOPER, TESTER
        projects = await prisma.project.findMany({
          where: {
            teams: {
              some: {
                team: {
                  members: {
                    some: { userId: userId },
                  },
                },
              },
            },
          },
          include: {
            tasks: {
              where: {
                OR: [{ assigneeId: userId }, { creatorId: userId }],
              },
            },
          },
        });
    }

    res.json(projects);
  } catch (error) {
    console.error("Dashboard projects error:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// ✅ ЗАДАЧИ ДЛЯ ДАШБОРДА
app.get("/api/dashboard/tasks", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, priority, limit = 10 } = req.query;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    let whereCondition = {};

    // 🎯 ФИЛЬТРАЦИЯ ПО РОЛЯМ
    if (user.role === "MANAGER") {
      whereCondition = {};
    } else if (user.role === "TEAM_LEAD") {
      whereCondition = {
        project: {
          teams: {
            some: {
              team: {
                members: {
                  some: {
                    userId: userId,
                    role: "LEADER",
                  },
                },
              },
            },
          },
        },
      };
    } else {
      // DEVELOPER, TESTER - видим задачи команды + свои
      whereCondition = {
        OR: [
          { assigneeId: userId },
          { creatorId: userId },
          {
            project: {
              teams: {
                some: {
                  team: {
                    members: {
                      some: { userId: userId },
                    },
                  },
                },
              },
            },
          },
        ],
      };
    }

    // 🔧 ДОПОЛНИТЕЛЬНЫЕ ФИЛЬТРЫ
    if (status) {
      whereCondition.status = { in: Array.isArray(status) ? status : [status] };
    }

    if (priority) {
      whereCondition.priority = {
        in: Array.isArray(priority) ? priority : [priority],
      };
    }

    const tasks = await prisma.task.findMany({
      where: whereCondition,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { dueDate: "asc" }, // Сначала просроченные
        { priority: "desc" }, // Затем по приоритету
        { createdAt: "desc" },
      ],
      take: parseInt(limit),
    });

    res.json(tasks);
  } catch (error) {
    console.error("Dashboard tasks error:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});
// 📈 УПРОЩЕННАЯ АНАЛИТИКА ПРОДУКТИВНОСТИ ЗА НЕДЕЛЮ
app.get(
  "/api/dashboard/analytics/productivity",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.userId;

      // Фиксированный период - неделя
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      // Получаем задачи пользователя за неделю
      const tasks = await prisma.task.findMany({
        where: {
          assigneeId: userId,
          dueDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

      // Считаем общую статистику за неделю
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(
        (task) => task.status === "DONE"
      ).length;

      // Продуктивность = % выполненных задач
      const productivity =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const productivityData = {
        productivity,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
      };

      res.json({ data: productivityData });
    } catch (error) {
      console.error("Productivity analytics error:", error);
      res.status(500).json({ error: "Failed to fetch productivity data" });
    }
  }
);

// ⏱️ СТАТИСТИКА ВРЕМЕНИ (по статусам задач)
app.get("/api/dashboard/analytics/time", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Фиксированный период - неделя
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // Получаем задачи пользователя за неделю
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        status: true,
      },
    });

    // Считаем распределение по статусам
    const statusCount = {};
    tasks.forEach((task) => {
      statusCount[task.status] = (statusCount[task.status] || 0) + 1;
    });

    const totalTasks = tasks.length;

    const statusLabels = {
      DONE: "Выполнено",
      IN_PROGRESS: "В работе",
      TODO: "К выполнению",
      REVIEW: "На ревью",
      TESTING: "Тестирование",
      BACKLOG: "Бэклог",
    };

    const statusColors = {
      DONE: "green",
      IN_PROGRESS: "blue",
      TODO: "yellow",
      REVIEW: "orange",
      TESTING: "violet",
      BACKLOG: "gray",
    };

    const distribution = Object.entries(statusCount)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        category: statusLabels[status] || status,
        value: totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0,
        color: statusColors[status] || "gray",
        count,
      }));

    const timeStats = {
      distribution,
      totalTasks,
    };

    res.json({ data: timeStats });
  } catch (error) {
    console.error("Time stats error:", error);
    res.status(500).json({ error: "Failed to fetch time statistics" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
