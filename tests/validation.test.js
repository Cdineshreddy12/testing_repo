const request = require("supertest");
const app = require("../app");
const User = require("../models/User");

jest.mock("../models/User");

describe("Validation middleware coverage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 for non-ObjectId profile id", async () => {
    const res = await request(app)
      .get("/api/users/not-an-id/profile")
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: "Invalid id" });
  });

  it("does not return 400 for valid ObjectId profile id", async () => {
    const lean = jest.fn().mockResolvedValue(null);
    const select = jest.fn().mockReturnValue({ lean });
    User.findById.mockReturnValue({ select });

    const res = await request(app)
      .get("/api/users/507f191e810c19729de860ea/profile")
      .set("Authorization", "Bearer test-token");

    expect(res.status).not.toBe(400);
  });

  it("returns 400 for PATCH notification prefs with invalid JSON body", async () => {
    User.findById.mockResolvedValue({ _id: "user-1", notifPrefs: {} });

    const res = await request(app)
      .patch("/api/users/me/notification-prefs")
      .set("Authorization", "Bearer user-1")
      .set("Content-Type", "application/json")
      .send("null");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({});
  });

  it("accepts PATCH notification prefs with empty object body", async () => {
    User.findById.mockResolvedValue({ _id: "user-1", notifPrefs: {} });

    const res = await request(app)
      .patch("/api/users/me/notification-prefs")
      .set("Authorization", "Bearer user-1")
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
