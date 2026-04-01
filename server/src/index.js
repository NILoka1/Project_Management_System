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
const { error } = require("console");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
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
app.get("/api/dashboard/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // Из JWT
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log(userId, user)

    let stats;
    switch (user.role) {
      case "MANAGER":
        stats = await getManagerStats();
        break;
      case "TEAM_LEAD":
        stats = await getTeamLeadStats(userId);
        break;
      default: // DEVELOPER или TESTER
        stats = await getDeveloperStats(userId);
        break;
    }

    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to get dashboard stats" });
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

app.get("/api/tasks/team", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    let tasks;

    if (user.role === "MANAGER") {
      tasks = await prisma.task.findMany({
        where: {
          status: {
            notIn: ["BACKLOG", "DONE"],
          },
        },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }, { priority: "desc" }],
      });
    } else if (user.role === "TEAM_LEAD") {
      tasks = await prisma.task.findMany({
        where: {
          status: {
            notIn: ["BACKLOG", "DONE"],
          },
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
        },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }, { priority: "desc" }],
      });
    } else {
      tasks = await prisma.task.findMany({
        where: {
          status: {
            notIn: ["BACKLOG", "DONE"],
          },
          project: {
            teams: {
              some: {
                team: {
                  members: {
                    some: {
                      userId: userId,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
      });
    }
    res.json(tasks);
  } catch (error) {
    console.error("Team tasks error:", error);
    res.status(500).json({ error: "Failed to fetch team tasks" });
  }
});

app.get("/api/tasks/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    let tasks;

    if (user.role === "TEAM_LEAD") {
      tasks = await prisma.task.findMany({
        where: {
          status: "REVIEW",
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
        },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }, { priority: "desc" }],
      });
    } else {
      tasks = await prisma.task.findMany({
        where: {
          assigneeId: userId,
          status: { in: ["IN_PROGRESS", "TESTING"] },
        },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }, { priority: "desc" }],
      });
    }

    res.json(tasks);
  } catch (error) {
    console.error("Personal tasks error:", error);
    res.status(500).json({ error: "Failed to fetch personal tasks" });
  }
});

app.get("/api/tasks/backlog", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    let tasks;
    if (user.role === "MANAGER") {
      tasks = await prisma.task.findMany({
        where: {
          status: "BACKLOG",
        },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }, { priority: "desc" }],
      });
    } else if (user.role === "TEAM_LEAD") {
      tasks = await prisma.task.findMany({
        where: {
          status: "BACKLOG",
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
        },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }, { priority: "desc" }],
      });
    } else {
      tasks = await prisma.task.findMany({
        where: {
          status: "BACKLOG",
          project: {
            teams: {
              some: {
                team: {
                  members: {
                    some: {
                      userId: userId,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
      });
    }
    res.json(tasks);
  } catch (error) {
    console.error("Personal tasks error:", error);
    res.status(500).json({ error: "Failed to fetch personal tasks" });
  }
});

app.get("/api/tasks/done", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    let tasks;
    if (user.role === "MANAGER") {
      tasks = await prisma.task.findMany({
        where: {
          status: "DONE",
        },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }, { priority: "desc" }],
      });
    } else if (user.role === "TEAM_LEAD") {
      tasks = await prisma.task.findMany({
        where: {
          status: "DONE",
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
        },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }, { priority: "desc" }],
      });
    } else {
      tasks = await prisma.task.findMany({
        where: {
          status: "DONE",
          project: {
            teams: {
              some: {
                team: {
                  members: {
                    some: {
                      userId: userId,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
      });
    }
    res.json(tasks);
  } catch (error) {
    console.error("Personal tasks error:", error);
    res.status(500).json({ error: "Failed to fetch personal tasks" });
  }
});

app.get("/api/project", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    let project;

    if (user.role === "MANAGER") {
      project = await prisma.project.findMany({});
    } else {
      project = await prisma.project.findMany({
        where: {
          teams: {
            some: {
              team: {
                members: {
                  some: {
                    userId: userId,
                  },
                },
              },
            },
          },
        },
      });
    }

    res.json(project);
  } catch (error) {
    console.error("Personal tasks error:", error);
    res.status(500).json({ error: "Failed to fetch personal tasks" });
  }
});

app.get("/api/teams", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
      },
    });
    res.json(teams);
  } catch (error) {
    console.error("Personal tasks error:", error);
    res.status(500).json({ error: "Failed to fetch personal tasks" });
  }
});
app.get("/api/teams/:teamId", authMiddleware, async (req, res) => {
  try {
    const teamId = req.params.teamId;

    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                createdAt: true,
              },
            },
          },
        },
        projects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
                progress: true,
                budget: true,
                startDate: true,
                endDate: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const fullTeam = {
      ...team,
      members: team.members.map((member) => member.user),
      projects: team.projects.map((pt) => pt.project),
    };

    res.json(fullTeam);
  } catch (error) {
    console.error("Get team error:", error);
    res.status(500).json({ error: "Failed to fetch team" });
  }
});

