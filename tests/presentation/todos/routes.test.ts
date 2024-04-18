import request from "supertest";
import { testServer } from "../../test-server";
import { prisma } from "../../../src/data/postgres";

describe("routes.ts", () => {
  beforeAll(async () => {
    await testServer.start();
  });

  afterAll(() => {
    testServer.close();
  });

  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  const todo1 = { text: "Buy Comic" };
  const todo2 = { text: "Buy Milk" };

  test("should return all todos", async () => {
    await prisma.todo.createMany({ data: [todo1, todo2] });

    const { body, status } = await request(testServer.app).get("/api/todos");

    expect(body).toBeInstanceOf(Array);
    expect(status).toBe(200);
    expect(body.length).toBe(2);
    expect(body[0].text).toBe(todo1.text);
    expect(body[1].text).toBe(todo2.text);
  });

  test("should return a todo", async () => {
    const todo = await prisma.todo.create({ data: todo1 });

    const { body, status } = await request(testServer.app).get(
      `/api/todos/${todo.id}`
    );

    expect(status).toBe(200);
    expect(body).toEqual({
      id: todo.id,
      text: todo.text,
      completedAt: null,
    });
  });

  test("should return not found when search a todo", async () => {
    const todoId = 9999;

    const { body, status } = await request(testServer.app).get(
      `/api/todos/${todoId}`
    );

    expect(status).toBe(404);
    expect(body).toEqual({ error: `Todo with id ${todoId} not found` });
  });

  test("should return a new todo", async () => {
    const { body, status } = await request(testServer.app)
      .post("/api/todos")
      .send(todo1);

    expect(status).toBe(200);
    expect(body).toEqual({
      id: expect.any(Number),
      text: todo1.text,
      completedAt: null,
    });
  });

  test("should return an error is text is not present", async () => {
    const { body, status } = await request(testServer.app)
      .post("/api/todos")
      .send({});

    expect(status).toBe(400);
    expect(body).toEqual({ error: "Text property is required" });
  });

  test("should return an error is text is empty", async () => {
    const { body, status } = await request(testServer.app)
      .post("/api/todos")
      .send({ text: "" });

    expect(status).toBe(400);
    expect(body).toEqual({ error: "Text property is required" });
  });

  test("should return an updated todo", async () => {
    const todo = await prisma.todo.create({ data: todo1 });

    const { body, status } = await request(testServer.app)
      .put(`/api/todos/${todo.id}`)
      .send({ text: "Test update", completedAt: "2023-10-21" });

    expect(status).toBe(200);
    expect(body).toEqual({
      id: todo.id,
      text: "Test update",
      completedAt: "2023-10-21T00:00:00.000Z",
    });
  });

  test("should return an error if todo not found", async () => {
    const todoId = 9999;

    const { body, status } = await request(testServer.app)
      .put(`/api/todos/${todoId}`)
      .send({ text: "Test update", completedAt: "2023-10-21" });

    expect(status).toBe(404);
    expect(body).toEqual({ error: `Todo with id ${todoId} not found` });
  });

  test("should return an updated todo only the date", async () => {
    const todo = await prisma.todo.create({ data: todo1 });

    const { body, status } = await request(testServer.app)
      .put(`/api/todos/${todo.id}`)
      .send({ completedAt: "2023-10-21" });

    expect(status).toBe(200);
    expect(body).toEqual({
      id: todo.id,
      text: todo.text,
      completedAt: "2023-10-21T00:00:00.000Z",
    });
  });

  test("should delete a todo", async () => {
    const todo = await prisma.todo.create({ data: todo1 });

    const { body, status } = await request(testServer.app).delete(
      `/api/todos/${todo.id}`
    );

    expect(status).toBe(200);
    expect(body).toEqual({
      id: todo.id,
      text: todo.text,
      completedAt: null,
    });
  });

  test("should return an error if todo not found", async () => {
    const todoId = 9999;

    const { body, status } = await request(testServer.app).delete(
      `/api/todos/${todoId}`
    );

    expect(status).toBe(404);
    expect(body).toEqual({ error: `Todo with id ${todoId} not found` });
  });
});
