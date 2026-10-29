const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../src/app");
const Food = require("../src/models/Food");

let mongoServer;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: "food-api-tests" });
  await Food.init();
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test("food API supports CRUD, validation, uniqueness, search, and health checks", async () => {
  const health = await request(app).get("/health");
  assert.equal(health.status, 200);
  assert.deepEqual(health.body, { status: "ok", database: "connected" });

  const invalidCreate = await request(app).post("/api/foods").send({
    foodId: " ",
    name: 123,
    category: "",
    price: -1,
  });
  assert.equal(invalidCreate.status, 400);
  assert.ok(invalidCreate.body.details.length > 0);

  const invalidJson = await request(app)
    .post("/api/foods")
    .set("Content-Type", "application/json")
    .send('{"foodId":');
  assert.equal(invalidJson.status, 400);

  const unknownEndpoint = await request(app).get("/api/unknown");
  assert.equal(unknownEndpoint.status, 404);
  assert.equal(typeof unknownEndpoint.body.error, "string");

  const created = await request(app).post("/api/foods").send({
    foodId: "FOOD-001",
    name: "Phở bò",
    category: "Món nước",
    region: "Miền Bắc",
    description: "Phở truyền thống",
    price: 50000,
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.foodId, "FOOD-001");

  const duplicate = await request(app).post("/api/foods").send({
    foodId: "FOOD-001",
    name: "Phở gà",
    category: "Món nước",
  });
  assert.equal(duplicate.status, 409);

  const list = await request(app).get("/api/foods");
  assert.equal(list.status, 200);
  assert.equal(list.body.length, 1);

  const byName = await request(app).get("/api/foods?search=pho");
  assert.equal(byName.status, 200);
  assert.equal(byName.body.length, 1);

  const byCategory = await request(app).get("/api/foods?search=nước");
  assert.equal(byCategory.body.length, 1);

  const byRegion = await request(app).get("/api/foods?search=bắc");
  assert.equal(byRegion.body.length, 1);

  const escapedSearch = await request(app).get("/api/foods?search=.*");
  assert.equal(escapedSearch.body.length, 0);

  const foodId = created.body._id;
  const found = await request(app).get(`/api/foods/${foodId}`);
  assert.equal(found.status, 200);
  assert.equal(found.body.name, "Phở bò");

  const invalidId = await request(app).get("/api/foods/not-an-object-id");
  assert.equal(invalidId.status, 400);

  const missing = await request(app).get(`/api/foods/${new mongoose.Types.ObjectId()}`);
  assert.equal(missing.status, 404);

  const invalidUpdate = await request(app).put(`/api/foods/${foodId}`).send({ price: -10 });
  assert.equal(invalidUpdate.status, 400);

  const emptyUpdate = await request(app).put(`/api/foods/${foodId}`).send({});
  assert.equal(emptyUpdate.status, 400);

  const updated = await request(app).put(`/api/foods/${foodId}`).send({
    name: "Phở bò đặc biệt",
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.name, "Phở bò đặc biệt");

  const secondFood = await request(app).post("/api/foods").send({
    foodId: "FOOD-002",
    name: "Bún bò",
    category: "Món nước",
  });
  assert.equal(secondFood.status, 201);

  const duplicateUpdate = await request(app)
    .put(`/api/foods/${foodId}`)
    .send({ foodId: "FOOD-002" });
  assert.equal(duplicateUpdate.status, 409);

  const deleteMissing = await request(app).delete(`/api/foods/${new mongoose.Types.ObjectId()}`);
  assert.equal(deleteMissing.status, 404);

  const deleted = await request(app).delete(`/api/foods/${foodId}`);
  assert.equal(deleted.status, 200);
  assert.equal(deleted.body.data.foodId, "FOOD-001");
  const remaining = await request(app).get("/api/foods");
  assert.equal(remaining.body.length, 1);
  assert.equal(remaining.body[0].foodId, "FOOD-002");
});

test("health endpoint reports unavailable when MongoDB is disconnected", async () => {
  const preflight = await request(app)
    .options("/api/foods")
    .set("Origin", "http://localhost:5173")
    .set("Access-Control-Request-Method", "POST");
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers["access-control-allow-origin"], "http://localhost:5173");

  await mongoose.disconnect();

  const response = await request(app).get("/health");
  assert.equal(response.status, 503);
  assert.deepEqual(response.body, { status: "unavailable", database: "disconnected" });

  await mongoose.connect(mongoServer.getUri(), { dbName: "food-api-tests" });
});
