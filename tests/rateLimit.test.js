const request = require("supertest");
const User = require("../models/User");

jest.mock("../models/User");

function loadFreshApp() {
  jest.resetModules();
  return require("../app");
}

describe("Rate limiting coverage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 429 with Retry-After on 31st profile request", async () => {
    const app = loadFreshApp();
    const fakeUser = {
      _id: "507f191e810c19729de860ea",
      name: "Jane Doe",
      email: "jane@example.com",
      bio: "",
      avatarUrl: "",
      createdAt: "2025-01-15T10:30:00Z"
    };
    const lean = jest.fn().mockResolvedValue(fakeUser);
    const select = jest.fn().mockReturnValue({ lean });
    User.findById.mockReturnValue({ select });

    let res;
    for (let i = 0; i < 31; i += 1) {
      res = await request(app)
        .get("/api/users/507f191e810c19729de860ea/profile")
        .set("Authorization", "Bearer test-token");
    }

    expect(res.status).toBe(429);
    expect(res.headers["retry-after"]).toBeDefined();
  });

  it("returns 429 on 101st request for global limiter", async () => {
    const app = loadFreshApp();
    User.findById.mockResolvedValue({ _id: "user-1", notifPrefs: {} });

    let res;
    for (let i = 0; i < 101; i += 1) {
      res = await request(app)
        .get("/api/users/me/notification-prefs")
        .set("Authorization", "Bearer user-1");
    }

    expect(res.status).toBe(429);
  });

  it("returns standard rate-limit response shape", async () => {
    const app = loadFreshApp();
    User.findById.mockResolvedValue({ _id: "user-1", notifPrefs: {} });

    let res;
    for (let i = 0; i < 101; i += 1) {
      res = await request(app)
        .get("/api/users/me/notification-prefs")
        .set("Authorization", "Bearer user-1");
    }

    expect(res.status).toBe(429);
    expect(res.body).toEqual({ success: false, message: "Too many requests" });
  });
});
