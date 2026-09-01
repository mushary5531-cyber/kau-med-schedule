/* ===== i18n ===== */
const I18N = {
  ar: {
    dir: "rtl", lang: "ar",
    siteTitle: "جدولي", siteSub: "كلية الطب - جامعة الملك عبدالعزيز",
    changeSelection: "تغيير الاختيار",
    heroTitle: "اختر سنتك الدراسية",
    heroSub: "وبعدها هيصير جدولك يظهر تلقائيًا في كل مرة تفتح فيها الموقع",
    pickGroup: "اختر مجموعتك (السنة الثالثة)",
    pickGroupSub: "مقرر الجهاز الدوري والتنفسي — Breathing & Circulation Module",
    back: "رجوع",
    scheduleFor: "جدولك",
    moduleName: "مقرر الجهاز الدوري والتنفسي — Breathing & Circulation Module",
    disclaimer: "⚠️ تم بناء الجدول يدويًا من التقويم الرسمي الصادر من كلية الطب. في حال وجود أي تعارض، يُعتمد الجدول الرسمي الصادر من الكلية.",
    footerNote: "غير رسمي — لأغراض تنظيمية شخصية فقط",
    year1desc: "مقدمة طبية عامة", year2desc: "علوم طبية أساسية", year3desc: "جدول تفصيلي حسب المجموعة",
    hasSchedule: "جدول أسبوعي مفصّل",
    semester1: "الفصل الدراسي الأول", semester2: "الفصل الدراسي الثاني",
    weeksLabel: "أسبوع",
    calendarSem1: "التقويم الأكاديمي — الفصل الأول",
    calendarSem2: "التقويم الأكاديمي — الفصل الثاني",
    weekLabel: "الأسبوع",
    breakLabel: "استراحة",
    emptyLabel: "لا يوجد نشاط مسجّل",
    progressLabel: "أنجزت",
    progressOf: "من",
    markComplete: "تحديد كمُنجزة",
    days: { Sunday: "الأحد", Monday: "الإثنين", Tuesday: "الثلاثاء", Wednesday: "الأربعاء", Thursday: "الخميس" }
  },
  en: {
    dir: "ltr", lang: "en",
    siteTitle: "My Schedule", siteSub: "Faculty of Medicine - King Abdulaziz University",
    changeSelection: "Change selection",
    heroTitle: "Choose your study year",
    heroSub: "Your schedule will load automatically next time you open this site",
    pickGroup: "Choose your group (3rd year)",
    pickGroupSub: "Breathing & Circulation Module",
    back: "Back",
    scheduleFor: "Your schedule",
    moduleName: "Breathing & Circulation Module",
    disclaimer: "⚠️ This schedule was manually compiled from the Faculty of Medicine's official timetable. In case of any discrepancy, the official timetable issued by the Faculty prevails.",
    footerNote: "Unofficial — for personal organizational use only",
    year1desc: "General medical foundation", year2desc: "Basic medical sciences", year3desc: "Detailed schedule by group",
    hasSchedule: "Detailed weekly schedule",
    semester1: "First Semester", semester2: "Second Semester",
    weeksLabel: "weeks",
    calendarSem1: "Academic Calendar — Semester 1",
    calendarSem2: "Academic Calendar — Semester 2",
    weekLabel: "Week",
    breakLabel: "Break",
    emptyLabel: "No activity recorded",
    progressLabel: "Completed",
    progressOf: "of",
    markComplete: "Mark as completed",
    days: { Sunday: "Sunday", Monday: "Monday", Tuesday: "Tuesday", Wednesday: "Wednesday", Thursday: "Thursday" }
  }
};

let currentLang = localStorage.getItem("kauLang") || "ar";
let overviewData = null;
let scheduleData = null;

const els = {
  yearGrid: document.getElementById("yearGrid"),
  groupPicker: document.getElementById("groupPicker"),
  groupGrid: document.getElementById("groupGrid"),
  backToYears: document.getElementById("backToYears"),
  selectionScreen: document.getElementById("selectionScreen"),
  overviewScreen: document.getElementById("overviewScreen"),
  scheduleScreen: document.getElementById("scheduleScreen"),
  overviewTitle: document.getElementById("overviewTitle"),
  calendarStrip: document.getElementById("calendarStrip"),
  semesterCols: document.getElementById("semesterCols"),
  overviewBack: document.getElementById("overviewBack"),
  scheduleBack: document.getElementById("scheduleBack"),
  currentGroupLabel: document.getElementById("currentGroupLabel"),
  weekTabs: document.getElementById("weekTabs"),
  weekContent: document.getElementById("weekContent"),
  changeSelectionBtn: document.getElementById("changeSelectionBtn"),
  langToggle: document.getElementById("langToggle"),
};

