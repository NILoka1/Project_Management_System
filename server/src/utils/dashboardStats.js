const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper для начала текущей недели (понедельник)
function getStartOfWeek() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Отмотать до понедельника
  now.setDate(now.getDate() - diff);
  now.setHours(0, 0, 0, 0);
  return now;
}

// Helper для начала сегодняшнего дня
function getStartOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

// 📊 СТАТИСТИКА ДЛЯ МЕНЕДЖЕРА
async function getManagerStats() {
  const startOfWeek = getStartOfWeek();
  const startOfToday = getStartOfToday();

  const [
    totalProjects,
    activeProjects,
    totalUsers,
    totalTasks,
    completedTasks,
    allTimeEntriesThisWeek,
    allTimeEntriesToday,
    allProjects,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.task.count(),
    prisma.task.count({ where: { status: "DONE" } }),
    prisma.timeEntry.findMany({ where: { startTime: { gte: startOfWeek } } }), // Все записи за неделю
    prisma.timeEntry.findMany({ where: { startTime: { gte: startOfToday } } }), // Все записи за день
    prisma.project.findMany({ select: { budget: true } }), // Все бюджеты
  ]);

  // Часы за неделю (duration в минутах -> часы)
  const hoursThisWeek =
    allTimeEntriesThisWeek.reduce(
      (total, entry) => total + (entry.duration || 0),
      0
    ) / 60;

  // Часы за сегодня
  const hoursToday =
    allTimeEntriesToday.reduce(
      (total, entry) => total + (entry.duration || 0),
      0
    ) / 60;

  // Продуктивность: % выполненных задач от всех
  const productivity =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;


  return {
    totalTasks,
    completedTasks,
    inProgressTasks: totalTasks - completedTasks,
    hoursThisWeek: Math.round(hoursThisWeek * 10) / 10, // Округление до 1 знака
    hoursToday: Math.round(hoursToday * 10) / 10,
    productivity,
    projectsCount: totalProjects,
    teamMembersCount: totalUsers,
  };
}

// 📊 СТАТИСТИКА ДЛЯ ТИМЛИДА
async function getTeamLeadStats(userId) {
  const startOfWeek = getStartOfWeek();
  const startOfToday = getStartOfToday();

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

  // Все задачи в проектах команд
  const allTasks = userTeams.flatMap((teamUser) =>
    teamUser.team.projects.flatMap((pt) => pt.project.tasks)
  );

  const completedTasks = allTasks.filter(
    (task) => task.status === "DONE"
  ).length;
  const inProgressTasks = allTasks.filter((task) =>
    ["IN_PROGRESS", "REVIEW", "TESTING"].includes(task.status)
  ).length;

  // Все timeEntries за неделю/день в задачах команд
  const timeEntriesThisWeek = allTasks.flatMap((task) =>
    task.timeEntries.filter((entry) => entry.startTime >= startOfWeek)
  );
  const timeEntriesToday = allTasks.flatMap((task) =>
    task.timeEntries.filter((entry) => entry.startTime >= startOfToday)
  );

  // Часы за неделю (в минутах -> часы)
  const hoursThisWeek =
    timeEntriesThisWeek.reduce(
      (total, entry) => total + (entry.duration || 0),
      0
    ) / 60;

  // Часы за сегодня
  const hoursToday =
    timeEntriesToday.reduce(
      (total, entry) => total + (entry.duration || 0),
      0
    ) / 60;

  // Продуктивность: % выполненных задач от всех в командах
  const totalTasks = allTasks.length;
  const productivity =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
    hoursToday: Math.round(hoursToday * 10) / 10,
    productivity,
    projectsCount,
    teamMembersCount,
    overdueTasks: allTasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        task.status !== "DONE"
    ).length,
  };
}

// 📊 СТАТИСТИКА ДЛЯ РАЗРАБОТЧИКА/ТЕСТЕРА
async function getDeveloperStats(userId) {
  const startOfWeek = getStartOfWeek();
  const startOfToday = getStartOfToday();

  const [
    userTasks,
    timeEntriesThisWeek,
    timeEntriesToday,
    activeTimerEntry,
    userProjects,
  ] = await Promise.all([
    prisma.task.findMany({
      where: {
        OR: [{ assigneeId: userId }, { creatorId: userId }],
      },
    }),
    prisma.timeEntry.findMany({
      where: {
        userId,
        startTime: { gte: startOfWeek },
      },
    }),
    prisma.timeEntry.findMany({
      where: {
        userId,
        startTime: { gte: startOfToday },
      },
    }),
    prisma.timeEntry.findFirst({
      where: {
        userId,
        endTime: null,
      },
      orderBy: { startTime: "desc" },
    }),
    prisma.project.findMany({
      where: {
        tasks: {
          some: {
            OR: [{ assigneeId: userId }, { creatorId: userId }],
          },
        },
      },
    }),
  ]);

  const completedTasks = userTasks.filter(
    (task) => task.status === "DONE"
  ).length;
  const inProgressTasks = userTasks.filter((task) =>
    ["IN_PROGRESS", "REVIEW", "TESTING"].includes(task.status)
  ).length;

  // Часы за неделю (в минутах -> часы)
  const hoursThisWeek =
    timeEntriesThisWeek.reduce(
      (total, entry) => total + (entry.duration || 0),
      0
    ) / 60;

  // Часы за сегодня
  const hoursToday =
    timeEntriesToday.reduce(
      (total, entry) => total + (entry.duration || 0),
      0
    ) / 60;

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
    hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
    hoursToday: Math.round(hoursToday * 10) / 10,
    activeTimer,
    productivity,
    projectsCount: userProjects.length,
    overdueTasks: userTasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        task.status !== "DONE"
    ).length,
  };
}

module.exports = {
  getManagerStats,
  getTeamLeadStats,
  getDeveloperStats,
};
