/**
 * Per-account learning progress for the static Johnly-math prototype.
 * Data is scoped by normalized username and persisted in this browser's localStorage.
 * A static site has no cross-device/server synchronization until a backend is added.
 */
const STORAGE_PREFIX = "johnly-math.progress.v1:";
const LESSON_ID_PATTERN = /^[a-z0-9-]{1,100}$/i;

function normalizeUsername(username) {
  return typeof username === "string" ? username.trim().toLowerCase() : "";
}

function storageKey(username) {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;
  return `${STORAGE_PREFIX}${encodeURIComponent(normalized)}`;
}

function validIdList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item) => typeof item === "string" && LESSON_ID_PATTERN.test(item)))].slice(0, 500);
}

function readAccountProgress(username) {
  const key = storageKey(username);
  if (!key) return { version: 1, lessons: {} };
  try {
    const raw = globalThis.localStorage.getItem(key);
    if (!raw) return { version: 1, lessons: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !parsed.lessons || typeof parsed.lessons !== "object" || Array.isArray(parsed.lessons)) {
      return { version: 1, lessons: {} };
    }
    const lessons = {};
    for (const [lessonId, record] of Object.entries(parsed.lessons)) {
      if (!LESSON_ID_PATTERN.test(lessonId) || !record || typeof record !== "object") continue;
      lessons[lessonId] = {
        completedQuestions: validIdList(record.completedQuestions),
        completedExamples: validIdList(record.completedExamples),
        updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : "",
      };
    }
    return { version: 1, lessons };
  } catch {
    return { version: 1, lessons: {} };
  }
}

export function loadLessonProgress(username, lessonId) {
  if (!LESSON_ID_PATTERN.test(String(lessonId ?? ""))) {
    return { completedQuestions: [], completedExamples: [] };
  }
  const progress = readAccountProgress(username).lessons[lessonId];
  return progress
    ? {
        completedQuestions: [...progress.completedQuestions],
        completedExamples: [...progress.completedExamples],
      }
    : { completedQuestions: [], completedExamples: [] };
}

export function saveLessonProgress(username, lessonId, update = {}) {
  const key = storageKey(username);
  if (!key || !LESSON_ID_PATTERN.test(String(lessonId ?? ""))) return false;
  const account = readAccountProgress(username);
  const previous = account.lessons[lessonId] ?? { completedQuestions: [], completedExamples: [] };
  const completedQuestions = validIdList(update.completedQuestions ?? previous.completedQuestions);
  const completedExamples = validIdList(update.completedExamples ?? previous.completedExamples);
  account.lessons[lessonId] = {
    completedQuestions,
    completedExamples,
    updatedAt: new Date().toISOString(),
  };
  try {
    globalThis.localStorage.setItem(key, JSON.stringify(account));
    return true;
  } catch {
    return false;
  }
}
