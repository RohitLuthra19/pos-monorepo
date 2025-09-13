import { Request, Response } from "express";
import { ServerOptions } from "../index";

export default function configured(opts: ServerOptions) {
  return function (_req: Request, res: Response) {
    res.json({
      opts: opts,
    });
  };
}
