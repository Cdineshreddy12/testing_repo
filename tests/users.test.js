const request = require("supertest");
const app = require("../app");
const User = require("../models/User");

jest.mock("../models/User");

describe("GET /api/users/:id/profile", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with correct shape for valid user", async () => {
    const fakeUser = {
      _id: "abc123",
      name: "Jane Doe",
      email: "jane@example.com",
      avatarUrl: "",
      bio: "Full-stack developer",
      createdAt: "2025-01-15T10:30:00Z"
    };

    const lean = jest.fn().mockResolvedValue(fakeUser);
    const select = jest.fn().mockReturnValue({ lean });
    User.findById.mockReturnValue({ select });

    const res = await request(app)
      .get("/api/users/abc123/profile")
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({
      id: "abc123",
      name: "Jane Doe",
      email: "jane@example.com",
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Jane%20Doe",
      bio: "Full-stack developer",
      createdAt: "2025-01-15T10:30:00Z"
    });
  });

  it("returns 404 for unknown user id", async () => {
    const lean = jest.fn().mockResolvedValue(null);
    const select = jest.fn().mockReturnValue({ lean });
    User.findById.mockReturnValue({ select });

    const res = await request(app)
      .get("/api/users/unknown/profile")
      .set("Authorization", "Bearer test-token");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "User not found" });
  });

  it("returns 401 when no auth token is provided", async () => {
    const res = await request(app).get("/api/users/abc123/profile");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Unauthorised" });
  });
});

describe("PATCH /api/users/:id/bio", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and updates bio for same authenticated user", async () => {
    const updatedUser = { _id: "507f191e810c19729de860ea", bio: "Hello world" };
    const lean = jest.fn().mockResolvedValue(updatedUser);
    const select = jest.fn().mockReturnValue({ lean });
    User.findByIdAndUpdate.mockReturnValue({ select });

    const res = await request(app)
      .patch("/api/users/507f191e810c19729de860ea/bio")
      .set("Authorization", "Bearer 507f191e810c19729de860ea")
      .send({ bio: "  Hello world  " });

    expect(res.status).toBe(200);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      "507f191e810c19729de860ea",
      { $set: { bio: "Hello world" } },
      { new: true }
    );
    expect(res.body).toEqual({
      success: true,
      data: { id: "507f191e810c19729de860ea", bio: "Hello world" }
    });
  });

  it("returns 401 when no auth token is provided", async () => {
    const res = await request(app)
      .patch("/api/users/507f191e810c19729de860ea/bio")
      .send({ bio: "hello" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Unauthorised" });
  });

  it("returns 403 when token user updates another user bio", async () => {
    const res = await request(app)
      .patch("/api/users/507f191e810c19729de860eb/bio")
      .set("Authorization", "Bearer 507f191e810c19729de860ea")
      .send({ bio: "hello" });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ success: false, message: "Forbidden" });
  });

  it("returns 404 when user is not found", async () => {
    const lean = jest.fn().mockResolvedValue(null);
    const select = jest.fn().mockReturnValue({ lean });
    User.findByIdAndUpdate.mockReturnValue({ select });

    const res = await request(app)
      .patch("/api/users/507f191e810c19729de860ea/bio")
      .set("Authorization", "Bearer 507f191e810c19729de860ea")
      .send({ bio: "hello" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "User not found" });
  });

  it("returns 400 when bio exceeds 500 chars", async () => {
    const res = await request(app)
      .patch("/api/users/507f191e810c19729de860ea/bio")
      .set("Authorization", "Bearer 507f191e810c19729de860ea")
      .send({ bio: "a".repeat(501) });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Bio must be 500 characters or fewer"
    });
  });
});
