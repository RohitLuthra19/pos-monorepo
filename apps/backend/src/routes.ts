import { Express } from "express";
import simple from "./handlers/simple";
import configured from "./handlers/configured";
import { ServerOptions } from "./index";

export default function registerRoutes(app: Express, opts: ServerOptions) {
  app.get("/", simple);
  app.get("/configured", configured(opts));
}
