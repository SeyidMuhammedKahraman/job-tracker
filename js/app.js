
const STATUSES = ["Başvuruldu", "Mülakat", "Teklif", "Reddedildi"];
const ADMIN_PASSWORD = "1234";

const form = document.getElementById("jobForm");
const titleInput = document.getElementById("title");
const companyInput = document.getElementById("company");
const statusSelect = document.getElementById("status");
const jobList = document.getElementById("jobList");
const filterSelect = document.getElementById("filterSelect");
const searchInput = document.getElementById("searchInput");

// admin
const loginBox = document.getElementById("loginBox");
const adminPanel = document.getElementById("adminPanel");
const adminPasswordInput = document.getElementById("adminPassword");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const clearAllBtn = document.getElementById("clearAll");
const resetStatsBtn = document.getElementById("resetStats");

let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

let statsState = JSON.parse(localStorage.getItem("stats")) || {
  Başvuruldu: 0,
  Mülakat: 0,
  Teklif: 0,
  Reddedildi: 0
};

let editId = null;

function saveJobs() {
  localStorage.setItem("jobs", JSON.stringify(jobs));
}

function saveStats() {
  localStorage.setItem("stats", JSON.stringify(statsState));
}

/*select */
function createOption(value, text = value) {
  const opt = document.createElement("option");
  opt.value = value;
  opt.textContent = text;
  return opt;
}

function initSelects() {
  if (statusSelect) {
    STATUSES.forEach(s => statusSelect.appendChild(createOption(s)));
  }
  if (filterSelect) {
    filterSelect.appendChild(createOption("all", "Tümü"));
    STATUSES.forEach(s => filterSelect.appendChild(createOption(s)));
  }
}

function renderJobs() {
  if (!jobList) return;

  jobList.textContent = "";

  const filter = filterSelect?.value || "all";
  const search = searchInput?.value.toLowerCase() || "";

  jobs.filter(j => filter === "all" || j.status === filter).filter(j =>j.title.toLowerCase().includes(search) ||
   j.company.toLowerCase().includes(search)).forEach(job => {
      const li = document.createElement("li");
      li.className = "list-group-item";

      const text = document.createElement("span");
      text.textContent = `${job.title} – ${job.company} (${job.status})`;

      const actions = document.createElement("div");

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-outline-primary me-2";
      editBtn.textContent = "Düzenle";
      editBtn.onclick = () => loadEdit(job.id);

      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-sm btn-outline-danger";
      delBtn.textContent = "Sil";
      delBtn.onclick = () => deleteJob(job.id);

      actions.append(editBtn, delBtn);
      li.append(text, actions);
      jobList.appendChild(li);
    });
}

function loadEdit(id) {
  const job = jobs.find(j => j.id === id);
  if (!job) return;

  titleInput.value = job.title;
  companyInput.value = job.company;
  statusSelect.value = job.status;
  editId = id;
}

function deleteJob(id) {
  const job = jobs.find(j => j.id === id);
  if (!job) return;

  jobs = jobs.filter(j => j.id !== id);
  saveJobs();

  renderJobs();
  renderAdmin();
}

/*form tetiklemesi */
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const company = companyInput.value.trim();
    const status = statusSelect.value;

    if (!title || !company) return;

    if (editId) {
      const job = jobs.find(j => j.id === editId);
      job.title = title;
      job.company = company;
      job.status = status;
      editId = null;
    } else {
      jobs.push({
        id: Date.now(),
        title,
        company,
        status
      });

      statsState[status]++;
      saveStats();
    }

    saveJobs();
    form.reset();

    renderJobs();
    renderAdmin();
  });
}

if (loginBtn) {
  loginBtn.onclick = () => {
    if (adminPasswordInput.value === ADMIN_PASSWORD) {
      localStorage.setItem("admin", "true");
      loginBox.classList.add("d-none");
      adminPanel.classList.remove("d-none");
      logoutBtn?.classList.remove("d-none");

      renderAdmin();
    } else {
      alert("Hatalı şifre");
    }
  };
}

if (localStorage.getItem("admin")) {
  loginBox?.classList.add("d-none");
  adminPanel?.classList.remove("d-none");
  logoutBtn?.classList.remove("d-none");

  renderAdmin();
}

/*çıkış butonu*/
logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("admin");
  location.reload();
});

function renderAdmin() {
  if (!localStorage.getItem("admin")) return;

  const statsBox = document.getElementById("stats");
  const statusLists = document.getElementById("statusLists");
  if (!statsBox || !statusLists) return;

  statsBox.textContent = "";

  STATUSES.forEach(status => {
    const col = document.createElement("div");
    col.className = "col-md-3";

    const card = document.createElement("div");
    card.className = "stat-card";

    const h6 = document.createElement("h6");
    h6.textContent = status;

    const h3 = document.createElement("h3");
    h3.textContent = statsState[status];

    card.append(h6, h3);
    col.appendChild(card);
    statsBox.appendChild(col);
  });

  statusLists.textContent = "";

  STATUSES.forEach(status => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-3";

    const card = document.createElement("div");
    card.className = "card shadow-sm h-100";

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("h5");
    title.textContent = status;

    const list = document.createElement("ul");
    list.className = "list-group list-group-flush mt-3";

    const filtered = jobs.filter(j => j.status === status);

    if (filtered.length === 0) {
      const li = document.createElement("li");
      li.className = "list-group-item title-card";
      li.textContent = "Kayıt yok";
      list.appendChild(li);
    } else {
      filtered.forEach(job => {
        const li = document.createElement("li");
        li.className =
          "list-group-item d-flex justify-content-between align-items-center";

        const span = document.createElement("span");
        span.textContent = `${job.title} – ${job.company}`;

        const delBtn = document.createElement("button");
        delBtn.className = "btn btn-sm btn-outline-danger";
        delBtn.textContent = "Sil";
        delBtn.onclick = () => deleteJob(job.id);

        li.append(span, delBtn);
        list.appendChild(li);
      });
    }

    body.append(title, list);
    card.appendChild(body);
    col.appendChild(card);
    statusLists.appendChild(col);
  });
}

/* admin butonları*/
clearAllBtn?.addEventListener("click", () => {
  if (confirm("Tüm başvurular silinsin mi?")) {
    jobs = [];
    saveJobs();
    renderJobs();
    renderAdmin();
  }
});
resetStatsBtn?.addEventListener("click", () => {
  STATUSES.forEach(s => (statsState[s] = 0));
  saveStats();
  renderAdmin();
});

filterSelect?.addEventListener("change", renderJobs);
searchInput?.addEventListener("input", renderJobs);

initSelects();
renderJobs();
renderAdmin();
