const USERS_STORAGE_KEY = "johnly-math.users.v1";
const SESSION_STORAGE_KEY = "johnly-math.session.v1";
const STORE_VERSION = 1;
const PASSWORD_HASH_ITERATIONS = 310_000;
const PASSWORD_HASH_BYTES = 32;
const SALT_BYTES = 16;
const USERNAME_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{2,19}$/;
const DUMMY_SALT_HEX = "7f3a9c10b2d4e6f80123456789abcdef";

let isSubmitting = false;
let lastFocusElement = null;
let onAuthenticatedCallback = () => {};
let onSignedOutCallback = () => {};

class AuthStorageError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthStorageError";
  }
}

function getElement(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Required authentication element is missing: #${id}`);
  return element;
}

function supportsSecureHashing() {
  return Boolean(globalThis.crypto && globalThis.crypto.subtle && typeof globalThis.crypto.getRandomValues === "function");
}

function normalizeUsername(value) {
  return String(value ?? "").trim();
}

function usernameKey(value) {
  return normalizeUsername(value).toLowerCase();
}

function validateUsername(value) {
  const username = normalizeUsername(value);
  if (!USERNAME_PATTERN.test(username)) {
    return "Username must be 3–20 characters, start with a letter, and contain only letters, numbers, underscores, or hyphens.";
  }
  return "";
}

function validateNewPassword(password, username) {
  if (typeof password !== "string" || password.length < 10) {
    return "Your password must be at least 10 characters long.";
  }
  if (password.length > 128) {
    return "Your password cannot be longer than 128 characters.";
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Your password must contain at least one letter and one number.";
  }
  const normalized = usernameKey(username);
  if (normalized.length >= 4 && password.toLowerCase().includes(normalized)) {
    return "For better security, do not include your username in your password.";
  }
  return "";
}

function bytesToHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  if (typeof hex !== "string" || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) {
    throw new AuthStorageError("Saved account data is invalid. It has not been overwritten.");
  }
  const result = new Uint8Array(hex.length / 2);
  for (let index = 0; index < hex.length; index += 2) {
    result[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
  }
  return result;
}

function equalHexInConstantTime(leftHex, rightHex) {
  let left;
  let right;
  try {
    left = hexToBytes(leftHex);
    right = hexToBytes(rightHex);
  } catch {
    return false;
  }
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

async function derivePasswordHash(password, salt, iterations = PASSWORD_HASH_ITERATIONS) {
  if (!supportsSecureHashing()) {
    throw new Error("Secure password hashing is unavailable. Open this site through HTTPS or a local development server such as http://localhost.");
  }
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    PASSWORD_HASH_BYTES * 8,
  );
  return bytesToHex(new Uint8Array(bits));
}

function readUserStore() {
  let raw;
  try {
    raw = globalThis.localStorage.getItem(USERS_STORAGE_KEY);
  } catch {
    throw new AuthStorageError("This browser is blocking local storage. Enable site storage to use this prototype account system.");
  }

  if (raw === null) return { version: STORE_VERSION, users: {} };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AuthStorageError("Saved account data could not be read. It has not been overwritten; check or clear this site's saved data if you want to reset the prototype.");
  }

  if (!parsed || parsed.version !== STORE_VERSION || !parsed.users || typeof parsed.users !== "object" || Array.isArray(parsed.users)) {
    throw new AuthStorageError("Saved account data has an unsupported format. It has not been overwritten.");
  }

  for (const [key, record] of Object.entries(parsed.users)) {
    if (
      typeof key !== "string" ||
      !record || typeof record !== "object" ||
      typeof record.username !== "string" || !USERNAME_PATTERN.test(record.username) ||
      usernameKey(record.username) !== key ||
      typeof record.salt !== "string" || !/^[0-9a-f]{32}$/i.test(record.salt) ||
      typeof record.passwordHash !== "string" || !/^[0-9a-f]{64}$/i.test(record.passwordHash) ||
      !Number.isInteger(record.iterations) || record.iterations < 100_000 || record.iterations > 2_000_000 ||
      typeof record.createdAt !== "string"
    ) {
      throw new AuthStorageError("A saved account record is invalid. The account data has not been overwritten.");
    }
  }

  return parsed;
}

