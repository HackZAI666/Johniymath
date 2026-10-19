// Build ID: 20261018-en-dashboard-progress-v2
import { initAuth } from "./auth.js?v=20261018-en-dashboard-progress-v2";
import { initCurriculum } from "./curriculum.js?v=20261018-en-dashboard-progress-v2";
import { renderSetsIntroOne } from "./lessons/sets-intro-1.js?v=20261018-en-dashboard-progress-v2";
import { loadLessonProgress, saveLessonProgress } from "./progress.js?v=20261018-en-dashboard-progress-v2";

console.info("[Johnly-math] Build 20261018-en-dashboard-progress-v2 loaded.");

const welcomeScreen = document.getElementById("welcome-screen");
const workspaceScreen = document.getElementById("workspace-screen");
const guestSidebarNote = document.getElementById("guest-sidebar-note");
const guestSidebarFooter = document.getElementById("guest-sidebar-footer");
const memberNav = document.getElementById("member-nav");
const accountBox = document.getElementById("account-box");
const sidebarUsername = document.getElementById("sidebar-username");
const userAvatar = document.getElementById("user-avatar");
const welcomeUsername = document.getElementById("welcome-username");
const workspaceBreadcrumb = document.getElementById("workspace-breadcrumb");
const contentPlaceholder = document.getElementById("content-placeholder");
const lessonPage = document.getElementById("lesson-page");
const lessonGrade = document.getElementById("lesson-grade");
const lessonTitle = document.getElementById("lesson-title");
const lessonPath = document.getElementById("lesson-path");
const lessonPlaceholderPanel = document.getElementById("lesson-placeholder-panel");
const lessonContent = document.getElementById("lesson-content");
const lessonPanelLabel = document.getElementById("lesson-panel-label");
const lessonPanelTitle = document.getElementById("lesson-panel-title");
const lessonPanelDescription = document.getElementById("lesson-panel-description");
const dashboardPage = document.getElementById("dashboard-page");
const dashboardNavButton = document.getElementById("dashboard-nav-button");

const LESSON_ID = "grade-10-sets-1-learning";
let currentUsername = "";

function showWelcome() {
  currentUsername = "";
  welcomeScreen.hidden = false;
  workspaceScreen.hidden = true;
  guestSidebarNote.hidden = false;
  guestSidebarFooter.hidden = false;
  memberNav.hidden = true;
  accountBox.hidden = true;
  if (dashboardPage) dashboardPage.hidden = true;
  document.title = "Johnly-math | Master Mathematics";
}

function showWorkspace(user) {
  currentUsername = typeof user?.username === "string" ? user.username : "Student";
  const username = currentUsername;
  welcomeScreen.hidden = true;
  workspaceScreen.hidden = false;
  guestSidebarNote.hidden = true;
  guestSidebarFooter.hidden = true;
  memberNav.hidden = false;
  accountBox.hidden = false;
  if (dashboardPage) dashboardPage.hidden = true;
  contentPlaceholder.hidden = false;
  lessonPage.hidden = true;
  lessonContent.replaceChildren();
  workspaceBreadcrumb.textContent = "Course Directory / Overview";

  sidebarUsername.textContent = username;
  welcomeUsername.textContent = username;
  const dashboardUserChip = document.getElementById("dashboard-user-chip");
  if (dashboardUserChip) dashboardUserChip.textContent = `${username} · Personal space`;
  userAvatar.textContent = username.trim().slice(0, 1).toUpperCase() || "S";
  document.title = "Course Directory | Johnly-math";
}