/* ===== i18n apply ===== */
function applyLang() {
  const t = I18N[currentLang];
  document.documentElement.lang = t.lang;
  document.documentElement.dir = t.dir;
  document.title = currentLang === "ar" ? "جدولي | كلية الطب - جامعة الملك عبدالعزيز" : "My Schedule | KAU Faculty of Medicine";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) el.innerHTML = t[key];
  });
  els.langToggle.textContent = currentLang === "ar" ? "EN" : "AR";
  localStorage.setItem("kauLang", currentLang);
}

els.langToggle.addEventListener("click", () => {
  currentLang = currentLang === "ar" ? "en" : "ar";
  applyLang();
  renderCurrentView();
});

/* ===== data loading ===== */
async function loadData() {
  const [ov, sch] = await Promise.all([
    fetch("data/overview.json").then(r => r.json()),
    fetch("data/schedule-3rd-year.json").then(r => r.json()),
  ]);
  overviewData = ov;
  scheduleData = sch;
}

/* ===== selection screen ===== */
function buildYearGrid() {
  const t = I18N[currentLang];
  els.yearGrid.innerHTML = "";
  overviewData.years.forEach(y => {
    const card = document.createElement("div");
    card.className = "year-card";
    const desc = currentLang === "ar" ? (y.year === 3 ? t.year3desc : y.year === 2 ? t.year2desc : t.year1desc)
                                       : (y.year === 3 ? t.year3desc : y.year === 2 ? t.year2desc : t.year1desc);
    card.innerHTML = `
      <div class="num">${y.year}</div>
      <h3>${currentLang === "ar" ? y.titleAr : y.titleEn}</h3>
      <p>${desc}</p>
      ${y.hasDetailedSchedule ? `<span class="badge">${t.hasSchedule}</span>` : ""}
    `;
    card.addEventListener("click", () => {
      if (y.hasDetailedSchedule) {
        showGroupPicker();
      } else {
        selectYear(y.year);
      }
    });
    els.yearGrid.appendChild(card);
  });
}

function showGroupPicker() {
  els.groupPicker.classList.remove("hidden");
  els.yearGrid.classList.add("hidden");
  const t = I18N[currentLang];
  const groups = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4"];
  els.groupGrid.innerHTML = "";
  groups.forEach(g => {
    const btn = document.createElement("button");
    btn.className = "group-btn " + (g.startsWith("A") ? "group-a" : "group-b");
    btn.textContent = g;
    btn.addEventListener("click", () => selectGroup(g));
    els.groupGrid.appendChild(btn);
  });
}

els.backToYears.addEventListener("click", () => {
  els.groupPicker.classList.add("hidden");
  els.yearGrid.classList.remove("hidden");
});

/* ===== selection persistence ===== */
function selectYear(year) {
  localStorage.setItem("kauSelection", JSON.stringify({ type: "overview", year }));
  showOverview(year);
}

function selectGroup(group) {
  localStorage.setItem("kauSelection", JSON.stringify({ type: "schedule", group }));
  showSchedule(group);
}

function clearSelection() {
  localStorage.removeItem("kauSelection");
  showSelectionScreen();
}

els.changeSelectionBtn.addEventListener("click", clearSelection);
els.overviewBack.addEventListener("click", clearSelection);
els.scheduleBack.addEventListener("click", clearSelection);

/* ===== screen switching ===== */
function showSelectionScreen() {
  els.selectionScreen.classList.remove("hidden");
  els.overviewScreen.classList.add("hidden");
  els.scheduleScreen.classList.add("hidden");
  els.changeSelectionBtn.classList.add("hidden");
  els.groupPicker.classList.add("hidden");
  els.yearGrid.classList.remove("hidden");
  buildYearGrid();
}

/* ===== overview screen ===== */
function renderEventRow(ev) {
  const t = I18N[currentLang];
  const date = ev.dateG.replace(/-/g, "/");
  return `<div class="event-row">
    <span class="date">${date}</span>
    <span class="label">${currentLang === "ar" ? ev.labelAr : ev.labelEn}</span>
  </div>`;
}

