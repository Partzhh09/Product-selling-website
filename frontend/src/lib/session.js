export const USER_SESSION_STORAGE_KEY = "hofo_user_session";
export const USER_SESSION_TEMP_STORAGE_KEY = "hofo_user_session_temp";
export const USER_SESSION_UPDATED_EVENT = "hofo_user_session_updated";

function parseStoredSession(rawValue) {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return {
      token: typeof parsed.token === "string" ? parsed.token : "",
      user: parsed.user && typeof parsed.user === "object" ? parsed.user : null
    };
  } catch {
    return null;
  }
}

function emitSessionUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(USER_SESSION_UPDATED_EVENT));
}

export function getStoredUserSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const persistentSession = parseStoredSession(window.localStorage.getItem(USER_SESSION_STORAGE_KEY));
  if (persistentSession) {
    return persistentSession;
  }

  return parseStoredSession(window.sessionStorage.getItem(USER_SESSION_TEMP_STORAGE_KEY));
}

export function setStoredUserSession(session, options = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const persistent = options.persistent !== false;
  const serialized = JSON.stringify(session || {});

  if (persistent) {
    window.localStorage.setItem(USER_SESSION_STORAGE_KEY, serialized);
    window.sessionStorage.removeItem(USER_SESSION_TEMP_STORAGE_KEY);
  } else {
    window.sessionStorage.setItem(USER_SESSION_TEMP_STORAGE_KEY, serialized);
    window.localStorage.removeItem(USER_SESSION_STORAGE_KEY);
  }

  emitSessionUpdated();
}

export function clearStoredUserSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(USER_SESSION_STORAGE_KEY);
  window.sessionStorage.removeItem(USER_SESSION_TEMP_STORAGE_KEY);
  emitSessionUpdated();
}
