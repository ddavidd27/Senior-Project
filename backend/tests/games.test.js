const request = require("supertest");
const app = require("../src/app");
const { createUserAndGetToken } = require("./testUtils");

describe("Games", () => {
  it("creates game", async () => {
    const { token } = await createUserAndGetToken();

    const res = await request(app)
      .post("/api/games")
      .set("Authorization", `Bearer ${token}`)
      .send({
        sport: "tennis",
        type: "pickup",
        date: "2026-05-01",
        startTime: "18:00",
        level: "beginner",
        peopleNeeded: 4,
        locationName: "Court",
        locationLat: 1,
        locationLng: 1
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.sport).toBe("tennis");
  });

  it("rejects without token", async () => {
    const res = await request(app).post("/api/games").send({});
    expect(res.statusCode).toBe(401);
  });

  it("gets games list", async () => {
    const res = await request(app).get("/api/games");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("allows a user to join a game", async () => {
    const { token: ownerToken } = await createUserAndGetToken();
    const { token: playerToken } = await createUserAndGetToken();

    const gameRes = await request(app)
      .post("/api/games")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        sport: "basketball",
        type: "pickup",
        date: "2026-05-10",
        startTime: "19:00",
        level: "beginner",
        peopleNeeded: 10,
        locationName: "Court A",
        locationLat: 37.1,
        locationLng: -113.5
      });

    const gameId = gameRes.body._id;

    const joinRes = await request(app)
      .post(`/api/games/${gameId}/join`)
      .set("Authorization", `Bearer ${playerToken}`);

    expect(joinRes.statusCode).toBe(200);
    expect(joinRes.body.message).toBe("Joined successfully");
  });

  it("does not allow the same user to join twice", async () => {
    const { token: ownerToken } = await createUserAndGetToken();
    const { token: playerToken } = await createUserAndGetToken();

    const gameRes = await request(app)
      .post("/api/games")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        sport: "basketball",
        type: "pickup",
        date: "2026-05-10",
        startTime: "19:00",
        level: "beginner",
        peopleNeeded: 10,
        locationName: "Court A",
        locationLat: 37.1,
        locationLng: -113.5
      });

    const gameId = gameRes.body._id;

    await request(app)
      .post(`/api/games/${gameId}/join`)
      .set("Authorization", `Bearer ${playerToken}`);

    const secondJoinRes = await request(app)
      .post(`/api/games/${gameId}/join`)
      .set("Authorization", `Bearer ${playerToken}`);

    expect(secondJoinRes.statusCode).toBe(400);
    expect(secondJoinRes.body.error).toBe("Already joined");
  });
});