function showOverview(year) {
  els.selectionScreen.classList.add("hidden");
  els.scheduleScreen.classList.add("hidden");
  els.overviewScreen.classList.remove("hidden");
  els.changeSelectionBtn.classList.remove("hidden");

  const t = I18N[currentLang];
  const y = overviewData.years.find(yy => yy.year === year);
  els.overviewTitle.textContent = currentLang === "ar" ? y.titleAr : y.titleEn;

  const cal = overviewData.calendar;
  els.calendarStrip.innerHTML = `
    <div class="calendar-card">
      <h3>${t.calendarSem1}</h3>
      <div class="meta">${cal.semester1.weeks} ${t.weeksLabel} · ${cal.semester1.studyDays} ${currentLang === "ar" ? "يوم دراسي" : "study days"}</div>
      ${cal.semester1.events.map(renderEventRow).join("")}
    </div>
    <div class="calendar-card">
      <h3>${t.calendarSem2}</h3>
      <div class="meta">${cal.semester2.weeks} ${t.weeksLabel} · ${cal.semester2.studyDays} ${currentLang === "ar" ? "يوم دراسي" : "study days"}</div>
      ${cal.semester2.events.map(renderEventRow).join("")}
    </div>
  `;

  els.semesterCols.innerHTML = `
    <div class="semester-card">
      <h3>${t.semester1}</h3>
      <span class="weeks-tag">${y.semester1.weeks} ${t.weeksLabel}</span>
      <ul class="subject-list">
        ${y.semester1.subjects.map(s => `<li>${currentLang === "ar" ? s.ar : s.en}<span class="en">${currentLang === "ar" ? s.en : s.ar}</span></li>`).join("")}
      </ul>
    </div>
    <div class="semester-card">
      <h3>${t.semester2}</h3>
      <span class="weeks-tag">${y.semester2.weeks} ${t.weeksLabel}</span>
      <ul class="subject-list">
        ${y.semester2.subjects.map(s => `<li>${currentLang === "ar" ? s.ar : s.en}<span class="en">${currentLang === "ar" ? s.en : s.ar}</span></li>`).join("")}
      </ul>
    </div>
  `;
}

/* ===== schedule screen ===== */
let activeWeekIndex = 0;
let activeGroup = null;

function activityTagClass(activity) {
  if (!activity) return "";
  const m = activity.match(/^(IL|FC|OL|Pr|P|CBD|SPP\d*|PBL|SDL|Tutorial)/i);
  if (!m) return "";
  const p = m[1].toUpperCase();
  if (p.startsWith("SPP")) return "tag-SPP";
  if (p === "TUTORIAL") return "tag-Tutorial";
  if (["FINAL", "QUIZ"].some(k => activity.toUpperCase().includes(k))) return "tag-exam";
  return "tag-" + p;
}

const DEPARTMENTS = {
  Anatomy: { ar: "تشريح", en: "Anatomy" },
  Histology: { ar: "أنسجة", en: "Histology" },
  Physiology: { ar: "فسيولوجي", en: "Physiology" },
  Biochemistry: { ar: "كيمياء حيوية", en: "Biochemistry" },
  Hematology: { ar: "أمراض الدم", en: "Hematology" },
  Microbiology: { ar: "أحياء دقيقة", en: "Microbiology" },
  Pathology: { ar: "باثولوجي", en: "Pathology" },
  Pharmacology: { ar: "فارماكولوجي", en: "Pharmacology" }
};