function writeUserStore(store) {
  try {
    globalThis.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    throw new AuthStorageError("Your browser could not save this account. Check available storage and privacy settings, then try again.");
  }
}

function clearMessage(formType) {
  const message = getElement(`${formType}-message`);
  message.textContent = "";
  delete message.dataset.kind;
}

function setMessage(formType, text, kind = "error") {
  const message = getElement(`${formType}-message`);
  message.textContent = text;
  if (text) message.dataset.kind = kind;
  else delete message.dataset.kind;
}

function setFormBusy(form, busy, busyText) {
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  if (busy) {
    if (!button.dataset.originalLabel) button.dataset.originalLabel = button.textContent.trim();
    button.disabled = true;
    button.textContent = busyText;
    form.setAttribute("aria-busy", "true");
  } else {
    button.disabled = false;
    if (button.dataset.originalLabel) button.textContent = button.dataset.originalLabel;
    form.removeAttribute("aria-busy");
  }
}

function setAuthMode(mode) {
  const registerMode = mode === "register";
  const loginForm = getElement("login-form");
  const registerForm = getElement("register-form");
  const title = getElement("auth-title");
  const intro = getElement("auth-intro");
  const loginTab = getElement("login-tab");
  const registerTab = getElement("register-tab");

  loginForm.hidden = registerMode;
  registerForm.hidden = !registerMode;
  // Do not leave a password sitting in a hidden form when switching modes.
  loginForm.reset();
  registerForm.reset();
  loginTab.setAttribute("aria-selected", String(!registerMode));
  registerTab.setAttribute("aria-selected", String(registerMode));
  title.textContent = registerMode ? "Create your account" : "Welcome back";
  intro.textContent = registerMode
    ? "Create a local prototype account to enter your mathematics workspace."
    : "Log in to return to your mathematics workspace.";
  clearMessage("login");
  clearMessage("register");
}

function openAuth(mode, trigger) {
  const modal = getElement("auth-modal");
  lastFocusElement = trigger instanceof HTMLElement ? trigger : document.activeElement;
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setAuthMode(mode);
  const focusTarget = getElement(mode === "register" ? "register-username" : "login-username");
  queueMicrotask(() => focusTarget.focus());
}

function closeAuth() {
  const modal = getElement("auth-modal");
  if (modal.hidden) return;
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastFocusElement && typeof lastFocusElement.focus === "function" && document.contains(lastFocusElement)) {
    lastFocusElement.focus();
  }
}

function saveSession(username) {
  const session = {
    usernameKey: usernameKey(username),
    createdAt: Date.now(),
  };
  try {
    globalThis.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    throw new AuthStorageError("Your password was verified, but this browser could not start a session. Check browser storage settings and try again.");
  }
}

function removeSession() {
  try {
    globalThis.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Signing out must still clear the visible application state if browser storage is restricted.
  }
}

function getCurrentSessionUser() {
  let raw;
  try {
    raw = globalThis.sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    if (!session || typeof session.usernameKey !== "string" || !/^[a-z][a-z0-9_-]{2,19}$/.test(session.usernameKey)) {
      removeSession();
      return null;
    }
    const store = readUserStore();
    const record = store.users[session.usernameKey];
    if (!record) {
      removeSession();
      return null;
    }
    return { username: record.username };
  } catch {
    removeSession();
    return null;
  }
}

function finishAuthentication(user) {
  closeAuth();
  onAuthenticatedCallback({ username: user.username });
}

