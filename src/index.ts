import { Elysia } from "elysia";
import { userRoutes } from "./routes/user-routes";
import { authRoutes } from "./routes/auth-routes";

export const app = new Elysia()
  .use(userRoutes)
  .use(authRoutes)
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
