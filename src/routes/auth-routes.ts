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
  });
