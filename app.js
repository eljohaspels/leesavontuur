"use strict";

const STORAGE_KEY = "mijn-leesavontuur-sessies";
const START_MINUTES = 15;

const LEVELS = [
  { min: 0, name: "Boekstarter", icon: "🌱" },
  { min: 100, name: "Letterheld", icon: "✏️" },
  { min: 200, name: "Verhalenzoeker", icon: "🔎" },
  { min: 300, name: "Boekenavonturier", icon: "🧭" },
  { min: 400, name: "Leesheld", icon: "🦸" },
  { min: 500, name: "Leesmeester", icon: "👑" },
];

const BADGES = [
  { points: 50, name: "Sterrenlezer", icon: "🌟" },
  { points: 100, name: "Supersnelle Lezer", icon: "⚡" },
  { points: 250, name: "Verhalenontdekker", icon: "🗺️" },
  { points: 500, name: "Boekenkampioen", icon: "🏆" },
  { points: 1000, name: "Leesmeester", icon: "👑" },
];

let selectedMinutes = START_MINUTES;
let sessions = loadSessions();

const minuteValue = document.querySelector("#minute-value");
const minusButton = document.querySelector("#minus-button");
const plusButton = document.querySelector("#plus-button");
const saveButton = document.querySelector("#save-button");
const celebration = document.querySelector("#celebration");
const settingsDialog = document.querySelector("#settings-dialog");
const importFile = document.querySelector("#import-file");

function loadSessions() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored.filter(isValidSession) : [];
  } catch {
    return [];
  }
}

function isValidSession(session) {
  return Boolean(
    session &&
    /^\d{4}-\d{2}-\d{2}$/.test(session.date) &&
    Number.isInteger(session.minutes) &&
    session.minutes > 0 &&
    typeof session.createdAt === "string" &&
    !Number.isNaN(Date.parse(session.createdAt))
  );
}

function saveSessions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function getTotalPoints() {
  return sessions.reduce((total, session) => total + session.minutes, 0);
}

function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLevel(points) {
  let index = LEVELS.findLastIndex((level) => points >= level.min);
  if (index < 0) index = 0;
  return { ...LEVELS[index], index };
}

function updateMinutePicker() {
  minuteValue.textContent = selectedMinutes;
  minusButton.disabled = selectedMinutes <= 1;
}

function renderProgress() {
  const points = getTotalPoints();
  const level = getLevel(points);
  const nextLevel = LEVELS[level.index + 1];

  document.querySelector("#total-points").textContent = points;
  document.querySelector("#level-name").textContent = level.name;
  document.querySelector("#level-icon").textContent = level.icon;

  const progressBar = document.querySelector(".progress-track");
  const progressFill = document.querySelector("#level-progress");
  const progressText = document.querySelector("#level-progress-text");

  if (!nextLevel) {
    progressFill.style.width = "100%";
    progressBar.setAttribute("aria-valuenow", "100");
    progressText.textContent = "Je hebt het hoogste level bereikt! Fantastisch!";
    return;
  }

  const span = nextLevel.min - level.min;
  const progress = Math.round(((points - level.min) / span) * 100);
  const remaining = nextLevel.min - points;
  progressFill.style.width = `${progress}%`;
  progressBar.setAttribute("aria-valuenow", String(progress));
  progressText.textContent = `Nog ${remaining} ${remaining === 1 ? "punt" : "punten"} tot ${nextLevel.name}`;
}

function getMonday(date) {
  const monday = new Date(date);
  const day = monday.getDay();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  return monday;
}

function getDayIcon(minutes) {
  if (minutes === 0) return "🌱";
  if (minutes < 15) return "📖";
  if (minutes < 30) return "⭐";
  return "🚀";
}

function renderWeek() {
  const dayNames = ["ma", "di", "wo", "do", "vr", "za", "zo"];
  const monday = getMonday(new Date());
  const today = toLocalDateString(new Date());
  const grid = document.querySelector("#week-grid");
  let weekTotal = 0;

  grid.innerHTML = dayNames.map((name, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateString = toLocalDateString(date);
    const minutes = sessions
      .filter((session) => session.date === dateString)
      .reduce((sum, session) => sum + session.minutes, 0);
    weekTotal += minutes;
    return `
      <div class="day${dateString === today ? " day--today" : ""}" aria-label="${name}: ${minutes} minuten">
        <span class="day__name">${name}</span>
        <span class="day__icon" aria-hidden="true">${getDayIcon(minutes)}</span>
        <span class="day__minutes">${minutes} min</span>
      </div>`;
  }).join("");

  document.querySelector("#week-total").textContent = `Deze week: ${weekTotal} ${weekTotal === 1 ? "minuut" : "minuten"} gelezen`;
}