function activityDepartment(activity) {
  const value = activity.toLowerCase();

  const explicit = [
    ["anatomy", "Anatomy"], ["histology", "Histology"],
    ["physiology", "Physiology"], ["phsiology", "Physiology"],
    ["biochemistry", "Biochemistry"], ["microbiology", "Microbiology"],
    ["pathology", "Pathology"], ["pharmacology", "Pharmacology"]
  ];
  for (const [term, department] of explicit) {
    if (value.includes(term)) return department;
  }

  const rules = [
    ["Anatomy", [
      "mediastinum", "pericardium", "external features of the heart",
      "internal features of the heart", "development of respiratory",
      "development of the heart", "thoracic wall", "nose and para nasal",
      "anatomy of the larynx", "lung and its relations", "radiological anatomy",
      "congenital anomalies and abnormal development"
    ]],
    ["Histology", ["histology of", "mucosal immune system", "lymphatic system", "myocardium"]],
    ["Physiology", [
      "mechanics of breathing", "pressure-volume", "coronary circulation",
      "vascular endothelium", "cardiac automaticity", "cardiac contractility",
      "cardiac cycle", "cardiac output", "normal ecg", "abnormal ecg",
      "metabolic functions of the lung", "transport of carbon dioxide",
      "transport of oxygen", "gas diffusion", "neural control of breathing",
      "physiological organization", "regulation of abp", "acid-base homeostasis",
      "heart sounds", "abp measurment", "lung volumes and capacities",
      "chemical control of breathing"
    ]],
    ["Biochemistry", [
      "haem synthesis", "haem catabolism", "plasma proteins", "cholesterol metabolism",
      "plasma lipoproteins", "disorders of plasma lipoproteins", "lipid profile",
      "ck-mb", "g6pd", "diagnostic cardiac markers"
    ]],
    ["Hematology", [
      "anemia, polycythemia", "hemolytic anemia", "hematopoeisis",
      "hematopoiesis", "lymphadenopathy"
    ]],
    ["Microbiology", [
      "malaria", "babesiosis", "endocarditis", "pulmonary infection",
      "respiratory tract infections", "treatment of tb", "lung tb",
      "parasit", "filariasis", "leishmaniasis", "verminous pneumonia",
      "lung immunology", "hypersensitivity reaction", "autoimmune disorders",
      "immune dysregulation", "immunodeficiency disorders"
    ]],
    ["Pathology", [
      "atherosclerosis", "aneurysm", "ischemic heart disease", "myocarditis",
      "pericardial disease", "vasculitis", "obstructive airway disease",
      "restrictive airway disease", "bronchial asthma", "atelectasis",
      "acute lung injury", "pulmonary vessel disease", "lung and pleural tumors",
      "upper respiratory tract neoplasm", "vessles and vascular tumors",
      "hypertension", "valvular heart", "lymph node pathology", "cardiomyopathy"
    ]],
    ["Pharmacology", [
      "antiplatelet", "drugs affecting", "treatment of hematological malignancy",
      "drugs used in treatment", "drug therapy", "anti-anginal", "anti-lipidemic",
      "antiarrhythmic", "antihypertensive", "immune suppressants",
      "immunomodulators", "treatment of anemia", "assessment of drug effect"
    ]]
  ];

  for (const [department, terms] of rules) {
    if (terms.some(term => value.includes(term))) return department;
  }
  return null;
}

function renderDepartmentBadge(activity) {
  const department = activityDepartment(activity);
  if (!department) return "";
  const label = DEPARTMENTS[department][currentLang];
  return `<span class="department department-${department}">${label}</span>`;
}

const CHECKLIST_STORAGE_KEY = "kauLectureChecklist";

