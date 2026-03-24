const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const { sendNotification } = require("../utils/notify");
const { getDefaultNotifPrefs } = require("../utils/notifPrefs");

jest.mock("../models/User");

describe("Notification preferences API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("GET returns defaults for incomplete prefs", async () => {
    // Arrange
    User.findById.mockResolvedValue({
      _id: "user-1",
      notifPrefs: {
        task_assigned: { inApp: false }
      }
    });

    // Act
    const res = await request(app)
      .get("/api/users/me/notification-prefs")
      .set("Authorization", "Bearer user-1");

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.prefs).toEqual({
      ...getDefaultNotifPrefs(),
      task_assigned: { inApp: false, email: false }
    });
  });

  it("PATCH updates a specific channel only", async () => {
    // Arrange
    const updatedPrefs = {
      ...getDefaultNotifPrefs(),
      task_review: { inApp: true, email: false }
    };
    User.findById.mockResolvedValue({ _id: "user-1", notifPrefs: getDefaultNotifPrefs() });
    User.findByIdAndUpdate.mockResolvedValue({ _id: "user-1", notifPrefs: updatedPrefs });

    // Act
    const res = await request(app)
      .patch("/api/users/me/notification-prefs")
      .set("Authorization", "Bearer user-1")
      .send({ task_review: { email: false } });

    // Assert
    expect(res.status).toBe(200);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      "user-1",
      { $set: { "notifPrefs.task_review.email": false } },
      { new: true }
    );
    expect(res.body.data.prefs.task_review).toEqual({ inApp: true, email: false });
    expect(res.body.data.prefs.task_done).toEqual({ inApp: true, email: false });
  });

  it("PATCH ignores unknown keys and channels", async () => {
    // Arrange
    const defaults = getDefaultNotifPrefs();
    User.findById.mockResolvedValue({ _id: "user-1", notifPrefs: defaults });
    User.findByIdAndUpdate.mockResolvedValue({
      _id: "user-1",
      notifPrefs: {
        ...defaults,
        task_done: { inApp: false, email: false }
      }
    });

    // Act
    const res = await request(app)
      .patch("/api/users/me/notification-prefs")
      .set("Authorization", "Bearer user-1")
      .send({
        random_type: { inApp: false },
        task_done: { inApp: false, sms: true }
      });

    // Assert
    expect(res.status).toBe(200);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      "user-1",
      { $set: { "notifPrefs.task_done.inApp": false } },
      { new: true }
    );
    expect(res.body.data.prefs.task_done).toEqual({ inApp: false, email: false });
  });

  it("PATCH with malformed payload is a no-op and returns current prefs", async () => {
    // Arrange
    const defaults = getDefaultNotifPrefs();
    User.findById.mockResolvedValue({ _id: "user-1", notifPrefs: defaults });

    // Act
    const res = await request(app)
      .patch("/api/users/me/notification-prefs")
      .set("Authorization", "Bearer user-1")
      .send([]);

    // Assert
    expect(res.status).toBe(200);
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(res.body.data.prefs).toEqual(defaults);
  });
});

describe("sendNotification", () => {
  it("respects inApp disabled preference", () => {
    // Arrange
    const createInAppNotification = jest.fn();
    const user = {
      notifPrefs: {
        task_done: { inApp: false, email: false }
      }
    };

    // Act
    const result = sendNotification({
      user,
      type: "task_done",
      createInAppNotification
    });

    // Assert
    expect(createInAppNotification).not.toHaveBeenCalled();
    expect(result).toEqual({ deliveredInApp: false, reason: "inApp_disabled" });
  });

  it("delivers email when enabled even if inApp is disabled", () => {
    // Arrange
    const createInAppNotification = jest.fn();
    const sendEmail = jest.fn();
    const user = {
      notifPrefs: {
        task_review: { inApp: false, email: true }
      }
    };

    // Act
    const result = sendNotification({
      user,
      type: "task_review",
      createInAppNotification,
      sendEmail,
      emailPayload: { subject: "Review requested" }
    });

    // Assert
    expect(createInAppNotification).not.toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith({ subject: "Review requested" });
    expect(result).toEqual({ deliveredInApp: false, deliveredEmail: true });
  });
});
