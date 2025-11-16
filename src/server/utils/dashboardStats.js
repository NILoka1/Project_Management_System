const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 📊 СТАТИСТИКА ДЛЯ МЕНЕДЖЕРА
async function getManagerStats() {
  const [
    totalProjects,
    activeProjects,
    totalUsers,
    totalTasks,
    completedTasks,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.task.count(),
    prisma.task.count({ where: { status: "DONE" } }),
  ]);

  return {
    totalTasks,
    completedTasks,
    inProgressTasks: totalTasks - completedTasks,
    hoursThisWeek: 240, // Заглушка
    hoursToday: 32, // Заглушка
    productivity: 75,
    projectsCount: totalProjects,
    teamMembersCount: totalUsers,
    budgetStats: {
      planned: 50000,
      used: 42000,
      remaining: 8000,
    },
  };
}

// 📊 СТАТИСТИКА ДЛЯ ТИМЛИДА
async function getTeamLeadStats(userId) {
  // Находим команды где пользователь лидер
  const userTeams = await prisma.teamUser.findMany({
    where: {
      userId: userId,
      role: "LEADER",
    },
    include: {
      team: {
        include: {
          members: {
            include: {
              user: true,
            },
          },
          projects: {
            include: {
              project: {
                include: {
                  tasks: {
                    include: {
                      timeEntries: true,
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

  const teamMembersCount = userTeams.reduce(
    (acc, teamUser) => acc + teamUser.team.members.length,
    0
  );

  const projectsCount = userTeams.reduce(
    (acc, teamUser) => acc + teamUser.team.projects.length,
    0
  );

  // Собираем задачи всех проектов команды
  const teamTasks = userTeams.flatMap((teamUser) =>
    teamUser.team.projects.flatMap((projectTeam) => projectTeam.project.tasks)
  );

  // Получаем всех членов команды
  const teamMemberIds = userTeams.flatMap((teamUser) =>
    teamUser.team.members.map((member) => member.userId)
  );

  // Временные записи команды за текущую неделю
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date();
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const teamTimeEntriesThisWeek = await prisma.timeEntry.findMany({
    where: {
      userId: {
        in: teamMemberIds,
      },
      startTime: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  // Временные записи команды за сегодня
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const teamTimeEntriesToday = await prisma.timeEntry.findMany({
    where: {
      userId: {
        in: teamMemberIds,
      },
      startTime: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  // Расчет часов команды
  const hoursThisWeek =
    teamTimeEntriesThisWeek.reduce((total, entry) => {
      return total + (entry.duration || 0);
    }, 0) / 60;

  const hoursToday =
    teamTimeEntriesToday.reduce((total, entry) => {
      return total + (entry.duration || 0);
    }, 0) / 60;

  // Статистика по задачам
  const completedTasks = teamTasks.filter(
    (task) => task.status === "DONE"
  ).length;
  const inProgressTasks = teamTasks.filter(
    (task) =>
      task.status === "IN_PROGRESS" ||
      task.status === "REVIEW" ||
      task.status === "TESTING"
  ).length;

  // Продуктивность команды = % выполненных задач
  const productivity =
    teamTasks.length > 0
      ? Math.round((completedTasks / teamTasks.length) * 100)
      : 0;

  // Просроченные задачи команды
  const overdueTasks = teamTasks.filter(
    (task) =>
      task.dueDate && task.dueDate < new Date() && task.status !== "DONE"
  ).length;

  // Бюджетная статистика (если есть бюджет у проектов)
  const budgetStats = userTeams.reduce(
    (acc, teamUser) => {
      teamUser.team.projects.forEach((projectTeam) => {
        const project = projectTeam.project;
        if (project.budget) {
          acc.planned += project.budget;
          // Здесь можно добавить логику расчета использованного бюджета
          // на основе времени или других метрик
          acc.used += project.budget * (project.progress / 100);
        }
      });
      return acc;
    },
    { planned: 0, used: 0, remaining: 0 }
  );

  budgetStats.remaining = budgetStats.planned - budgetStats.used;

  return {
    totalTasks: teamTasks.length,
    completedTasks,
    inProgressTasks,
    hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
    hoursToday: Math.round(hoursToday * 10) / 10,
    productivity,
    projectsCount,
    teamMembersCount,
    overdueTasks,
    budgetStats: budgetStats.planned > 0 ? budgetStats : undefined,
  };
}
// 📊 СТАТИСТИКА ДЛЯ РАЗРАБОТЧИКА/ТЕСТИРОВЩИКА
async function getDeveloperStats(userId) {
  // Задачи пользователя
  const userTasks = await prisma.task.findMany({
    where: {
      OR: [{ assigneeId: userId }, { creatorId: userId }],
    },
    include: {
      timeEntries: {
        where: {
          userId: userId,
        },
      },
    },
  });

  // Проекты пользователя
  const userProjects = await prisma.project.findMany({
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
  });

  // Временные записи за текущую неделю
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Начало недели (воскресенье)
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date();
  weekEnd.setDate(weekStart.getDate() + 6); // Конец недели (суббота)
  weekEnd.setHours(23, 59, 59, 999);

  const timeEntriesThisWeek = await prisma.timeEntry.findMany({
    where: {
      userId: userId,
      startTime: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  // Временные записи за сегодня
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const timeEntriesToday = await prisma.timeEntry.findMany({
    where: {
      userId: userId,
      startTime: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  // Активный таймер (последняя незавершенная запись)
  const activeTimerEntry = await prisma.timeEntry.findFirst({
    where: {
      userId: userId,
      endTime: null,
    },
    orderBy: {
      startTime: "desc",
    },
  });

  // Расчеты
  const completedTasks = userTasks.filter(
    (task) => task.status === "DONE"
  ).length;
  const inProgressTasks = userTasks.filter((task) =>
    ["IN_PROGRESS", "REVIEW", "TESTING"].includes(task.status)
  ).length;

  // Часы за неделю (в минутах, потом переводим в часы)
  const hoursThisWeek =
    timeEntriesThisWeek.reduce((total, entry) => {
      return total + (entry.duration || 0);
    }, 0) / 60;

  // Часы за сегодня
  const hoursToday =
    timeEntriesToday.reduce((total, entry) => {
      return total + (entry.duration || 0);
    }, 0) / 60;

  // Активный таймер
  let activeTimer = null;
  if (activeTimerEntry) {
    const now = new Date();
    const diffMs = now - activeTimerEntry.startTime;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    activeTimer = `${hours}:${minutes.toString().padStart(2, "0")}`;
  }

  // Продуктивность = % выполненных задач от всех назначенных задач
  const assignedTasks = userTasks.filter((task) => task.assigneeId === userId);
  const completedAssignedTasks = assignedTasks.filter(
    (task) => task.status === "DONE"
  ).length;
  const productivity =
    assignedTasks.length > 0
      ? Math.round((completedAssignedTasks / assignedTasks.length) * 100)
      : 0;

  return {
    totalTasks: userTasks.length,
    completedTasks,
    inProgressTasks,
    hoursThisWeek: Math.round(hoursThisWeek * 10) / 10, // Округление до 1 знака
    hoursToday: Math.round(hoursToday * 10) / 10,
    activeTimer,
    productivity,
    projectsCount: userProjects.length,
    overdueTasks: userTasks.filter(
      (task) =>
        task.dueDate && task.dueDate < new Date() && task.status !== "DONE"
    ).length,
  };
}

module.exports = {
  getManagerStats,
  getTeamLeadStats,
  getDeveloperStats,
};
