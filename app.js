(function () {
  const STORAGE_KEY = "taskflow_state_v1";

  const seed = {
    sessionEmail: null,
    users: [
      {
        id: "u1",
        name: "Alex Rivera",
        email: "alex@taskflow.local",
        password: "123456",
        role: "leader",
        avatar: "AR",
        teams: ["t1", "t2", "t3"]
      },
      {
        id: "u2",
        name: "Sarah Lima",
        email: "sarah@taskflow.local",
        password: "123456",
        role: "member",
        avatar: "SL",
        teams: ["t1", "t3"]
      },
      {
        id: "u3",
        name: "Mike Santos",
        email: "mike@taskflow.local",
        password: "123456",
        role: "member",
        avatar: "MS",
        teams: ["t2"]
      },
      {
        id: "u4",
        name: "Aline Costa",
        email: "aline@taskflow.local",
        password: "123456",
        role: "member",
        avatar: "AC",
        teams: ["t1", "t4"]
      }
    ],
    teams: [
      { id: "t1", name: "RH", parentId: null, members: ["u1", "u2", "u4"] },
      { id: "t2", name: "TI", parentId: null, members: ["u1", "u3"] },
      { id: "t3", name: "Marketing", parentId: null, members: ["u1", "u2"] },
      { id: "t4", name: "TI / Suporte", parentId: "t2", members: ["u1", "u4"] }
    ],
    projects: [
      {
        id: "p1",
        name: "Mobile App Launch",
        teamId: "t2",
        ownerId: "u1",
        deadline: "2026-07-22",
        description: "Lançamento da nova interface de tarefas e notificações.",
        status: "Em andamento"
      },
      {
        id: "p2",
        name: "Campanha Employer Branding",
        teamId: "t3",
        ownerId: "u1",
        deadline: "2026-07-18",
        description: "Conteúdo e apoio às ações de atração de talentos.",
        status: "Em andamento"
      }
    ],
    tasks: [
      {
        id: "task1",
        title: "Finalizar UI de login",
        description: "Aprimorar o fluxo inicial com validação e mensagens claras.",
        responsibleId: "u2",
        teamId: "t2",
        projectId: "p1",
        dueDate: "2026-07-08",
        status: "Em Desenvolvimento",
        technologies: ["HTML", "CSS", "JavaScript"],
        comments: [
          {
            authorId: "u1",
            text: "Foco em acessibilidade e feedback visual.",
            createdAt: "2026-07-02T09:10:00"
          }
        ],
        attachments: ["wireframe-login.png"],
        history: [
          { text: "Tarefa criada por Alex Rivera.", createdAt: "2026-07-01T14:00:00" },
          { text: "Responsável alterado para Sarah Lima.", createdAt: "2026-07-02T09:00:00" }
        ]
      },
      {
        id: "task2",
        title: "Cadastrar usuários da equipe",
        description: "Criar formulário para que o líder cadastre novos membros e defina equipes.",
        responsibleId: "u1",
        teamId: "t1",
        projectId: null,
        dueDate: "2026-07-06",
        status: "A Fazer",
        technologies: ["JavaScript", "LocalStorage"],
        comments: [],
        attachments: [],
        history: [{ text: "Tarefa criada por Alex Rivera.", createdAt: "2026-07-01T12:30:00" }]
      },
      {
        id: "task3",
        title: "Configurar dashboard de produtividade",
        description: "Exibir indicadores com cartões, listas e gráfico resumido por equipe.",
        responsibleId: "u3",
        teamId: "t2",
        projectId: "p1",
        dueDate: "2026-07-04",
        status: "Em Revisão",
        technologies: ["SVG", "JS", "CSS Grid"],
        comments: [
          {
            authorId: "u1",
            text: "Vamos incluir tarefas atrasadas e percentual por projeto.",
            createdAt: "2026-07-03T11:20:00"
          }
        ],
        attachments: ["dashboard-spec.pdf"],
        history: [{ text: "Tarefa criada por Alex Rivera.", createdAt: "2026-07-01T08:20:00" }]
      },
      {
        id: "task4",
        title: "Montar calendário da campanha",
        description: "Planejar publicações, datas e responsáveis de peças da campanha.",
        responsibleId: "u4",
        teamId: "t3",
        projectId: "p2",
        dueDate: "2026-07-20",
        status: "A Fazer",
        technologies: ["Planejamento", "Copywriting"],
        comments: [],
        attachments: [],
        history: [{ text: "Tarefa criada por Alex Rivera.", createdAt: "2026-07-02T10:00:00" }]
      },
      {
        id: "task5",
        title: "Revisar acessos da subequipe",
        description: "Garantir que os membros vejam apenas as equipes permitidas.",
        responsibleId: "u1",
        teamId: "t4",
        projectId: null,
        dueDate: "2026-07-05",
        status: "Concluída",
        technologies: ["Segurança", "Permissões"],
        comments: [],
        attachments: [],
        history: [{ text: "Tarefa criada por Alex Rivera.", createdAt: "2026-07-01T09:05:00" }]
      }
    ],
    notifications: [
      {
        id: "n1",
        userId: "u2",
        text: "Você recebeu a tarefa 'Finalizar UI de login'.",
        createdAt: "2026-07-02T09:00:00",
        read: false,
        type: "task"
      },
      {
        id: "n2",
        userId: "u3",
        text: "Há uma tarefa perto do vencimento: 'Configurar dashboard de produtividade'.",
        createdAt: "2026-07-04T07:10:00",
        read: false,
        type: "deadline"
      }
    ],
    ui: {
      page: "dashboard",
      taskFilter: "all",
      projectFilter: "all",
      teamFilter: "all",
      selectedTaskId: "task1",
      activeNotificationsFor: null
    }
  };

  const app = document.getElementById("app");
  let state = loadState();
  let notificationTimer = null;
  let toastTimer = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(seed);
      const parsed = JSON.parse(raw);
      return {
        ...structuredClone(seed),
        ...parsed,
        ui: { ...structuredClone(seed.ui), ...(parsed.ui || {}) }
      };
    } catch {
      return structuredClone(seed);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function currentUser() {
    return state.users.find((user) => user.email === state.sessionEmail) || null;
  }

  function isLeader(user = currentUser()) {
    return Boolean(user && user.role === "leader");
  }

  function visibleTeamIdsFor(user = currentUser()) {
    if (!user) return [];
    if (isLeader(user)) return state.teams.map((team) => team.id);
    return user.teams;
  }

  function visibleTasksFor(user = currentUser()) {
    const visibleTeams = visibleTeamIdsFor(user);
    if (isLeader(user)) return [...state.tasks];
    return state.tasks.filter((task) => visibleTeams.includes(task.teamId));
  }

  function visibleProjectsFor(user = currentUser()) {
    if (isLeader(user)) return [...state.projects];
    const allowedTeams = visibleTeamIdsFor(user);
    return state.projects.filter((project) => allowedTeams.includes(project.teamId));
  }

  function getUser(id) {
    return state.users.find((user) => user.id === id);
  }

  function getTeam(id) {
    return state.teams.find((team) => team.id === id);
  }

  function getProject(id) {
    return state.projects.find((project) => project.id === id);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function initials(name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase();
  }

  function formatDate(value) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(value));
  }

  function formatDateTime(value) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  }

  function statusClass(status) {
    if (status === "Concluída") return "good";
    if (status === "Em Desenvolvimento" || status === "Em Revisão") return "warn";
    if (status === "Cancelada") return "danger";
    return "";
  }

  function taskIsOverdue(task) {
    return ["Concluída", "Cancelada"].includes(task.status) ? false : new Date(task.dueDate + "T23:59:59") < new Date();
  }

  function taskIsDueSoon(task) {
    if (["Concluída", "Cancelada"].includes(task.status)) return false;
    const diff = new Date(task.dueDate + "T23:59:59") - new Date();
    return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 2;
  }

  function projectProgress(project) {
    const tasks = state.tasks.filter((task) => task.projectId === project.id);
    if (!tasks.length) return 0;
    const done = tasks.filter((task) => task.status === "Concluída").length;
    return Math.round((done / tasks.length) * 100);
  }

  function unreadCountFor(user) {
    if (!user) return 0;
    return state.notifications.filter((item) => item.userId === user.id && !item.read).length;
  }

  function notify(userId, text, type = "info") {
    state.notifications.unshift({
      id: crypto.randomUUID(),
      userId,
      text,
      createdAt: new Date().toISOString(),
      read: false,
      type
    });
  }

  function pushToast(title, subtitle) {
    const stack = ensureToastStack();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<strong>${escapeHtml(title)}</strong><div><small>${escapeHtml(subtitle || "")}</small></div>`;
    stack.appendChild(toast);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.remove();
    }, 3200);
  }

  function ensureToastStack() {
    let stack = document.querySelector(".toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      document.body.appendChild(stack);
    }
    return stack;
  }

  function render() {
    const user = currentUser();
    if (!user) {
      app.innerHTML = renderLogin();
      attachLoginHandlers();
      stopRealtimeChecks();
      saveState();
      return;
    }

    app.innerHTML = renderShell(user);
    bindShellHandlers();
    scheduleRealtimeChecks();
    saveState();
  }

  function renderLogin() {
    return `
      <div class="app-shell">
        <div class="login-wrap">
          <section class="hero-card">
            <div class="brand-badge">
              <div class="brand-mark">TF</div>
              <div class="brand-text">TaskFlow</div>
            </div>
            <div class="hero-copy">
              <span class="eyebrow">Gestão de equipes, tarefas e projetos</span>
              <h1>Organize o trabalho com clareza, rastreio e colaboração.</h1>
              <p>
                A interface reúne login, equipes com subequipes, projetos, tarefas, comentários, anexos,
                notificações em tempo real e dashboard de produtividade em uma experiência local e leve.
              </p>
              <div class="hero-highlights">
                <div class="highlight-card">
                  <strong>2 perfis</strong>
                  <span>Líder para gestão completa e Membro para foco na execução e status.</span>
                </div>
                <div class="highlight-card">
                  <strong>Fluxo completo</strong>
                  <span>Histórico, menções, anexos, notificações e visibilidade por equipe.</span>
                </div>
              </div>
            </div>
          </section>
          <section class="login-card">
            <h2>Entrar no TaskFlow</h2>
            <p>Use e-mail e senha para acessar a sua área.</p>
            <form id="loginForm" class="field-grid">
              <div class="field">
                <label for="email">E-mail</label>
                <input id="email" name="email" type="email" placeholder="alex@taskflow.local" required />
              </div>
              <div class="field">
                <label for="password">Senha</label>
                <input id="password" name="password" type="password" placeholder="123456" required />
              </div>
              <button class="btn btn-primary" type="submit">Acessar</button>
            </form>
            <div class="helper-row">
              <span class="muted">Contas de demonstração</span>
              <button class="btn btn-ghost" type="button" data-action="fill-demo">Preencher exemplos</button>
            </div>
            <div class="quick-login">
              <div class="quick-pills">
                <span class="pill">Líder: alex@taskflow.local</span>
                <span class="pill">Senha: 123456</span>
              </div>
              <div class="quick-pills">
                <span class="pill">Membro: sarah@taskflow.local</span>
                <span class="pill">Senha: 123456</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  function renderShell(user) {
    const unread = unreadCountFor(user);
    const visibleTasks = visibleTasksFor(user);
    const currentPage = state.ui.page;
    return `
      <div class="app-shell">
        <div class="app-frame">
          <aside class="sidebar">
            <div class="brand-badge">
              <div class="brand-mark">TF</div>
              <div class="brand-text">TaskFlow</div>
            </div>
            <nav class="sidebar-nav">
              ${navButton("dashboard", "Dashboard", "◫")}
              ${navButton("tasks", "Tarefas", "▣")}
              ${navButton("projects", "Projetos", "◆")}
              ${navButton("teams", "Equipes", "◌")}
              ${navButton("notifications", "Notificações", "◔", unread)}
              ${isLeader(user) ? navButton("users", "Usuários", "◉") : ""}
            </nav>
            <div></div>
            <div class="sidebar-foot">
              <div class="user-chip">
                <div class="avatar">${escapeHtml(user.avatar)}</div>
                <div>
                  <strong>${escapeHtml(user.name)}</strong>
                  <div class="muted">${user.role === "leader" ? "Líder / Administrador" : "Membro da equipe"}</div>
                </div>
              </div>
            </div>
          </aside>

          <section class="content">
            <header class="topbar">
              <div class="topbar-left">
                <div>
                  <strong>Bem-vindo, ${escapeHtml(user.name.split(" ")[0])}</strong>
                  <div class="muted">${visibleTasks.length} tarefas visíveis no seu contexto de equipe</div>
                </div>
              </div>
              <div class="topbar-right">
                <div class="search-box">
                  <span class="search-icon">⌕</span>
                  <input id="searchInput" type="search" placeholder="Buscar tarefas, projetos, equipes..." value="${escapeHtml(state.ui.search || "")}" />
                </div>
                <button class="btn btn-secondary notification-badge" data-action="open-notifications">
                  Notificações
                  ${unread ? `<span class="notification-dot"></span>` : ""}
                </button>
                <button class="btn btn-secondary" data-action="logout">Sair</button>
              </div>
            </header>
            <main class="main">
              ${renderPage(user, currentPage)}
            </main>
          </section>
        </div>
      </div>
      <div id="overlay" class="overlay"></div>
    `;
  }

  function navButton(page, label, icon, count = 0) {
    const active = state.ui.page === page ? "active" : "";
    const badge = count ? `<span class="count-pill">${count}</span>` : "";
    return `
      <button class="nav-btn ${active}" data-action="go-page" data-page="${page}">
        <span class="nav-label"><span class="nav-icon">${icon}</span> ${label}</span>
        ${badge}
      </button>
    `;
  }

  function renderPage(user, page) {
    switch (page) {
      case "tasks":
        return renderTasksPage(user);
      case "projects":
        return renderProjectsPage(user);
      case "teams":
        return renderTeamsPage(user);
      case "notifications":
        return renderNotificationsPage(user);
      case "users":
        return renderUsersPage(user);
      default:
        return renderDashboardPage(user);
    }
  }

  function renderDashboardPage(user) {
    const tasks = visibleTasksFor(user);
    const projects = visibleProjectsFor(user);
    const completed = tasks.filter((task) => task.status === "Concluída").length;
    const inProgress = tasks.filter((task) => ["Em Desenvolvimento", "Em Revisão"].includes(task.status)).length;
    const overdue = tasks.filter(taskIsOverdue).length;
    const dueSoon = tasks.filter(taskIsDueSoon).length;
    const byTeam = groupCount(tasks, (task) => getTeam(task.teamId)?.name || "Sem equipe");
    const byResponsible = groupCount(tasks, (task) => getUser(task.responsibleId)?.name || "Sem responsável");
    const byProject = groupCount(tasks, (task) => getProject(task.projectId)?.name || "Sem projeto");
    return `
      <section class="page active">
        <div class="page-header">
          <div class="page-title">
            <h1>Dashboard de produtividade</h1>
            <p>Resumo operacional com indicadores, distribuição e progresso dos projetos.</p>
          </div>
          <div class="action-row">
            <button class="btn btn-primary" data-action="go-page" data-page="tasks">Ver tarefas</button>
            ${isLeader(user) ? `<button class="btn btn-secondary" data-action="open-task-form">Nova tarefa</button>` : ""}
          </div>
        </div>

        <div class="panel-grid dashboard-grid">
          ${statCard("Tarefas concluídas", completed, "meta do fluxo")}
          ${statCard("Em andamento", inProgress, "A Fazer, Em Desenvolvimento e Revisão")}
          ${statCard("Atrasadas", overdue, "Prazo já expirado")}
          ${statCard("Próximas do vencimento", dueSoon, "Vencem em até 48h")}

          <article class="card chart-card">
            ${chartHeader("Tarefas por responsável", "Distribuição dos pontos de trabalho")}
            ${renderBarChart(byResponsible)}
          </article>

          <article class="card chart-card">
            ${chartHeader("Tarefas por equipe", "Escopo visível no seu contexto")}
            ${renderBarChart(byTeam)}
          </article>

          <article class="card chart-card wide">
            ${chartHeader("Projetos", "Percentual de conclusão por projeto")}
            <div class="chart-list">
              ${projects.length ? projects.map((project) => {
                const progress = projectProgress(project);
                return `
                  <div class="chart-row">
                    <div>
                      <strong>${escapeHtml(project.name)}</strong>
                      <div class="muted">${escapeHtml(getTeam(project.teamId)?.name || "-")} | prazo ${formatDate(project.deadline)}</div>
                    </div>
                    <div class="bar"><span style="width:${progress}%"></span></div>
                    <strong>${progress}%</strong>
                  </div>
                `;
              }).join("") : `<div class="empty-state">Nenhum projeto visível.</div>`}
            </div>
          </article>

          <article class="card chart-card wide">
            ${chartHeader("Tarefas por projeto", "Leitura rápida do esforço vinculado a cada projeto")}
            ${renderBarChart(byProject)}
          </article>
        </div>
      </section>
    `;
  }

  function statCard(label, value, note) {
    return `
      <article class="card stat-card">
        <div class="stat-value">${value}</div>
        <div class="stat-label">${escapeHtml(label)}</div>
        <p class="muted">${escapeHtml(note)}</p>
      </article>
    `;
  }

  function chartHeader(title, subtitle) {
    return `
      <div class="chart-header">
        <div>
          <h3>${escapeHtml(title)}</h3>
          <div class="muted">${escapeHtml(subtitle)}</div>
        </div>
      </div>
    `;
  }

  function renderBarChart(groups) {
    const entries = Object.entries(groups);
    if (!entries.length) return `<div class="empty-state">Sem dados para exibir.</div>`;
    const max = Math.max(...entries.map(([, count]) => count), 1);
    return `
      <div class="chart-list">
        ${entries.map(([label, count]) => `
          <div class="chart-row">
            <strong>${escapeHtml(label)}</strong>
            <div class="bar"><span style="width:${Math.max(8, (count / max) * 100)}%"></span></div>
            <strong>${count}</strong>
          </div>
        `).join("")}
      </div>
    `;
  }

  function groupCount(items, getter) {
    return items.reduce((acc, item) => {
      const label = getter(item);
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
  }

  function renderTasksPage(user) {
    const tasks = filteredTasks(user);
    const grouped = {
      "A Fazer": tasks.filter((task) => task.status === "A Fazer"),
      "Em Desenvolvimento": tasks.filter((task) => task.status === "Em Desenvolvimento"),
      "Em Revisão": tasks.filter((task) => task.status === "Em Revisão"),
      "Concluída": tasks.filter((task) => task.status === "Concluída")
    };
    return `
      <section class="page active">
        <div class="page-header">
          <div class="page-title">
            <h1>Tarefas</h1>
            <p>Visualização do fluxo, com acesso restrito ao contexto de equipe do usuário.</p>
            ${state.ui.projectFilter !== "all" ? `
              <div class="chip-row" style="margin-top:10px;">
                <span class="chip brand">Filtro de projeto: ${escapeHtml(getProject(state.ui.projectFilter)?.name || "")}</span>
                <button class="btn btn-secondary" data-action="clear-project-filter">Limpar filtro</button>
              </div>
            ` : ""}
          </div>
          <div class="action-row">
            <div class="tabs">
              ${taskTab("all", "Todas")}
              ${taskTab("mine", "Minhas")}
              ${taskTab("late", "Atrasadas")}
            </div>
            ${isLeader(user) ? `<button class="btn btn-primary" data-action="open-task-form">Nova tarefa</button>` : ""}
          </div>
        </div>
        <div class="board">
          ${Object.entries(grouped).map(([status, items]) => `
            <div class="board-column">
              <h3>${escapeHtml(status)} <span class="count-pill">${items.length}</span></h3>
              ${items.length ? items.map((task) => renderTaskCard(task, user)).join("") : `<div class="empty-state">Sem tarefas aqui.</div>`}
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  function taskTab(value, label) {
    const active = state.ui.taskFilter === value ? "active" : "";
    return `<button class="tab-btn ${active}" data-action="set-task-filter" data-value="${value}">${escapeHtml(label)}</button>`;
  }

  function renderTaskCard(task, user) {
    const responsible = getUser(task.responsibleId);
    const project = getProject(task.projectId);
    const overdue = taskIsOverdue(task);
    return `
      <article class="task-card" data-task-id="${task.id}">
        <header>
          <div>
            <h4>${escapeHtml(task.title)}</h4>
            <div class="chip-row">
              <span class="chip ${statusClass(task.status)}">${escapeHtml(task.status)}</span>
              ${project ? `<span class="chip brand">${escapeHtml(project.name)}</span>` : `<span class="chip">Sem projeto</span>`}
            </div>
          </div>
          <button class="btn btn-ghost" data-action="open-task" data-task-id="${task.id}">Abrir</button>
        </header>
        <p class="task-desc">${escapeHtml(task.description)}</p>
        <div class="task-meta">
          <span class="chip">${escapeHtml(getTeam(task.teamId)?.name || "-")}</span>
          <span class="chip">${escapeHtml(responsible ? responsible.name : "-")}</span>
          <span class="chip ${overdue ? "danger" : "brand"}">${overdue ? "Atrasada" : formatDate(task.dueDate)}</span>
        </div>
        <div class="chip-row">
          ${(task.technologies || []).slice(0, 4).map((tech) => `<span class="chip">${escapeHtml(tech)}</span>`).join("")}
        </div>
        <div class="inline-actions">
          ${(isLeader(user) || user.id === task.responsibleId) ? renderStatusQuickActions(task, user) : ""}
        </div>
      </article>
    `;
  }

  function renderStatusQuickActions(task, user) {
    const editable = user.id === task.responsibleId;
    const current = task.status;
    return `
      <select data-action="quick-status" data-task-id="${task.id}" ${editable ? "" : "disabled"} title="${editable ? "Alterar status" : "Apenas o responsável pode alterar o status"}">
        ${["A Fazer", "Em Desenvolvimento", "Em Revisão", "Concluída", "Cancelada"].map((status) => `
          <option value="${status}" ${status === current ? "selected" : ""}>${status}</option>
        `).join("")}
      </select>
    `;
  }

  function filteredTasks(user) {
    const search = (state.ui.search || "").trim().toLowerCase();
    let tasks = visibleTasksFor(user);
    if (state.ui.projectFilter && state.ui.projectFilter !== "all") {
      tasks = tasks.filter((task) => task.projectId === state.ui.projectFilter);
    }
    if (state.ui.taskFilter === "mine") {
      tasks = tasks.filter((task) => task.responsibleId === user.id);
    } else if (state.ui.taskFilter === "late") {
      tasks = tasks.filter(taskIsOverdue);
    }
    if (search) {
      tasks = tasks.filter((task) => {
        const project = getProject(task.projectId)?.name || "";
        const responsible = getUser(task.responsibleId)?.name || "";
        const team = getTeam(task.teamId)?.name || "";
        return [task.title, task.description, project, responsible, team].some((field) =>
          field.toLowerCase().includes(search)
        );
      });
    }
    return tasks;
  }

  function renderProjectsPage(user) {
    const projects = filteredProjects(user);
    return `
      <section class="page active">
        <div class="page-header">
          <div class="page-title">
            <h1>Projetos</h1>
            <p>Projetos vinculam tarefas e deixam o andamento visível em percentual.</p>
          </div>
          ${isLeader(user) ? `<button class="btn btn-primary" data-action="open-project-form">Novo projeto</button>` : ""}
        </div>
        <div class="two-col">
          <article class="card list-card">
            <div class="section-header">
              <h3>Lista de projetos</h3>
              <span class="muted">${projects.length} visíveis</span>
            </div>
            <div class="list-table">
              ${projects.length ? projects.map((project) => renderProjectItem(project)).join("") : `<div class="empty-state">Nenhum projeto visível.</div>`}
            </div>
          </article>
          <article class="card list-card">
            <div class="section-header">
              <h3>Mapa de tarefas</h3>
              <span class="muted">Por projeto</span>
            </div>
            <div class="stack">
              ${projects.length ? projects.map((project) => {
                const tasks = visibleTasksFor(user).filter((task) => task.projectId === project.id);
                return `
                  <div class="mini-card">
                    <strong>${escapeHtml(project.name)}</strong>
                    <div class="muted">${tasks.length} tarefa(s) vinculada(s)</div>
                    <div class="bar" style="margin-top:10px;"><span style="width:${projectProgress(project)}%"></span></div>
                  </div>
                `;
              }).join("") : `<div class="empty-state">Sem dados suficientes.</div>`}
            </div>
          </article>
        </div>
      </section>
    `;
  }

  function filteredProjects(user) {
    const search = (state.ui.search || "").trim().toLowerCase();
    let projects = visibleProjectsFor(user);
    if (search) {
      projects = projects.filter((project) =>
        [project.name, project.description, getTeam(project.teamId)?.name || ""].some((field) =>
          field.toLowerCase().includes(search)
        )
      );
    }
    return projects;
  }

  function renderProjectItem(project) {
    const team = getTeam(project.teamId);
    const progress = projectProgress(project);
    return `
      <div class="project-item">
        <div class="project-item-main">
          <div class="project-title-block">
            <strong>${escapeHtml(project.name)}</strong>
            <span class="chip brand">Projeto</span>
          </div>
          <p class="project-desc">${escapeHtml(project.description)}</p>
          <div class="chip-row">
            <span class="chip">${escapeHtml(team?.name || "-")}</span>
            <span class="chip">${formatDate(project.deadline)}</span>
            <span class="chip ${progress === 100 ? "good" : progress >= 50 ? "warn" : ""}">${progress}% concluído</span>
          </div>
        </div>
        <div class="project-item-meta">
          <div class="project-metric">
            <span class="muted">Equipe</span>
            <strong>${escapeHtml(team?.name || "-")}</strong>
          </div>
          <div class="project-metric">
            <span class="muted">Prazo</span>
            <strong>${formatDate(project.deadline)}</strong>
          </div>
          <div class="project-metric">
            <span class="muted">Conclusão</span>
            <strong>${progress}%</strong>
          </div>
          <div class="project-action">
            <button class="btn btn-ghost" data-action="open-task-filter-project" data-project-id="${project.id}">Ver tarefas</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderTeamsPage(user) {
    const teams = filteredTeams(user);
    return `
      <section class="page active">
        <div class="page-header">
          <div class="page-title">
            <h1>Equipes e subequipes</h1>
            <p>Estrutura hierárquica com controle de acesso por pertencimento.</p>
          </div>
          ${isLeader(user) ? `<div class="action-row"><button class="btn btn-primary" data-action="open-team-form">Nova equipe</button><button class="btn btn-secondary" data-action="open-subteam-form">Nova subequipe</button></div>` : ""}
        </div>
        <div class="three-col">
          ${teams.map((team) => renderTeamCard(team)).join("")}
        </div>
      </section>
    `;
  }

  function filteredTeams(user) {
    const search = (state.ui.search || "").trim().toLowerCase();
    let teams = isLeader(user) ? [...state.teams] : state.teams.filter((team) => user.teams.includes(team.id));
    if (search) {
      teams = teams.filter((team) => team.name.toLowerCase().includes(search));
    }
    return teams;
  }

  function renderTeamCard(team) {
    const members = team.members.map((memberId) => getUser(memberId)).filter(Boolean);
    const parent = team.parentId ? getTeam(team.parentId) : null;
    return `
      <article class="card list-card">
        <div class="section-header">
          <h3>${escapeHtml(team.name)}</h3>
          ${parent ? `<span class="chip brand">Subequipe de ${escapeHtml(parent.name)}</span>` : `<span class="chip">Equipe principal</span>`}
        </div>
        <div class="stack">
          <div class="mini-card">
            <strong>${members.length}</strong>
            <div class="muted">membro(s)</div>
          </div>
          <div class="mini-card">
            <div class="muted">Integrantes</div>
            <div class="chip-row" style="margin-top:8px;">
              ${members.map((member) => `<span class="chip">${escapeHtml(member.name)}</span>`).join("")}
            </div>
          </div>
          <div class="mini-card">
            <div class="muted">Ações</div>
            <div class="inline-actions" style="margin-top:8px;">
              <button class="btn btn-ghost" data-action="manage-team" data-team-id="${team.id}">Gerenciar</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderNotificationsPage(user) {
    const notices = state.notifications.filter((item) => item.userId === user.id);
    return `
      <section class="page active">
        <div class="page-header">
          <div class="page-title">
            <h1>Central de notificações</h1>
            <p>Alertas sobre tarefas, menções, anexos, prazos e alterações relevantes.</p>
          </div>
          <button class="btn btn-secondary" data-action="mark-all-read">Marcar tudo como lido</button>
        </div>
        <article class="card list-card">
          <div class="notice-list">
            ${notices.length ? notices.map((item) => `
              <div class="notice-item ${item.read ? "" : "unread"}">
                <strong>${escapeHtml(item.text)}</strong>
                <small>${formatDateTime(item.createdAt)} · ${escapeHtml(item.type)}</small>
              </div>
            `).join("") : `<div class="empty-state">Você ainda não recebeu notificações.</div>`}
          </div>
        </article>
      </section>
    `;
  }

  function renderUsersPage(user) {
    const users = isLeader(user) ? [...state.users] : [user];
    return `
      <section class="page active">
        <div class="page-header">
          <div class="page-title">
            <h1>Usuários</h1>
            <p>Cadastro exclusivo do Líder com vínculo a equipes e subequipes.</p>
          </div>
          ${isLeader(user) ? `<button class="btn btn-primary" data-action="open-user-form">Novo usuário</button>` : ""}
        </div>
        <article class="card list-card">
          <div class="list-table">
            ${users.map((item) => renderUserItem(item)).join("")}
          </div>
        </article>
      </section>
    `;
  }

  function renderUserItem(item) {
    const teams = item.teams.map((teamId) => getTeam(teamId)?.name).filter(Boolean);
    return `
      <div class="list-item">
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <small>${escapeHtml(item.email)}</small>
        </div>
        <div>
          <strong>${escapeHtml(item.role === "leader" ? "Líder" : "Membro")}</strong>
          <small>Perfil</small>
        </div>
        <div>
          <strong>${teams.length}</strong>
          <small>Equipes</small>
        </div>
        <div>
          <strong>${teams.join(", ") || "-"}</strong>
          <small>Vínculos</small>
        </div>
        <div class="inline-actions">
          ${isLeader(currentUser()) ? `<button class="btn btn-ghost" data-action="manage-user" data-user-id="${item.id}">Editar</button>` : ""}
        </div>
      </div>
    `;
  }

  function attachLoginHandlers() {
    const form = document.getElementById("loginForm");
    const fillBtn = document.querySelector('[data-action="fill-demo"]');
    if (fillBtn) {
      fillBtn.addEventListener("click", () => {
        const email = document.getElementById("email");
        const password = document.getElementById("password");
        email.value = "alex@taskflow.local";
        password.value = "123456";
      });
    }
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const email = String(formData.get("email") || "").trim().toLowerCase();
        const password = String(formData.get("password") || "");
        const user = state.users.find((item) => item.email.toLowerCase() === email && item.password === password);
        if (!user) {
          pushToast("Credenciais inválidas", "Verifique e-mail e senha.");
          return;
        }
        state.sessionEmail = user.email;
        state.ui.page = "dashboard";
        state.ui.taskFilter = "all";
        pushToast("Login realizado", `Bem-vindo, ${user.name}.`);
        render();
      });
    }
  }

  function bindShellHandlers() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (event) => {
        state.ui.search = event.target.value;
        render();
      });
    }

    document.querySelectorAll("[data-action]").forEach((element) => {
      element.addEventListener("click", handleAction);
    });

    document.querySelectorAll("[data-action='quick-status']").forEach((select) => {
      select.addEventListener("change", (event) => {
        updateTaskStatus(event.target.dataset.taskId, event.target.value);
      });
    });

    const overlay = document.getElementById("overlay");
    if (overlay) {
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeOverlay();
      });
    }
  }

  function handleAction(event) {
    const action = event.currentTarget.dataset.action;
    const page = event.currentTarget.dataset.page;
    const value = event.currentTarget.dataset.value;
    const taskId = event.currentTarget.dataset.taskId;
    const teamId = event.currentTarget.dataset.teamId;
    const projectId = event.currentTarget.dataset.projectId;
    const userId = event.currentTarget.dataset.userId;

    switch (action) {
      case "go-page":
        state.ui.page = page;
        render();
        break;
      case "logout":
        state.sessionEmail = null;
        state.ui.activeNotificationsFor = null;
        render();
        break;
      case "set-task-filter":
        state.ui.taskFilter = value;
        render();
        break;
      case "open-task":
        openTaskModal(taskId);
        break;
      case "open-task-form":
        openTaskForm();
        break;
      case "open-project-form":
        openProjectForm();
        break;
      case "open-team-form":
        openTeamForm(false);
        break;
      case "open-subteam-form":
        openTeamForm(true);
        break;
      case "open-user-form":
        openUserForm();
        break;
      case "manage-team":
        openManageTeam(teamId);
        break;
      case "manage-user":
        openManageUser(userId);
        break;
      case "mark-all-read":
        markAllRead(currentUser().id);
        render();
        break;
      case "open-notifications":
        state.ui.page = "notifications";
        render();
        break;
      case "open-task-filter-project":
        state.ui.page = "tasks";
        state.ui.taskFilter = "all";
        state.ui.projectFilter = projectId;
        render();
        break;
      case "clear-project-filter":
        state.ui.projectFilter = "all";
        render();
        break;
      default:
        break;
    }
  }

  function openOverlay(content) {
    const overlay = document.getElementById("overlay");
    overlay.innerHTML = `
      <div class="modal">
        ${content}
      </div>
    `;
    overlay.classList.add("active");
    bindModalHandlers(overlay);
  }

  function closeOverlay() {
    const overlay = document.getElementById("overlay");
    if (!overlay) return;
    overlay.classList.remove("active");
    overlay.innerHTML = "";
  }

  function bindModalHandlers(overlay) {
    overlay.querySelectorAll("[data-close-modal]").forEach((button) => {
      button.addEventListener("click", closeOverlay);
    });
    overlay.querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const action = form.dataset.formAction;
        const formData = new FormData(form);
        if (action === "task") handleTaskForm(formData, form);
        if (action === "project") handleProjectForm(formData, form);
        if (action === "team") handleTeamForm(formData, form);
        if (action === "user") handleUserForm(formData, form);
        if (action === "team-manage") handleTeamManage(formData, form);
        if (action === "user-manage") handleUserManage(formData, form);
      });
    });
    overlay.querySelectorAll("[data-action='add-comment']").forEach((button) => {
      button.addEventListener("click", () => addComment(button.dataset.taskId));
    });
    overlay.querySelectorAll("[data-action='add-attachment']").forEach((button) => {
      button.addEventListener("click", () => addAttachment(button.dataset.taskId));
    });
    overlay.querySelectorAll("[data-action='delete-task']").forEach((button) => {
      button.addEventListener("click", () => deleteTask(button.dataset.taskId));
    });
    overlay.querySelectorAll("[data-action='save-task-inline']").forEach((button) => {
      button.addEventListener("click", () => saveTaskInline(button.dataset.taskId));
    });
  }

  function openTaskModal(taskId) {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return;
    state.ui.selectedTaskId = taskId;
    const user = currentUser();
    const responsible = getUser(task.responsibleId);
    const project = getProject(task.projectId);
    const canEditAdmin = isLeader(user);
    const canChangeStatus = user.id === task.responsibleId;
    const teamOptions = visibleTeamIdsFor(user).map((teamId) => {
      const team = getTeam(teamId);
      return `<option value="${team.id}" ${team.id === task.teamId ? "selected" : ""}>${escapeHtml(team.name)}</option>`;
    }).join("");
    const projectOptions = visibleProjectsFor(user).map((projectItem) => {
      return `<option value="${projectItem.id}" ${projectItem.id === task.projectId ? "selected" : ""}>${escapeHtml(projectItem.name)}</option>`;
    }).join("");
    const responsibleOptions = state.users
      .filter((item) => item.role === "leader" || visibleTeamIdsFor(user).some((teamId) => item.teams.includes(teamId)))
      .map((item) => `<option value="${item.id}" ${item.id === task.responsibleId ? "selected" : ""}>${escapeHtml(item.name)}</option>`)
      .join("");
    openOverlay(`
      <div class="modal-header">
        <div>
          <h2 style="margin:0;">${escapeHtml(task.title)}</h2>
          <div class="muted">${escapeHtml(getTeam(task.teamId)?.name || "-")} · ${project ? escapeHtml(project.name) : "Sem projeto"}</div>
        </div>
        <button class="btn btn-ghost" data-close-modal>Fechar</button>
      </div>
      <div class="modal-body">
        <div class="modal-grid">
          <div class="detail-pane">
            <article class="mini-card">
              <div class="section-header">
                <h3>Dados da tarefa</h3>
                <span class="chip ${statusClass(task.status)}">${escapeHtml(task.status)}</span>
              </div>
              <form class="field-grid" data-form-action="task" data-task-id="${task.id}">
                <div class="field">
                  <label>Título</label>
                  <input name="title" value="${escapeHtml(task.title)}" ${canEditAdmin ? "" : "readonly"} />
                </div>
                <div class="field">
                  <label>Descrição</label>
                  <textarea name="description" ${canEditAdmin ? "" : "readonly"}>${escapeHtml(task.description)}</textarea>
                </div>
                <div class="two-col">
                  <div class="field">
                    <label>Equipe</label>
                    <select name="teamId" ${canEditAdmin ? "" : "disabled"}>${teamOptions}</select>
                  </div>
                  <div class="field">
                    <label>Projeto</label>
                    <select name="projectId" ${canEditAdmin ? "" : "disabled"}>
                      <option value="">Sem projeto</option>
                      ${projectOptions}
                    </select>
                  </div>
                </div>
                <div class="two-col">
                  <div class="field">
                    <label>Responsável</label>
                    <select name="responsibleId" ${canEditAdmin ? "" : "disabled"}>${responsibleOptions}</select>
                  </div>
                  <div class="field">
                    <label>Prazo</label>
                    <input name="dueDate" type="date" value="${task.dueDate}" ${canEditAdmin ? "" : "readonly"} />
                  </div>
                </div>
                <div class="field">
                  <label>Tecnologias / ferramentas</label>
                  <input name="technologies" value="${escapeHtml((task.technologies || []).join(", "))}" ${canEditAdmin ? "" : "readonly"} />
                </div>
                <div class="field">
                  <label>Status de execução</label>
                  <select name="status" ${canChangeStatus ? "" : "disabled"}>
                    ${["A Fazer", "Em Desenvolvimento", "Em Revisão", "Concluída", "Cancelada"].map((status) => `<option ${status === task.status ? "selected" : ""}>${status}</option>`).join("")}
                  </select>
                </div>
                <div class="inline-actions">
                  ${canEditAdmin ? `<button class="btn btn-primary" type="submit">Salvar alterações</button>` : ""}
                  ${canEditAdmin ? `<button class="btn btn-secondary" type="button" data-action="delete-task" data-task-id="${task.id}">Excluir</button>` : ""}
                </div>
              </form>
            </article>

            <article class="mini-card">
              <div class="section-header">
                <h3>Anexos</h3>
              </div>
              <div class="stack">
                <div class="field">
                  <input id="attachmentInput-${task.id}" placeholder="nome-do-arquivo.ext" />
                  <button class="btn btn-secondary" type="button" data-action="add-attachment" data-task-id="${task.id}">Adicionar anexo</button>
                </div>
                <div class="chip-row">
                  ${(task.attachments || []).length ? task.attachments.map((file) => `<span class="chip">${escapeHtml(file)}</span>`).join("") : `<span class="muted">Sem anexos.</span>`}
                </div>
              </div>
            </article>
          </div>

          <div class="detail-pane">
            <article class="mini-card">
              <div class="section-header">
                <h3>Comentários</h3>
              </div>
              <div class="stack">
                <textarea id="commentInput-${task.id}" placeholder="Escreva um comentário com @nome para mencionar alguém"></textarea>
                <button class="btn btn-primary" type="button" data-action="add-comment" data-task-id="${task.id}">Publicar comentário</button>
                <div class="stack">
                  ${(task.comments || []).length ? task.comments.map((comment) => `
                    <div class="comment">
                      <strong>${escapeHtml(getUser(comment.authorId)?.name || "Usuário")}</strong>
                      <div>${escapeHtml(comment.text)}</div>
                      <small>${formatDateTime(comment.createdAt)}</small>
                    </div>
                  `).join("") : `<div class="empty-state">Ainda sem comentários.</div>`}
                </div>
              </div>
            </article>

            <article class="mini-card">
              <div class="section-header">
                <h3>Histórico</h3>
              </div>
              <div class="stack">
                ${(task.history || []).map((entry) => `
                  <div class="history-item">
                    <strong>${escapeHtml(entry.text)}</strong>
                    <small>${formatDateTime(entry.createdAt)}</small>
                  </div>
                `).join("")}
              </div>
            </article>

            <article class="mini-card">
              <div class="section-header">
                <h3>Resumo</h3>
              </div>
              <div class="stack">
                <div class="mini-card">
                  <div class="muted">Responsável</div>
                  <strong>${escapeHtml(responsible?.name || "-")}</strong>
                </div>
                <div class="mini-card">
                  <div class="muted">Prazo</div>
                  <strong>${formatDate(task.dueDate)}${taskIsOverdue(task) ? " (atrasada)" : ""}</strong>
                </div>
                <div class="mini-card">
                  <div class="muted">Visibilidade</div>
                  <strong>${escapeHtml(getTeam(task.teamId)?.name || "-")}</strong>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    `);
  }

  function openTaskForm() {
    const user = currentUser();
    if (!isLeader(user)) return;
    const teamOptions = state.teams.map((team) => `<option value="${team.id}">${escapeHtml(team.name)}</option>`).join("");
    const projectOptions = state.projects.map((project) => `<option value="${project.id}">${escapeHtml(project.name)}</option>`).join("");
    const responsibleOptions = state.users.map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join("");
    openOverlay(`
      <div class="modal-header">
        <div>
          <h2 style="margin:0;">Nova tarefa</h2>
          <div class="muted">Cadastro administrativo feito pelo Líder.</div>
        </div>
        <button class="btn btn-ghost" data-close-modal>Fechar</button>
      </div>
      <div class="modal-body">
        <form class="field-grid" data-form-action="task">
          <div class="modal-grid">
            <div class="field">
              <label>Título</label>
              <input name="title" required />
            </div>
            <div class="field">
              <label>Responsável</label>
              <select name="responsibleId">${responsibleOptions}</select>
            </div>
          </div>
          <div class="field">
            <label>Descrição</label>
            <textarea name="description" required></textarea>
          </div>
          <div class="modal-grid">
            <div class="field">
              <label>Equipe</label>
              <select name="teamId">${teamOptions}</select>
            </div>
            <div class="field">
              <label>Projeto</label>
              <select name="projectId">
                <option value="">Sem projeto</option>
                ${projectOptions}
              </select>
            </div>
          </div>
          <div class="modal-grid">
            <div class="field">
              <label>Prazo</label>
              <input name="dueDate" type="date" required />
            </div>
            <div class="field">
              <label>Status</label>
              <select name="status">
                <option>A Fazer</option>
                <option>Em Desenvolvimento</option>
                <option>Em Revisão</option>
                <option>Concluída</option>
                <option>Cancelada</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label>Tecnologias / ferramentas</label>
            <input name="technologies" placeholder="HTML, CSS, JavaScript" required />
          </div>
          <div class="inline-actions">
            <button class="btn btn-primary" type="submit">Criar tarefa</button>
          </div>
        </form>
      </div>
    `);
  }

  function openProjectForm() {
    if (!isLeader(currentUser())) return;
    const teamOptions = state.teams.map((team) => `<option value="${team.id}">${escapeHtml(team.name)}</option>`).join("");
    openOverlay(`
      <div class="modal-header">
        <div>
          <h2 style="margin:0;">Novo projeto</h2>
          <div class="muted">Projetos agrupam diversas tarefas.</div>
        </div>
        <button class="btn btn-ghost" data-close-modal>Fechar</button>
      </div>
      <div class="modal-body">
        <form class="field-grid" data-form-action="project">
          <div class="modal-grid">
            <div class="field">
              <label>Nome</label>
              <input name="name" required />
            </div>
            <div class="field">
              <label>Equipe</label>
              <select name="teamId">${teamOptions}</select>
            </div>
          </div>
          <div class="field">
            <label>Descrição</label>
            <textarea name="description" required></textarea>
          </div>
          <div class="modal-grid">
            <div class="field">
              <label>Prazo</label>
              <input name="deadline" type="date" required />
            </div>
            <div class="field">
              <label>Status</label>
              <select name="status">
                <option>Planejado</option>
                <option selected>Em andamento</option>
                <option>Concluído</option>
                <option>Cancelado</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary" type="submit">Criar projeto</button>
        </form>
      </div>
    `);
  }

  function openTeamForm(isSubteam) {
    if (!isLeader(currentUser())) return;
    const parentOptions = state.teams.map((team) => `<option value="${team.id}">${escapeHtml(team.name)}</option>`).join("");
    openOverlay(`
      <div class="modal-header">
        <div>
          <h2 style="margin:0;">${isSubteam ? "Nova subequipe" : "Nova equipe"}</h2>
          <div class="muted">Estrutura hierárquica e controle de integrantes.</div>
        </div>
        <button class="btn btn-ghost" data-close-modal>Fechar</button>
      </div>
      <div class="modal-body">
        <form class="field-grid" data-form-action="team">
          <div class="modal-grid">
            <div class="field">
              <label>Nome</label>
              <input name="name" required />
            </div>
            <div class="field">
              <label>Equipe pai</label>
              <select name="parentId" ${isSubteam ? "" : "disabled"}>
                <option value="">Sem equipe pai</option>
                ${parentOptions}
              </select>
            </div>
          </div>
          <button class="btn btn-primary" type="submit">Salvar equipe</button>
        </form>
      </div>
    `);
  }

  function openUserForm() {
    if (!isLeader(currentUser())) return;
    const teamOptions = state.teams.map((team) => `<option value="${team.id}">${escapeHtml(team.name)}</option>`).join("");
    openOverlay(`
      <div class="modal-header">
        <div>
          <h2 style="margin:0;">Novo usuário</h2>
          <div class="muted">Cadastro exclusivo do Líder com vínculo a equipes.</div>
        </div>
        <button class="btn btn-ghost" data-close-modal>Fechar</button>
      </div>
      <div class="modal-body">
        <form class="field-grid" data-form-action="user">
          <div class="modal-grid">
            <div class="field">
              <label>Nome</label>
              <input name="name" required />
            </div>
            <div class="field">
              <label>E-mail</label>
              <input name="email" type="email" required />
            </div>
          </div>
          <div class="modal-grid">
            <div class="field">
              <label>Senha</label>
              <input name="password" type="text" required />
            </div>
            <div class="field">
              <label>Perfil</label>
              <select name="role">
                <option value="member">Membro da equipe</option>
                <option value="leader">Líder</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label>Equipes</label>
            <select name="teams" multiple size="5">${teamOptions}</select>
          </div>
          <button class="btn btn-primary" type="submit">Criar usuário</button>
        </form>
      </div>
    `);
  }

  function openManageTeam(teamId) {
    if (!isLeader(currentUser())) return;
    const team = getTeam(teamId);
    const memberOptions = state.users.map((user) => `
      <label style="display:flex;gap:8px;align-items:center;">
        <input type="checkbox" name="members" value="${user.id}" ${team.members.includes(user.id) ? "checked" : ""} />
        <span>${escapeHtml(user.name)}</span>
      </label>
    `).join("");
    openOverlay(`
      <div class="modal-header">
        <div>
          <h2 style="margin:0;">Gerenciar ${escapeHtml(team.name)}</h2>
          <div class="muted">Adicionar ou remover membros e ajustar vínculo.</div>
        </div>
        <button class="btn btn-ghost" data-close-modal>Fechar</button>
      </div>
      <div class="modal-body">
        <form class="field-grid" data-form-action="team-manage" data-team-id="${team.id}">
          <div class="field">
            <label>Nome da equipe</label>
            <input name="name" value="${escapeHtml(team.name)}" required />
          </div>
          <div class="field">
            <label>Membros</label>
            <div class="stack">${memberOptions}</div>
          </div>
          <button class="btn btn-primary" type="submit">Salvar alterações</button>
        </form>
      </div>
    `);
  }

  function openManageUser(userId) {
    if (!isLeader(currentUser())) return;
    const user = getUser(userId);
    const teamOptions = state.teams.map((team) => `
      <label style="display:flex;gap:8px;align-items:center;">
        <input type="checkbox" name="teams" value="${team.id}" ${user.teams.includes(team.id) ? "checked" : ""} />
        <span>${escapeHtml(team.name)}</span>
      </label>
    `).join("");
    openOverlay(`
      <div class="modal-header">
        <div>
          <h2 style="margin:0;">Editar usuário</h2>
          <div class="muted">${escapeHtml(user.name)}</div>
        </div>
        <button class="btn btn-ghost" data-close-modal>Fechar</button>
      </div>
      <div class="modal-body">
        <form class="field-grid" data-form-action="user-manage" data-user-id="${user.id}">
          <div class="modal-grid">
            <div class="field">
              <label>Nome</label>
              <input name="name" value="${escapeHtml(user.name)}" required />
            </div>
            <div class="field">
              <label>E-mail</label>
              <input name="email" type="email" value="${escapeHtml(user.email)}" required />
            </div>
          </div>
          <div class="modal-grid">
            <div class="field">
              <label>Senha</label>
              <input name="password" value="${escapeHtml(user.password)}" required />
            </div>
            <div class="field">
              <label>Perfil</label>
              <select name="role">
                <option value="member" ${user.role === "member" ? "selected" : ""}>Membro da equipe</option>
                <option value="leader" ${user.role === "leader" ? "selected" : ""}>Líder</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label>Equipes</label>
            <div class="stack">${teamOptions}</div>
          </div>
          <button class="btn btn-primary" type="submit">Salvar usuário</button>
        </form>
      </div>
    `);
  }

  function handleTaskForm(formData, form) {
    const taskId = form.dataset.taskId;
    const user = currentUser();
    if (taskId) {
      if (!isLeader(user)) return;
      const task = state.tasks.find((item) => item.id === taskId);
      const oldResponsible = task.responsibleId;
      task.title = String(formData.get("title") || "").trim();
      task.description = String(formData.get("description") || "").trim();
      task.teamId = String(formData.get("teamId") || task.teamId);
      task.projectId = String(formData.get("projectId") || "") || null;
      task.responsibleId = String(formData.get("responsibleId") || task.responsibleId);
      task.dueDate = String(formData.get("dueDate") || task.dueDate);
      task.status = String(formData.get("status") || task.status);
      task.technologies = String(formData.get("technologies") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      task.history.unshift({
        text: `Tarefa atualizada por ${user.name}.`,
        createdAt: new Date().toISOString()
      });
      if (oldResponsible !== task.responsibleId) {
        const responsible = getUser(task.responsibleId);
        notify(task.responsibleId, `Você foi designado para a tarefa '${task.title}'.`, "task");
        task.history.unshift({
          text: `Responsável alterado para ${responsible?.name || "novo usuário"}.`,
          createdAt: new Date().toISOString()
        });
      }
      closeOverlay();
      pushToast("Tarefa atualizada", task.title);
      render();
      return;
    }
    if (!isLeader(user)) return;
    const newTask = {
      id: crypto.randomUUID(),
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      responsibleId: String(formData.get("responsibleId") || ""),
      teamId: String(formData.get("teamId") || ""),
      projectId: String(formData.get("projectId") || "") || null,
      dueDate: String(formData.get("dueDate") || ""),
      status: String(formData.get("status") || "A Fazer"),
      technologies: String(formData.get("technologies") || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      comments: [],
      attachments: [],
      history: [
        { text: `Tarefa criada por ${user.name}.`, createdAt: new Date().toISOString() }
      ]
    };
    state.tasks.unshift(newTask);
    notify(newTask.responsibleId, `Você recebeu a tarefa '${newTask.title}'.`, "task");
    closeOverlay();
    pushToast("Tarefa criada", newTask.title);
    render();
  }

  function handleProjectForm(formData) {
    if (!isLeader(currentUser())) return;
    const newProject = {
      id: crypto.randomUUID(),
      name: String(formData.get("name") || "").trim(),
      teamId: String(formData.get("teamId") || ""),
      ownerId: currentUser().id,
      deadline: String(formData.get("deadline") || ""),
      description: String(formData.get("description") || "").trim(),
      status: String(formData.get("status") || "Em andamento")
    };
    state.projects.unshift(newProject);
    closeOverlay();
    pushToast("Projeto criado", newProject.name);
    render();
  }

  function handleTeamForm(formData) {
    if (!isLeader(currentUser())) return;
    const name = String(formData.get("name") || "").trim();
    const parentId = String(formData.get("parentId") || "") || null;
    state.teams.unshift({
      id: crypto.randomUUID(),
      name,
      parentId: parentId || null,
      members: [currentUser().id]
    });
    closeOverlay();
    pushToast("Equipe criada", name);
    render();
  }

  function handleUserForm(formData) {
    if (!isLeader(currentUser())) return;
    const selectedTeams = Array.from(formData.getAll("teams"));
    const email = String(formData.get("email") || "").trim().toLowerCase();
    if (state.users.some((user) => user.email.toLowerCase() === email)) {
      pushToast("E-mail já cadastrado", "Escolha outro endereço.");
      return;
    }
    const newUser = {
      id: crypto.randomUUID(),
      name: String(formData.get("name") || "").trim(),
      email,
      password: String(formData.get("password") || ""),
      role: String(formData.get("role") || "member"),
      avatar: initials(String(formData.get("name") || "")),
      teams: selectedTeams
    };
    state.users.unshift(newUser);
    selectedTeams.forEach((teamId) => {
      const team = getTeam(teamId);
      if (team && !team.members.includes(newUser.id)) team.members.push(newUser.id);
    });
    closeOverlay();
    pushToast("Usuário criado", newUser.name);
    render();
  }

  function handleTeamManage(formData, form) {
    if (!isLeader(currentUser())) return;
    const team = getTeam(form.dataset.teamId);
    team.name = String(formData.get("name") || "").trim();
    const selected = Array.from(formData.getAll("members"));
    team.members = selected;
    state.users.forEach((user) => {
      const hasTeam = selected.includes(user.id);
      const set = new Set(user.teams);
      if (hasTeam) set.add(team.id);
      else set.delete(team.id);
      user.teams = Array.from(set);
    });
    closeOverlay();
    pushToast("Equipe salva", team.name);
    render();
  }

  function handleUserManage(formData, form) {
    if (!isLeader(currentUser())) return;
    const user = getUser(form.dataset.userId);
    user.name = String(formData.get("name") || "").trim();
    user.email = String(formData.get("email") || "").trim().toLowerCase();
    user.password = String(formData.get("password") || "");
    user.role = String(formData.get("role") || "member");
    user.avatar = initials(user.name);
    user.teams = Array.from(formData.getAll("teams"));
    state.teams.forEach((team) => {
      team.members = team.members.filter((memberId) => memberId !== user.id);
    });
    user.teams.forEach((teamId) => {
      const team = getTeam(teamId);
      if (team && !team.members.includes(user.id)) team.members.push(user.id);
    });
    closeOverlay();
    pushToast("Usuário salvo", user.name);
    render();
  }

  function addComment(taskId) {
    const task = state.tasks.find((item) => item.id === taskId);
    const input = document.getElementById(`commentInput-${taskId}`);
    if (!task || !input) return;
    const text = input.value.trim();
    if (!text) return;
    const user = currentUser();
    task.comments.unshift({
      authorId: user.id,
      text,
      createdAt: new Date().toISOString()
    });
    task.history.unshift({
      text: `${user.name} adicionou um comentário.`,
      createdAt: new Date().toISOString()
    });
    notifyMembersOnTask(task, `${user.name} comentou na tarefa '${task.title}'.`, user.id);
    mentionUsers(text, task, user);
    input.value = "";
    pushToast("Comentário publicado", "A equipe foi atualizada.");
    render();
  }

  function addAttachment(taskId) {
    const task = state.tasks.find((item) => item.id === taskId);
    const input = document.getElementById(`attachmentInput-${taskId}`);
    if (!task || !input) return;
    const fileName = input.value.trim();
    if (!fileName) return;
    const user = currentUser();
    task.attachments.unshift(fileName);
    task.history.unshift({
      text: `${user.name} adicionou o anexo ${fileName}.`,
      createdAt: new Date().toISOString()
    });
    notifyMembersOnTask(task, `Novo anexo em '${task.title}': ${fileName}.`, user.id);
    input.value = "";
    pushToast("Anexo adicionado", fileName);
    render();
  }

  function mentionUsers(text, task, sender) {
    const mentions = [...text.matchAll(/@([A-Za-zÀ-ÿ0-9._-]+)/g)].map((match) => match[1].toLowerCase());
    if (!mentions.length) return;
    state.users.forEach((user) => {
      const userToken = user.name.toLowerCase().split(" ")[0];
      if (mentions.includes(userToken) && user.id !== sender.id) {
        notify(user.id, `${sender.name} mencionou você na tarefa '${task.title}'.`, "mention");
      }
    });
  }

  function notifyMembersOnTask(task, text, senderId) {
    const visibleTeamMembers = state.users.filter((user) => user.teams.includes(task.teamId) && user.id !== senderId);
    visibleTeamMembers.forEach((user) => notify(user.id, text, "task"));
  }

  function updateTaskStatus(taskId, status) {
    const task = state.tasks.find((item) => item.id === taskId);
    const user = currentUser();
    if (!task || !user || task.responsibleId !== user.id) {
      pushToast("Ação bloqueada", "Somente o responsável pode alterar o status.");
      render();
      return;
    }
    task.status = status;
    task.history.unshift({
      text: `${user.name} alterou o status para ${status}.`,
      createdAt: new Date().toISOString()
    });
    notifyMembersOnTask(task, `${user.name} atualizou o status da tarefa '${task.title}' para ${status}.`, user.id);
    if (status === "Concluída") {
      notify(user.id, `Você concluiu a tarefa '${task.title}'.`, "task");
    }
    pushToast("Status atualizado", `${task.title} agora está em ${status}.`);
    render();
  }

  function saveTaskInline(taskId) {
    openTaskModal(taskId);
  }

  function deleteTask(taskId) {
    if (!isLeader(currentUser())) return;
    const index = state.tasks.findIndex((item) => item.id === taskId);
    if (index >= 0) {
      const [task] = state.tasks.splice(index, 1);
      closeOverlay();
      pushToast("Tarefa removida", task.title);
      render();
    }
  }

  function markAllRead(userId) {
    state.notifications.forEach((item) => {
      if (item.userId === userId) item.read = true;
    });
    saveState();
  }

  function scheduleRealtimeChecks() {
    stopRealtimeChecks();
    notificationTimer = setInterval(() => {
      const user = currentUser();
      if (!user) return;
      const tasks = visibleTasksFor(user);
      tasks.filter(taskIsDueSoon).forEach((task) => {
        const exists = state.notifications.some(
          (item) => item.userId === user.id && item.text.includes(task.title) && item.type === "deadline"
        );
        if (!exists) {
          notify(user.id, `Prazo próximo: '${task.title}' vence em breve.`, "deadline");
          pushToast("Prazo próximo", task.title);
        }
      });
      tasks.filter(taskIsOverdue).forEach((task) => {
        const exists = state.notifications.some(
          (item) => item.userId === user.id && item.text.includes(task.title) && item.type === "overdue"
        );
        if (!exists) {
          notify(user.id, `A tarefa '${task.title}' já está atrasada.`, "overdue");
        }
      });
      saveState();
      refreshVisibleBadge();
    }, 30000);
  }

  function stopRealtimeChecks() {
    if (notificationTimer) {
      clearInterval(notificationTimer);
      notificationTimer = null;
    }
  }

  function refreshVisibleBadge() {
    const user = currentUser();
    if (!user) return;
    const badgeParent = document.querySelector(".notification-badge");
    if (badgeParent) {
      const unread = unreadCountFor(user);
      badgeParent.innerHTML = `Notificações${unread ? '<span class="notification-dot"></span>' : ""}`;
    }
  }

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      state = loadState();
      render();
    }
  });

  render();
})();
