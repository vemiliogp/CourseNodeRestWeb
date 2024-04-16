import { Request, Response } from "express";
import { prisma } from "../../data/postgres";
import { CreateTodoDto, UpdateTodoDto } from "../../domain/dtos";

const todos = [
  { id: 1, text: "Buy Milk", completedAt: new Date() },
  { id: 2, text: "Buy Bread", completedAt: null },
  { id: 3, text: "Buy Butter", completedAt: new Date() },
];

export class TodosController {
  constructor() {}

  public getTodos = async (req: Request, res: Response) => {
    const todos = await prisma.todo.findMany();
    res.json(todos);
  };

  public getTodoById = async (req: Request, res: Response) => {
    const id = +req.params.id;
    if (isNaN(id))
      return res.status(400).json({ error: "Id argument is not a number" });

    const todo = await prisma.todo.findFirst({ where: { id } });

    todo
      ? res.json(todo)
      : res.status(404).json({ error: `Todo with id ${id} not found` });
  };

  public createTodo = async (req: Request, res: Response) => {
    const [error, createTodoDto] = CreateTodoDto.create(req.body);

    if (error) return res.status(400).json({ error });

    const todo = await prisma.todo.create({ data: createTodoDto! });

    res.json(todo);
  };

  public updateTodo = async (req: Request, res: Response) => {
    const id = +req.params.id;
    const [error, updatedTodoDto] = UpdateTodoDto.create({ ...req.body, id });

    if (error) return res.status(400).json({ error });

    const todo = await prisma.todo.findFirst({ where: { id } });
    if (!todo)
      return res.status(404).json({ error: `Todo with id ${id} not found` });

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: updatedTodoDto!.values,
    });

    res.json(updatedTodo);
  };

  public deleteTodo = async (req: Request, res: Response) => {
    const id = +req.params.id;
    if (isNaN(id))
      return res.status(400).json({ error: "Id argument is not a number" });

    const todo = await prisma.todo.findFirst({ where: { id } });
    if (!todo)
      return res.status(404).json({ error: `Todo with id ${id} not found` });

    const deletedTodo = await prisma.todo.delete({ where: { id } });

    deletedTodo
      ? res.json(deletedTodo)
      : res.status(400).json({ error: `Todo with id ${id} not found` });
  };
}