app.get("/api/users", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user.role != "MANAGER") {
      res.json({ error: "Недостаточно прав" });
      return;
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Personal tasks error:", error);
    res.status(500).json({ error: "Failed to fetch personal tasks" });
  }
});

// GET /api/projects/:projectId
app.get("/api/projects/:projectId", authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            timeEntries: true,
          },
        },
        teams: {
          include: {
            team: {
              include: {
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const fullProject = {
      ...project,
      teams: project.teams.map((pt) => pt.team),
    };

    res.json(fullProject);
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// POST /api/teams/:teamId/members
app.post("/api/teams/:teamId/members", authMiddleware, async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { userIds } = req.body;

    // Создаем связи между пользователями и командой
    const teamUsers = await prisma.teamUser.createMany({
      data: userIds.map((userId) => ({
        userId,
        teamId,
        role: "MEMBER",
      })),
    });

    // Получаем обновленных участников
    const members = await prisma.teamUser.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Участники успешно добавлены",
      members: members.map((member) => member.user),
      addedCount: teamUsers.count,
    });
  } catch (error) {
    console.error("Add members error:", error);
    res.status(500).json({ error: "Не удалось добавить участников" });
  }
});

app.post("/api/projects", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, description, budget, startDate, endDate, status } = req.body;

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        budget: budget ? parseFloat(budget) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || "PLANNING",
        // progress автоматически 0 по умолчанию
      },
    });
    res.status(201).json(project);
  } catch (error) {
    console.error("Personal tasks error:", error);
    res.status(500).json({ error: "Failed to fetch personal tasks" });
  }
});
app.post("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, dueDate, projectId, taskStatus, priority } =
      req.body;

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim(), // опционально
        dueDate: dueDate ? new Date(dueDate) : null, // конвертируем в Date
        projectId: projectId,
        creatorId: userId, // на всякий случай
        priority: priority || "MEDIUM", // значение по умолчанию
        status: taskStatus || "BACKLOG", // значение по умолчанию
        assigneeId: null, // или из req.body если есть
      },
    });
    res.status(201).json(task);
  } catch (error) {
    console.error("Personal tasks error:", error);
    res.status(500).json({ error: "Failed to fetch personal tasks" });
  }
});

app.post("/api/teams", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, description } = req.body;

    team = await prisma.team.create({
      data: {
        name: name,
        description: description,
      },
    });

    res.status(201).json(team);
  } catch (error) {
    console.error("Personal team error:", error);
    res.status(500).json({ error: "Failed to fetch team" });
  }
});

// POST /api/teams/:teamId/projects
app.post("/api/teams/:teamId/projects", authMiddleware, async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { projectIds } = req.body;

    // Создаем связи между проектами и командой
    const projectTeams = await prisma.projectTeam.createMany({
      data: projectIds.map((projectId) => ({
        projectId,
        teamId,
      })),
    });

    // Получаем обновленные проекты
    const projects = await prisma.projectTeam.findMany({
      where: { teamId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            progress: true,
            budget: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Проекты успешно добавлены",
      projects: projects.map((pt) => pt.project),
      addedCount: projectTeams.count,
    });
  } catch (error) {
    console.error("Add projects error:", error);
    res.status(500).json({ error: "Не удалось добавить проекты" });
  }
});

// Бэкенд эндпоинт
app.post("/api/time-entries", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId, startTime, endTime, duration } = req.body;

    const timeEntry = await prisma.timeEntry.create({
      data: {
        taskId,
        userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration: parseInt(duration),
      },
    });

    res.status(201).json(timeEntry);
  } catch (error) {
    console.error("Create time entry error:", error);
    res.status(500).json({ error: "Failed to create time entry" });
  }
});

app.patch("/api/users/update", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const { id, role } = req.body;

    if (user.role != "MANAGER") {
      res.json({ error: "Недостаточно прав" });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { role: role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Personal team error:", error);
    res.status(500).json({ error: "Failed to fetch team" });
  }
});

