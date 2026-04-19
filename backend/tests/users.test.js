const request = require("supertest");
const app = require("../src/app");

describe("Users", () => {
  it("gets current user with token", async () => {
    const register = await request(app)
      .post("/api/users")
      .send({
        firstName: "Mario",
        lastName: "Perez",
        email: "mario@test.com",
        username: "mario123",
        password: "123456",
        bio: "test bio",
        sports: [
          { name: "football", level: "beginner" }
        ]
      });

    const token = register.body.token;

    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("mario@test.com");
  });

  it("rejects without token", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.statusCode).toBe(401);
  });
});