async function handleRegister(event) {
  event.preventDefault();
  if (isSubmitting) return;
  isSubmitting = true;
  const form = getElement("register-form");
  setFormBusy(form, true, "Creating account…");
  clearMessage("register");

  try {
    if (!supportsSecureHashing()) {
      throw new Error("Secure password hashing is unavailable in this context. Open this site through HTTPS or a local development server such as http://localhost.");
    }

    const formData = new FormData(form);
    const username = normalizeUsername(formData.get("username"));
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    const usernameError = validateUsername(username);
    if (usernameError) throw new Error(usernameError);
    const passwordError = validateNewPassword(password, username);
    if (passwordError) throw new Error(passwordError);
    if (password !== confirmPassword) throw new Error("The passwords do not match.");

    const store = readUserStore();
    const key = usernameKey(username);
    if (store.users[key]) throw new Error("That username is already registered. Choose another username or log in.");

    const salt = globalThis.crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const passwordHash = await derivePasswordHash(password, salt, PASSWORD_HASH_ITERATIONS);

    // Re-read immediately before writing to reduce duplicate-account races across tabs.
    const latestStore = readUserStore();
    if (latestStore.users[key]) throw new Error("That username was just registered in another tab. Choose another username or log in.");
    latestStore.users[key] = {
      username,
      salt: bytesToHex(salt),
      passwordHash,
      iterations: PASSWORD_HASH_ITERATIONS,
      createdAt: new Date().toISOString(),
    };
    writeUserStore(latestStore);

    try {
      saveSession(username);
    } catch (error) {
      setAuthMode("login");
      setMessage("login", "Your account was created, but the browser could not start a session. Please log in after checking storage settings.");
      return;
    }

    form.reset();
    finishAuthentication({ username });
  } catch (error) {
    setMessage("register", error instanceof Error ? error.message : "Registration failed. Please try again.");
  } finally {
    setFormBusy(form, false);
    isSubmitting = false;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  if (isSubmitting) return;
  isSubmitting = true;
  const form = getElement("login-form");
  setFormBusy(form, true, "Checking account…");
  clearMessage("login");

  try {
    if (!supportsSecureHashing()) {
      throw new Error("Secure password hashing is unavailable in this context. Open this site through HTTPS or a local development server such as http://localhost.");
    }

    const formData = new FormData(form);
    const username = normalizeUsername(formData.get("username"));
    const password = String(formData.get("password") ?? "");
    const usernameError = validateUsername(username);
    if (usernameError) throw new Error(usernameError);
    if (!password || password.length > 128) throw new Error("Username or password is incorrect.");

    const store = readUserStore();
    const key = usernameKey(username);
    const record = store.users[key];
    const salt = record ? hexToBytes(record.salt) : hexToBytes(DUMMY_SALT_HEX);
    const iterations = record ? record.iterations : PASSWORD_HASH_ITERATIONS;
    const candidateHash = await derivePasswordHash(password, salt, iterations);

    if (!record || !equalHexInConstantTime(candidateHash, record.passwordHash)) {
      throw new Error("Username or password is incorrect.");
    }

    saveSession(record.username);
    form.reset();
    finishAuthentication({ username: record.username });
  } catch (error) {
    setMessage("login", error instanceof Error ? error.message : "Sign-in failed. Please try again.");
  } finally {
    setFormBusy(form, false);
    isSubmitting = false;
  }
}

export function initAuth({ onAuthenticated = () => {}, onSignedOut = () => {} } = {}) {
  onAuthenticatedCallback = typeof onAuthenticated === "function" ? onAuthenticated : () => {};
  onSignedOutCallback = typeof onSignedOut === "function" ? onSignedOut : () => {};

  document.querySelectorAll("[data-open-auth]").forEach(button => {
    button.addEventListener("click", () => openAuth(button.dataset.openAuth, button));
  });
  document.querySelectorAll("[data-auth-mode]").forEach(button => {
    button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
  });

  getElement("auth-close").addEventListener("click", closeAuth);
  getElement("auth-modal").addEventListener("click", event => {
    if (event.target === getElement("auth-modal")) closeAuth();
  });
  document.addEventListener("keydown", event => {
    const modal = getElement("auth-modal");
    if (modal.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeAuth();
      return;
    }
    if (event.key === "Tab") {
      const focusable = Array.from(modal.querySelectorAll('button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'))
        .filter(element => !element.hidden && !element.closest("[hidden]") && element.getAttribute("aria-hidden") !== "true");
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  getElement("login-form").addEventListener("submit", handleLogin);
  getElement("register-form").addEventListener("submit", handleRegister);
  document.querySelectorAll("[data-sign-out]").forEach(button => {
    button.addEventListener("click", () => {
      removeSession();
      onSignedOutCallback();
    });
  });

  const currentUser = getCurrentSessionUser();
  if (currentUser) onAuthenticatedCallback(currentUser);
}
