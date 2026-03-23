const { normalizeNotifPrefs } = require("./notifPrefs");

function sendNotification({ user, type, createInAppNotification }) {
  const normalizedPrefs = normalizeNotifPrefs(user && user.notifPrefs);
  const typePrefs = normalizedPrefs[type];

  if (typePrefs && typePrefs.inApp === false) {
    return { deliveredInApp: false, reason: "inApp_disabled" };
  }

  if (typeof createInAppNotification === "function") {
    createInAppNotification();
  }

  return { deliveredInApp: true };
}

module.exports = { sendNotification };
