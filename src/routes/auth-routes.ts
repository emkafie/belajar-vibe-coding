import { Elysia } from "elysia";
import { AuthServices } from "../services/auth-services";

export const authRoutes = new Elysia()
  // POST /login -> log user in and return a session token
  .post("/login", async ({ body, set }) => {
    try {
      const { email, password } = body as { email?: string; password?: string };
      const token = await AuthServices.loginUser(email, password);
      
      return {
        status: "ok",
        message: "Login successfully",
        data: token,
      };
    } catch (error) {
      set.status = 401;
      return {
        status: "error",
        message: "Login failed",
        data: null,
      };
    }
  })

  // DELETE /user/logout -> logout user by deleting their session token
  .delete("/user/logout", async ({ headers, set }) => {
    try {
      const authHeader = headers["authorization"];
      if (!authHeader || authHeader.slice(0, 7).toLowerCase() !== "bearer ") {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const token = authHeader.substring(7); // "Bearer " is 7 chars long
      const success = await AuthServices.logoutUser(token);
      
      if (!success) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      return { data: "OK" };
    } catch (error) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  });
