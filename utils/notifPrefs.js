const DEFAULT_NOTIF_PREFS = {
  task_assigned: { inApp: true, email: false },
  task_review: { inApp: true, email: true },
  task_done: { inApp: true, email: false },
  comment_mention: { inApp: true, email: true },
  bug_opened: { inApp: true, email: false }
};

function getDefaultNotifPrefs() {
  return JSON.parse(JSON.stringify(DEFAULT_NOTIF_PREFS));
}

function normalizeNotifPrefs(rawPrefs) {
  const normalized = getDefaultNotifPrefs();
  if (!rawPrefs || typeof rawPrefs !== "object") {
    return normalized;
  }

  Object.keys(DEFAULT_NOTIF_PREFS).forEach((type) => {
    const maybeTypePrefs = rawPrefs[type];
    if (!maybeTypePrefs || typeof maybeTypePrefs !== "object") {
      return;
    }

    ["inApp", "email"].forEach((channel) => {
      if (typeof maybeTypePrefs[channel] === "boolean") {
        normalized[type][channel] = maybeTypePrefs[channel];
      }
    });
  });

  return normalized;
}

function buildNotifPrefsSetUpdate(patchBody) {
  const setFields = {};

  if (!patchBody || typeof patchBody !== "object" || Array.isArray(patchBody)) {
    return { setFields, hasValidUpdates: false };
  }

  Object.keys(DEFAULT_NOTIF_PREFS).forEach((type) => {
    const maybeTypePrefs = patchBody[type];
    if (!maybeTypePrefs || typeof maybeTypePrefs !== "object" || Array.isArray(maybeTypePrefs)) {
      return;
    }

    ["inApp", "email"].forEach((channel) => {
      if (typeof maybeTypePrefs[channel] === "boolean") {
        setFields[`notifPrefs.${type}.${channel}`] = maybeTypePrefs[channel];
      }
    });
  });

  return { setFields, hasValidUpdates: Object.keys(setFields).length > 0 };
}

module.exports = {
  DEFAULT_NOTIF_PREFS,
  getDefaultNotifPrefs,
  normalizeNotifPrefs,
  buildNotifPrefsSetUpdate
};