function readChecklist() {
  try {
    return JSON.parse(localStorage.getItem(CHECKLIST_STORAGE_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

function lectureChecklistId(date, time, activity) {
  const source = `${activeGroup}|${date}|${time}|${activity}`;
  let hash = 2166136261;
  for (let i = 0; i < source.length; i++) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `lecture-${(hash >>> 0).toString(36)}`;
}

function isCoreLecture(activity) {
  return /^(IL|FC|OL|CBD):\s*/i.test((activity || "").trim());
}

function renderLectureChecklist(date, slot) {
  if (!isCoreLecture(slot.activity)) return "";
  const id = lectureChecklistId(date, slot.time, slot.activity);
  const checked = Boolean(readChecklist()[id]);
  const label = I18N[currentLang].markComplete;
  return `<label class="lecture-check" title="${label}">
    <input type="checkbox" data-lecture-id="${id}" aria-label="${label}" ${checked ? "checked" : ""}>
    <span class="checkmark" aria-hidden="true"></span>
  </label>`;
}

function bindChecklistEvents() {
  els.weekContent.querySelectorAll("[data-lecture-id]").forEach(input => {
    const row = input.closest("tr");
    row.classList.toggle("completed", input.checked);
    input.addEventListener("change", () => {
      const checklist = readChecklist();
      if (input.checked) checklist[input.dataset.lectureId] = true;
      else delete checklist[input.dataset.lectureId];
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checklist));
      row.classList.toggle("completed", input.checked);
      updateWeekProgress();
    });
  });
}

function updateWeekProgress() {
  const boxes = [...els.weekContent.querySelectorAll("[data-lecture-id]")];
  const completed = boxes.filter(box => box.checked).length;
  const progress = els.weekContent.querySelector(".week-progress");
  if (!progress) return;
  const t = I18N[currentLang];
  progress.querySelector(".progress-text").textContent =
    `${t.progressLabel} ${completed} ${t.progressOf} ${boxes.length}`;
  const percent = boxes.length ? Math.round((completed / boxes.length) * 100) : 0;
  progress.querySelector(".progress-fill").style.width = `${percent}%`;
  progress.setAttribute("aria-valuenow", String(percent));
}

function renderActivityCell(activity) {
  if (!activity || activity.trim() === "") {
    const t = I18N[currentLang];
    return `<span class="slot-activity empty">${t.emptyLabel}</span>`;
  }
  if (activity.trim().toLowerCase() === "break") {
    const t = I18N[currentLang];
    return `<span class="slot-activity break-slot">${t.breakLabel}</span>`;
  }
  const cls = activityTagClass(activity);
  const m = activity.match(/^([A-Za-z]+\d*):?\s*/);
  let rest = activity;
  let tag = "";
  if (m && cls) {
    tag = `<span class="tag ${cls}">${m[1]}</span>`;
    rest = activity.slice(m[0].length);
  }
  const department = renderDepartmentBadge(activity);
  return `<span class="slot-activity">${tag}${escapeHtml(rest)}${department}</span>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function scheduleDateKey(dateText) {
  const months = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"
  };
  const match = dateText.trim().match(/^([A-Za-z]{3})\s+(\d{4})\s+(\d{1,2})$/);
  if (!match) return null;
  const month = months[match[1].toLowerCase()];
  if (!month) return null;
  return `${match[2]}-${month}-${match[3].padStart(2, "0")}`;
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function findTodayWeekIndex() {
  const today = localDateKey();
  return scheduleData.weeks.findIndex(week =>
    week.days.some(day => scheduleDateKey(day.date) === today)
  );
}

function scrollToToday() {
  requestAnimationFrame(() => {
    const todayCard = els.weekContent.querySelector(".day-card.today");
    if (todayCard) todayCard.scrollIntoView({ behavior: "smooth", block: "start" });
    const activeTab = els.weekTabs.querySelector(".week-tab.active");
    if (activeTab) activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  });
}

function showSchedule(group) {
  activeGroup = group;
  const todayWeekIndex = findTodayWeekIndex();
  if (todayWeekIndex !== -1) activeWeekIndex = todayWeekIndex;
  els.selectionScreen.classList.add("hidden");
  els.overviewScreen.classList.add("hidden");
  els.scheduleScreen.classList.remove("hidden");
  els.changeSelectionBtn.classList.remove("hidden");
  els.currentGroupLabel.textContent = group;

  buildWeekTabs();
  renderWeek(activeWeekIndex);
  scrollToToday();
}

function buildWeekTabs() {
  const t = I18N[currentLang];
  els.weekTabs.innerHTML = "";
  scheduleData.weeks.forEach((w, idx) => {
    const btn = document.createElement("button");
    btn.className = "week-tab" + (idx === activeWeekIndex ? " active" : "");
    btn.textContent = `${t.weekLabel} ${w.weekNumber}`;
    btn.addEventListener("click", () => {
      activeWeekIndex = idx;
      buildWeekTabs();
      renderWeek(idx);
    });
    els.weekTabs.appendChild(btn);
  });
}

function renderWeek(idx) {
  const t = I18N[currentLang];
  const week = scheduleData.weeks[idx];
  if (!week) return;

  let html = `<div class="week-theme">${escapeHtml(week.theme)} <span class="range">— ${escapeHtml(week.dateRange)}</span></div>
    <div class="week-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <span class="progress-text"></span>
      <span class="progress-track"><span class="progress-fill"></span></span>
    </div>`;

  week.days.forEach(day => {
    const slots = day.groups[activeGroup] || [];
    const dayLabel = t.days[day.day] || day.day;
    const isToday = scheduleDateKey(day.date) === localDateKey();
    html += `<div class="day-card${isToday ? " today" : ""}">
      <div class="day-head"><span>${dayLabel}</span><span class="day-date">${escapeHtml(day.date)}</span></div>
      <table class="slot-table"><tbody>
        ${slots.map(s => `<tr class="${s.time === '12-1' ? 'break-row' : ''}">
            <td class="slot-time">${s.time}</td>
            <td class="activity-cell">
              ${renderActivityCell(s.activity)}
              ${renderLectureChecklist(day.date, s)}
            </td>
          </tr>`).join("")}
      </tbody></table>
    </div>`;
  });

  els.weekContent.innerHTML = html;
  bindChecklistEvents();
  updateWeekProgress();
}

/* ===== boot ===== */
function renderCurrentView() {
  const raw = localStorage.getItem("kauSelection");
  if (!raw) {
    showSelectionScreen();
    return;
  }
  try {
    const sel = JSON.parse(raw);
    if (sel.type === "schedule" && sel.group) {
      showSchedule(sel.group);
    } else if (sel.type === "overview" && sel.year) {
      showOverview(sel.year);
    } else {
      showSelectionScreen();
    }
  } catch (e) {
    showSelectionScreen();
  }
}

(async function init() {
  applyLang();
  await loadData();
  renderCurrentView();
})();
