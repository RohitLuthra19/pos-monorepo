import { Request, Response } from "express";

export default function simple(_req: Request, res: Response) {
  res.json({
    hello: "world!",
  });
}
