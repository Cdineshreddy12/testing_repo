const { normalizeNotifPrefs } = require("./notifPrefs");

function sendNotification({ user, type, createInAppNotification, sendEmail, emailPayload }) {
  const normalizedPrefs = normalizeNotifPrefs(user && user.notifPrefs);
  const typePrefs = normalizedPrefs[type];
  const inAppEnabled = !(typePrefs && typePrefs.inApp === false);
  const emailEnabled = Boolean(typePrefs && typePrefs.email === true);

  if (!inAppEnabled && !emailEnabled) {
    return { deliveredInApp: false, reason: "inApp_disabled" };
  }

  if (inAppEnabled && typeof createInAppNotification === "function") {
    createInAppNotification();
  }

  let deliveredEmail = false;
  if (emailEnabled && typeof sendEmail === "function") {
    sendEmail(emailPayload);
    deliveredEmail = true;
  }

  return { deliveredInApp: inAppEnabled, deliveredEmail };
}

module.exports = { sendNotification };
