import dotenv from "dotenv";
dotenv.config({ path: "./server/.env" }); // IMPORTANT: tests run from root

import request from "supertest";
import jwt from "jsonwebtoken";
import app from "./app.js";
import * as todoRepo from "./repository/todoRepository.js";

const getToken = (email = "student@example.com") =>
  jwt.sign({ email }, process.env.JWT_SECRET);

beforeEach(() => {
  todoRepo.reset();
});

test("1) GET / returns a list (200 + array)", async () => {
  const res = await request(app).get("/");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test("2) POST /create without a token → 401", async () => {
  const res = await request(app).post("/create").send({ description: "X" });
  expect(res.status).toBe(401);
});

test("3) POST /create with a token → 201 + id", async () => {
  const token = getToken();

  const res = await request(app)
    .post("/create")
    .set("Authorization", token)
    .send({ description: "Test task" });

  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty("id");
  expect(res.body).toHaveProperty("description", "Test task");
});

test("4) POST /create with missing data → 400", async () => {
  const token = getToken();

  const res = await request(app)
    .post("/create")
    .set("Authorization", token)
    .send({}); // missing description

  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty("error");
});

test("5) POST /create then GET / returns created task", async () => {
  const token = getToken();

  await request(app)
    .post("/create")
    .set("Authorization", token)
    .send({ description: "Buy milk" })
    .expect(201);

  const getRes = await request(app).get("/").expect(200);

  expect(getRes.body.length).toBe(1);
  expect(getRes.body[0].description).toBe("Buy milk");
});

test("6) POST /create with invalid token → 401", async () => {
  const res = await request(app)
    .post("/create")
    .set("Authorization", "invalid-token")
    .send({ description: "Test" });

  expect(res.status).toBe(401);
});

test("7) DELETE removes task", async () => {
  const token = getToken();

  await request(app)
    .post("/create")
    .set("Authorization", token)
    .send({ description: "Delete me" })
    .expect(201);

  const deleteRes = await request(app)
    .delete("/1")
    .set("Authorization", token);

  expect(deleteRes.status).toBe(204);

  const getRes = await request(app).get("/").expect(200);
  expect(getRes.body.length).toBe(0);
});

test("8) DELETE unknown id → 404", async () => {
  const token = getToken();

  const res = await request(app)
    .delete("/999")
    .set("Authorization", token);

  expect(res.status).toBe(404);
});

test("9) POST /create with short description → 400", async () => {
  const token = getToken();

  const res = await request(app)
    .post("/create")
    .set("Authorization", token)
    .send({ description: "A" });

  expect(res.status).toBe(400);
});

test("10) GET / when empty returns empty array", async () => {
  const res = await request(app).get("/").expect(200);
  expect(res.body).toEqual([]);
});