app.patch("/api/teams/:teamId", authMiddleware, async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { name, description } = req.body;

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { name, description },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                createdAt: true,
              },
            },
          },
        },
        projects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
                progress: true,
                budget: true,
                startDate: true,
                endDate: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    // Преобразуем как в GET эндпоинте
    const fullTeam = {
      ...updatedTeam,
      members: updatedTeam.members.map((member) => member.user),
      projects: updatedTeam.projects.map((pt) => pt.project),
    };

    res.json(fullTeam);
  } catch (error) {
    console.error("Update team error:", error);
    res.status(500).json({ error: "Failed to update team" });
  }
});

// PATCH /api/projects/:projectId
app.patch("/api/projects/:projectId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const projectId = req.params.projectId;
    const {
      name,
      description,
      status,
      progress,
      budget,
      startDate,
      endDate,
      teamIds,
    } = req.body;

    // Проверяем права
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "MANAGER" && user?.role !== "TEAM_LEAD") {
      return res
        .status(403)
        .json({ error: "Недостаточно прав для обновления проекта" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (progress !== undefined) updateData.progress = progress;
    if (budget !== undefined) updateData.budget = budget;
    if (startDate !== undefined)
      updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined)
      updateData.endDate = endDate ? new Date(endDate) : null;

    // Если переданы teamIds, обновляем связи с командами
    if (teamIds !== undefined) {
      // Удаляем старые связи
      await prisma.projectTeam.deleteMany({
        where: { projectId },
      });

      // Создаем новые связи
      if (teamIds.length > 0) {
        updateData.teams = {
          create: teamIds.map((teamId) => ({
            team: { connect: { id: teamId } },
          })),
        };
      }
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        teams: {
          include: {
            team: {
              include: {
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const fullProject = {
      ...updatedProject,
      teams: updatedProject.teams.map((pt) => pt.team),
    };

    res.json(fullProject);
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});
// === СМЕНА СТАТУСА ЗАДАЧИ — РАБОЧАЯ ВЕРСИЯ ===
app.put("/api/tasks/:id/status", authMiddleware, async (req, res) => {
  const taskId = req.params.id; // ← оставляем как строку, НЕ parseInt!
  const { status } = req.body;

  // Проверяем, что статус валидный
  const validStatuses = ["TODO", "IN_PROGRESS", "REVIEW", "TESTING", "DONE"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Некорректный статус" });
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId }, // ← строка, всё ок
      include: {
        assignee: { select: { id: true, role: true } },
        project: {
          include: {
            teams: {
              include: {
                team: {
                  include: {
                    members: {
                      where: { role: "LEADER" },
                      select: { userId: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Задача не найдена" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, role: true },
    });

    // === Роли пользователя ===
    const isAssignee = task.assigneeId === user.id;
    const isManager = user.role === "MANAGER";

    // Является ли пользователь тимлидом хотя бы одной команды проекта?
    const teamLeaderIds =
      task.project?.teams.flatMap((pt) =>
        pt.team.members.map((m) => m.userId)
      ) || [];

    const isTeamLead = teamLeaderIds.includes(user.id);
    const isTester = user.role === "TESTER";
    const canManage = isManager || isTeamLead || isTester;

    // === Разрешённые переходы по статусам ===
    const allowedTransitions = {
      BACKLOG: ["TODO"],
      TODO: ["IN_PROGRESS"],
      IN_PROGRESS: ["REVIEW"],
      REVIEW: ["TESTING", "IN_PROGRESS"], // TESTING — принять, IN_PROGRESS — вернуть на доработку
      TESTING: ["DONE", "REVIEW"], // DONE — закрыть, REVIEW — вернуть на ревью
      DONE: [],
    };

    const allowedByRole = {
      BACKLOG: isManager || isTeamLead,
      TODO: isAssignee,
      IN_PROGRESS: isAssignee,
      REVIEW: canManage,
      TESTING: canManage,
      DONE: false,
    };

    // === Проверки ===
    if (!allowedTransitions[task.status]?.includes(status)) {
      return res.status(403).json({ error: "Такой переход статуса запрещён" });
    }

    if (!allowedByRole[task.status]) {
      return res.status(403).json({ error: "У вас нет прав на это действие" });
    }

    // === Меняем статус ===
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        assignee: { select: { name: true } },
        project: { select: { name: true } },
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error("Ошибка при смене статуса задачи:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
