import { Elysia, t } from "elysia";
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
  }, {
    body: t.Object({
      email: t.String({ format: "email", description: "Email terdaftar" }),
      password: t.String({ description: "Password akun user" }),
    }),
    detail: {
      summary: "User Login",
      description: "Verifikasi email dan password untuk mendapatkan token sesi aktif.",
    },
    response: {
      200: t.Object({
        status: t.String({ default: "ok" }),
        message: t.String({ default: "Login successfully" }),
        data: t.String({ default: "c8bc1126-5927-4907-bfbe-4a2e58f6ae3d" }),
      }),
      401: t.Object({
        status: t.String({ default: "error" }),
        message: t.String({ default: "Login failed" }),
        data: t.Null(),
      }),
    },
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
  }, {
    detail: {
      summary: "User Logout",
      description: "Menghapus sesi aktif dari database menggunakan Bearer token.",
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    response: {
      200: t.Object({
        data: t.String({ default: "OK" }),
      }),
      401: t.Object({
        error: t.String({ default: "Unauthorized" }),
      }),
    },
  });