function showDashboard() {
  if (!currentUsername || !dashboardPage) return;
  contentPlaceholder.hidden = true;
  lessonPage.hidden = true;
  dashboardPage.hidden = false;
  workspaceBreadcrumb.textContent = "Personal Dashboard / Overview";
  document.title = "Personal Dashboard | Johnly-math";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectDashboardTab(tabName) {
  document.querySelectorAll("[data-dashboard-tab]").forEach((button) => {
    const selected = button.dataset.dashboardTab === tabName;
    button.setAttribute("aria-selected", String(selected));
    button.classList.toggle("is-active", selected);
    button.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll("[data-dashboard-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.dashboardPanel !== tabName;
  });
  const title = document.getElementById("dashboard-current-section");
  const labels = {
    courses: "Personal Courses",
    honours: "Honours",
    challenge: "Challenge Cup",
  };
  if (title) title.textContent = labels[tabName] ?? labels.courses;
  workspaceBreadcrumb.textContent = `Personal Dashboard / ${labels[tabName] ?? labels.courses}`;
}

function showCurriculumPage(node, path) {
  if (dashboardPage) dashboardPage.hidden = true;
  const gradeNode = path.find((item) => item.kind === "grade");
  const gradeNumber = gradeNode?.label ?? "10";
  const readablePath = path.map((item) => item.label);
  const breadcrumbPath = readablePath
    .map((label, index) => (index === 0 ? `Grade ${label}` : label))
    .join(" / ");

  workspaceBreadcrumb.textContent = `Course Directory / ${breadcrumbPath}`;
  lessonGrade.textContent = `GRADE ${gradeNumber} MATHEMATICS`;
  lessonTitle.textContent = node.label;
  lessonPath.textContent = breadcrumbPath;

  if (node.id === LESSON_ID) {
    lessonTitle.textContent = "Introduction to Sets 1";
    lessonGrade.textContent = "GRADE 10 MATHEMATICS · SETS AND LOGIC";
    lessonPath.textContent = breadcrumbPath;
    contentPlaceholder.hidden = true;
    lessonPage.hidden = false;
    lessonPlaceholderPanel.hidden = true;
    lessonContent.hidden = false;
    lessonContent.replaceChildren();

    try {
      const initialProgress = loadLessonProgress(currentUsername, LESSON_ID);
      renderSetsIntroOne(lessonContent, {
        initialProgress,
        onProgressChange: (progress) => {
          const saved = saveLessonProgress(currentUsername, LESSON_ID, progress);
          const status = lessonContent.querySelector("[data-save-status]");
          if (status) {
            status.textContent = saved
              ? "Progress saved to your account in this browser."
              : "Progress could not be saved. Check this browser's storage settings.";
            status.dataset.saved = String(saved);
          }
        },
      });
      if (lessonContent.childElementCount === 0) {
        throw new Error("The lesson renderer completed without adding course content.");
      }
      console.info("[Johnly-math] Rendered English lesson: grade-10-sets-1-learning.");
    } catch (error) {
      console.error("[Johnly-math] Failed to render Introduction to Sets 1.", error);
      const errorPanel = document.createElement("section");
      errorPanel.className = "lesson-panel";
      const errorTitle = document.createElement("h2");
      errorTitle.textContent = "This lesson could not be displayed";
      const errorMessage = document.createElement("p");
      errorMessage.textContent = "The course area opened, but the lesson script reported an error. Make sure main.js, auth.js, curriculum.js, progress.js, and lessons/sets-intro-1.js were deployed together, then hard-refresh the page.";
      errorPanel.append(errorTitle, errorMessage);
      lessonContent.append(errorPanel);
    }

    document.title = "Introduction to Sets 1 | Johnly-math";
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  lessonContent.hidden = true;
  lessonContent.replaceChildren();
  lessonPlaceholderPanel.hidden = false;
  lessonPanelTitle.textContent = node.label;

  if (node.kind === "page") {
    const isLearning = node.section === "learning";
    const sectionName = isLearning ? "Learning" : "Homework";
    lessonPanelLabel.textContent = sectionName.toUpperCase();
    lessonPanelTitle.textContent = sectionName;
    lessonPanelDescription.textContent = isLearning
      ? "This lesson is being prepared. Its learning page will be added after the course materials have been checked."
      : "Homework has not been created for this lesson yet. Practice questions and worked solutions will be added later.";
  } else {
    lessonPanelLabel.textContent = "COURSE DIRECTORY";
    lessonPanelTitle.textContent = node.label;
    lessonPanelDescription.textContent = node.message ?? "This course section has not been populated yet.";
  }

  contentPlaceholder.hidden = true;
  lessonPage.hidden = false;
  document.title = `${node.label} | Johnly-math`;
}

dashboardNavButton?.addEventListener("click", () => {
  selectDashboardTab("courses");
  showDashboard();
});

document.querySelectorAll("[data-dashboard-tab]").forEach((button, index, buttons) => {
  button.addEventListener("click", () => selectDashboardTab(button.dataset.dashboardTab));
  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = buttons.length - 1;
    buttons[nextIndex].focus();
    selectDashboardTab(buttons[nextIndex].dataset.dashboardTab);
  });
});

initCurriculum({ onSelect: showCurriculumPage });
initAuth({ onAuthenticated: showWorkspace, onSignedOut: showWelcome });
