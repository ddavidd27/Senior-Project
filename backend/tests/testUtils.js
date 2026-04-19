const request = require("supertest");
const app = require("../src/app");

async function createUserAndGetToken() {
  const unique = Date.now() + Math.floor(Math.random() * 1000);

  const res = await request(app)
    .post("/api/users")
    .send({
      firstName: "Test",
      lastName: "User",
      email: `user${unique}@test.com`,
      username: `user${unique}`,
      password: "123456",
      bio: "test bio",
      sports: [
        { name: "tennis", level: "beginner" }
      ]
    });

  return {
    token: res.body.token,
    user: res.body.user,
    response: res
  };
}

module.exports = {
  createUserAndGetToken
};