function renderBadges() {
  const points = getTotalPoints();
  document.querySelector("#badge-grid").innerHTML = BADGES.map((badge) => {
    const unlocked = points >= badge.points;
    return `
      <div class="badge${unlocked ? "" : " badge--locked"}" aria-label="${badge.name}, ${unlocked ? "behaald" : `nog vergrendeld tot ${badge.points} punten`}">
        ${unlocked ? "" : '<span class="badge__lock" aria-hidden="true">🔒</span>'}
        <span class="badge__icon" aria-hidden="true">${badge.icon}</span>
        <span class="badge__name">${badge.name}</span>
        <span class="badge__goal">${unlocked ? "Behaald!" : `${badge.points} punten`}</span>
      </div>`;
  }).join("");
}

function renderAll() {
  updateMinutePicker();
  renderProgress();
  renderWeek();
  renderBadges();
}

function showCelebration(minutes, newBadges) {
  const icon = document.querySelector("#celebration-icon");
  const title = document.querySelector("#celebration-title");
  const message = document.querySelector("#celebration-message");

  if (newBadges.length > 0) {
    const badge = newBadges[newBadges.length - 1];
    icon.textContent = badge.icon;
    title.textContent = "Nieuwe badge!";
    message.textContent = `Geweldig! +${minutes} punten én je hebt “${badge.name}” verdiend!`;
  } else {
    icon.textContent = "🎉";
    title.textContent = "Goed gedaan!";
    message.textContent = `Je hebt ${minutes} minuten gelezen. +${minutes} punten!`;
  }

  celebration.hidden = false;
  document.querySelector("#celebration-close").focus();
}

minusButton.addEventListener("click", () => {
  selectedMinutes = Math.max(1, selectedMinutes - 1);
  updateMinutePicker();
});

plusButton.addEventListener("click", () => {
  selectedMinutes += 1;
  updateMinutePicker();
});

saveButton.addEventListener("click", () => {
  const oldPoints = getTotalPoints();
  const session = {
    date: toLocalDateString(new Date()),
    minutes: selectedMinutes,
    createdAt: new Date().toISOString(),
  };

  sessions.push(session);
  saveSessions();
  const newPoints = getTotalPoints();
  const newBadges = BADGES.filter((badge) => oldPoints < badge.points && newPoints >= badge.points);
  renderAll();
  showCelebration(selectedMinutes, newBadges);
  selectedMinutes = START_MINUTES;
  updateMinutePicker();
});

document.querySelector("#celebration-close").addEventListener("click", () => {
  celebration.hidden = true;
  saveButton.focus();
});

celebration.addEventListener("click", (event) => {
  if (event.target === celebration) celebration.hidden = true;
});

document.querySelector("#settings-button").addEventListener("click", () => settingsDialog.showModal());

document.querySelector("#export-button").addEventListener("click", () => {
  const exportData = JSON.stringify(sessions, null, 2);
  const blob = new Blob([exportData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mijn-leeravontuur-${toLocalDateString(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
  document.querySelector("#settings-message").textContent = "De leesgeschiedenis is geëxporteerd.";
});

importFile.addEventListener("change", async () => {
  const file = importFile.files[0];
  if (!file) return;

  try {
    const imported = JSON.parse(await file.text());
    if (!Array.isArray(imported) || !imported.every(isValidSession)) {
      throw new Error("Ongeldig bestand");
    }
    sessions = imported;
    saveSessions();
    renderAll();
    document.querySelector("#settings-message").textContent = "De leesgeschiedenis is geïmporteerd.";
  } catch {
    document.querySelector("#settings-message").textContent = "Dit bestand kon niet worden geïmporteerd.";
  } finally {
    importFile.value = "";
  }
});

document.querySelector("#reset-button").addEventListener("click", () => {
  if (!window.confirm("Weet je zeker dat je alle leestijd, punten en badges wilt wissen?")) return;
  sessions = [];
  saveSessions();
  renderAll();
  document.querySelector("#settings-message").textContent = "Alle leesgegevens zijn gewist.";
});

renderAll();
