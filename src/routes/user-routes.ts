import { Elysia } from "elysia";
import { UserServices } from "../services/user-services";

export const userRoutes = new Elysia()
  // GET /ping -> test database connection
  .get("/ping", async ({ set }) => {
    const isHealthy = await UserServices.checkDbConnection();
    if (isHealthy) {
      return {
        status: "ok",
        message: "Database connection test successful",
        data: "ok",
      };
    } else {
      set.status = 500;
      return {
        status: "error",
        message: "Database connection test failed",
        data: null,
      };
    }
  })

  // GET /users -> list all users
  .get("/users", async ({ set }) => {
    try {
      const allUsers = await UserServices.getAllUsers();
      return {
        status: "ok",
        message: "Users fetched successfully",
        data: allUsers,
      };
    } catch (error) {
      set.status = 500;
      return {
        status: "error",
        message: "Failed to fetch users",
        data: null,
      };
    }
  })

  // POST /users -> register a new user
  .post("/users", async ({ body, set }) => {
    try {
      await UserServices.createUser(body);
      set.status = 201;
      return {
        status: "ok",
        message: "User created successfully",
        data: "ok",
      };
    } catch (error) {
      set.status = 400;
      return {
        status: "error",
        message: "User created failed",
        data: null,
      };
    }
  })

  // POST /user/current -> get currently logged in user from Bearer token
  .post("/user/current", async ({ headers, set }) => {
    try {
      const authHeader = headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const token = authHeader.substring(7); // "Bearer " is 7 chars long
      const user = await UserServices.getCurrentUserByToken(token);
      
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      return { data: user };
    } catch (error) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  });
