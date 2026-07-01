import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

const app = new Elysia()
  // Health check endpoint
  .get("/ping", () => ({ status: "ok", message: "pong" }))
  
  // API Group for Users to verify database integration
  .group("/users", (app) =>
    app
      .get("/", async () => {
        try {
          const allUsers = await db.select().from(users);
          return allUsers;
        } catch (error) {
          return { error: (error as Error).message };
        }
      })
      .post("/", async ({ body }) => {
        try {
          const { name, email } = body as { name: string; email: string };
          if (!name || !email) {
            return { error: "Name and email are required" };
          }
          const newUser = await db.insert(users).values({ name, email }).returning();
          return newUser[0];
        } catch (error) {
          return { error: (error as Error).message };
        }
      })
  )
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
