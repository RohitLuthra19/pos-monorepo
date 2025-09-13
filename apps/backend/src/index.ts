import express, { Express, Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import pino from "pino";
import pinoHttp from "pino-http";
import http from "http";

import registerRoutes from "./routes";

export interface ServerOptions {
  port: number;
  host: string;
}

export type ReadyCallback = (
  err: Error | null | undefined,
  app?: Express,
  server?: http.Server,
) => void;

export default function main(options: ServerOptions, cb?: ReadyCallback) {
  const ready: ReadyCallback = cb || (() => {});
  const opts: ServerOptions = { ...options };

  const logger = pino();

  let server: http.Server;
  let serverStarted = false;
  let serverClosing = false;

  function unhandledError(err: unknown) {
    logger.error(err);
    if (serverClosing) return;
    serverClosing = true;
    if (serverStarted) {
      server.close(function () {
        process.exit(1);
      });
    }
  }
  process.on("uncaughtException", unhandledError);
  process.on("unhandledRejection", unhandledError);

  const app = express();

  app.use(pinoHttp({ logger }));

  registerRoutes(app, opts);

  app.use(function fourOhFourHandler(
    req: Request,
    _res: Response,
    next: NextFunction,
  ) {
    next(createHttpError(404, `Route not found: ${req.url}`));
  });
  app.use(function fiveHundredHandler(
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) {
    if (err.status >= 500) {
      logger.error(err);
    }
    res.status(err.status || 500).json({
      messages: [
        {
          code: err.code || "InternalServerError",
          message: err.message,
        },
      ],
    });
  });

  server = app.listen(opts.port, opts.host, function (err?: any) {
    if (err) {
      return ready(err, app, server);
    }
    if (serverClosing) {
      return ready(new Error("Server was closed before it could start"));
    }
    serverStarted = true;
    const addr = server.address() as any;
    logger.info(
      `Started at ${opts.host || addr.host || "localhost"}:${addr.port}`,
    );
    ready(err, app, server);
  });
}
