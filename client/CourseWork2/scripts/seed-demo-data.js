const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Запускаем заполнение демо-данными...");

  // Очищаем базу
  await prisma.timeEntry.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectTeam.deleteMany({});
  await prisma.teamUser.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("База очищена");

  // Хешируем пароль один раз — будем использовать для всех
  const hashedPassword = await bcrypt.hash("123456", 10);

  // 1. Менеджер
  const manager = await prisma.user.create({
    data: {
      email: "manager@company.com",
      name: "Анна Иванова",
      password: hashedPassword,
      role: "MANAGER",
    },
  });

  // 2. Тимлиды
  const teamLeads = await prisma.user.createMany({
    data: [
      {
        email: "lead1@company.com",
        name: "Пётр Сидоров",
        password: hashedPassword,
        role: "TEAM_LEAD",
      },
      {
        email: "lead2@company.com",
        name: "Мария Петрова",
        password: hashedPassword,
        role: "TEAM_LEAD",
      },
    ],
  });

  const lead1 = await prisma.user.findFirst({
    where: { email: "lead1@company.com" },
  });
  const lead2 = await prisma.user.findFirst({
    where: { email: "lead2@company.com" },
  });

  // 3. Разработчики и тестеры
  await prisma.user.createMany({
    data: [
      {
        email: "alex@company.com",
        name: "Алексей",
        password: hashedPassword,
        role: "DEVELOPER",
      },
      {
        email: "mike@company.com",
        name: "Михаил",
        password: hashedPassword,
        role: "DEVELOPER",
      },
      {
        email: "sophia@company.com",
        name: "София",
        password: hashedPassword,
        role: "DEVELOPER",
      },
      {
        email: "john@company.com",
        name: "Иван",
        password: hashedPassword,
        role: "DEVELOPER",
      },
      {
        email: "kate@company.com",
        name: "Екатерина",
        password: hashedPassword,
        role: "DEVELOPER",
      },
      {
        email: "dmitry@company.com",
        name: "Дмитрий",
        password: hashedPassword,
        role: "TESTER",
      },
      {
        email: "olga@company.com",
        name: "Ольга",
        password: hashedPassword,
        role: "TESTER",
      },
      {
        email: "roman@company.com",
        name: "Роман",
        password: hashedPassword,
        role: "DEVELOPER",
      },
    ],
  });

  const developers = await prisma.user.findMany({
    where: { role: { in: ["DEVELOPER", "TESTER"] } },
  });

  console.log("Создано пользователей:", 1 + 2 + developers.length);

  // 4. Команды
  const teamBackend = await prisma.team.create({
    data: { name: "Backend Team", description: "Сервер и API" },
  });
  const teamFrontend = await prisma.team.create({
    data: { name: "Frontend Team", description: "React и UI" },
  });
  const teamMobile = await prisma.team.create({
    data: { name: "Mobile Team", description: "React Native" },
  });

  // Тимлиды → команды
  await prisma.teamUser.createMany({
    data: [
      { userId: lead1.id, teamId: teamBackend.id, role: "LEADER" },
      { userId: lead2.id, teamId: teamFrontend.id, role: "LEADER" },
      { userId: lead2.id, teamId: teamMobile.id, role: "LEADER" },
    ],
  });

  // Разрабы → команды
  await prisma.teamUser.createMany({
    data: [
      ...developers
        .slice(0, 4)
        .map((u) => ({ userId: u.id, teamId: teamBackend.id, role: "MEMBER" })),
      ...developers
        .slice(2, 6)
        .map((u) => ({
          userId: u.id,
          teamId: teamFrontend.id,
          role: "MEMBER",
        })),
      ...developers
        .slice(4, 8)
        .map((u) => ({ userId: u.id, teamId: teamMobile.id, role: "MEMBER" })),
    ],
  });

  // 5. Проекты
  const projects = await prisma.project.createMany({
    data: [
      {
        name: "CRM Система",
        description: "Внутренняя CRM",
        budget: 500000,
        status: "ACTIVE",
        progress: 68,
      },
      {
        name: "Мобильное приложение",
        description: "Клиент для iOS/Android",
        budget: 380000,
        status: "ACTIVE",
        progress: 45,
      },
      {
        name: "Корпоративный портал",
        description: "Интранет",
        budget: 420000,
        status: "ON_HOLD",
        progress: 30,
      },
      {
        name: "Аналитика и BI",
        description: "Дашборды и отчёты",
        budget: 280000,
        status: "ACTIVE",
        progress: 82,
      },
      {
        name: "Рефакторинг API",
        description: "Переход на v2",
        budget: 180000,
        status: "COMPLETED",
        progress: 100,
      },
    ],
  });

  const projectList = await prisma.project.findMany();

  // Привязываем проекты к командам
  await prisma.projectTeam.createMany({
    data: [
      { projectId: projectList[0].id, teamId: teamBackend.id },
      { projectId: projectList[1].id, teamId: teamMobile.id },
      { projectId: projectList[2].id, teamId: teamFrontend.id },
      { projectId: projectList[3].id, teamId: teamBackend.id },
      { projectId: projectList[3].id, teamId: teamFrontend.id },
      { projectId: projectList[4].id, teamId: teamBackend.id },
    ],
  });

  console.log("Создано проектов и команд");

  // 6. Задачи + time entries — упрощённый, но быстрый вариант
  const taskTitles = [
    "Исправить баг с авторизацией",
    "Добавить пагинацию",
    "Написать юнит-тесты",
    "Оптимизировать запрос к БД",
    "Сверстать дашборд",
    "Настроить CI/CD",
    "Добавить валидацию формы",
    "Рефакторинг компонента",
    "Подключить аналитику",
    "Исправить утечку памяти",
    "Обновить зависимости",
    "Добавить dark mode",
  ];

  const statuses = [
    "BACKLOG",
    "TODO",
    "IN_PROGRESS",
    "REVIEW",
    "TESTING",
    "DONE",
  ];
  const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

  for (const project of projectList) {
    for (let i = 0; i < 12; i++) {
      const assignee =
        developers[Math.floor(Math.random() * developers.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const isOverdue = Math.random() > 0.8;

      await prisma.task.create({
        data: {
          title:
            taskTitles[Math.floor(Math.random() * taskTitles.length)] +
            ` #${project.id}-${i + 1}`,
          description: "Важная задача для проекта",
          status,
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          projectId: project.id,
          assigneeId: assignee.id,
          creatorId: Math.random() > 0.5 ? lead1.id : lead2.id,
          dueDate:
            isOverdue && status !== "DONE"
              ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
              : null,
        },
      });
    }
  }

  // 7. Заполняем time entries за последние 14 дней
  const tasks = await prisma.task.findMany();
  const workers = [lead1, lead2, ...developers];

  for (let day = -14; day <= 0; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);

    for (const worker of workers) {
      if (Math.random() < 0.85) {
        // 85% дней работают
        const entriesCount = Math.floor(Math.random() * 4) + 1;
        for (let e = 0; e < entriesCount; e++) {
          const task = tasks[Math.floor(Math.random() * tasks.length)];
          const minutes = Math.floor(Math.random() * 180) + 30;

          await prisma.timeEntry.create({
            data: {
              taskId: task.id,
              userId: worker.id,
              startTime: new Date(date.setHours(9 + Math.random() * 8)),
              duration: minutes,
              endTime: new Date(date.getTime() + minutes * 60 * 1000),
            },
          });
        }
      }
    }
  }

  console.log("Демо-данные успешно залиты! Можно заходить в приложение");
  console.log(
    "Логины: manager@company.com, lead1@company.com, alex@company.com и др. — пароль везде: 123456"
  );
}

main()
  .catch((e) => {
    console.error("Ошибка:", e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
