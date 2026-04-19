const request = require("supertest");
const app = require("../src/app");

describe("Auth", () => {
  it("registers a user", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({
        firstName: "David",
        lastName: "Molina",
        email: "david@test.com",
        username: "david123",
        password: "123456",
        bio: "test bio",
        sports: [
          { name: "tennis", level: "beginner" }
        ]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe("david@test.com");
  });

  it("logs in correctly", async () => {
    await request(app)
      .post("/api/users")
      .send({
        firstName: "Test",
        lastName: "User",
        email: "login@test.com",
        username: "login123",
        password: "123456",
        bio: "test bio",
        sports: [
          { name: "basketball", level: "beginner" }
        ]
      });

    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: "login@test.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("login@test.com");
  });

  it("rejects wrong password", async () => {
    await request(app)
      .post("/api/users")
      .send({
        firstName: "Test",
        lastName: "User",
        email: "wrong@test.com",
        username: "wrong123",
        password: "123456",
        bio: "test bio",
        sports: [
          { name: "volleyball", level: "beginner" }
        ]
      });

    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: "wrong@test.com",
        password: "bad"
      });

    expect(res.statusCode).toBe(401);
  });
});