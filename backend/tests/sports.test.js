const request = require("supertest");
const app = require("../src/app");

describe("Sports", () => {
  it("returns sports", async () => {
    const res = await request(app).get("/api/sports");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("includes pickleball", async () => {
    const res = await request(app).get("/api/sports");
    expect(res.body).toContain("pickleball");
  });
});