import { Elysia, t } from "elysia";
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
  }, {
    detail: {
      summary: "Database Health Check",
      description: "Mengecek apakah koneksi ke database PostgreSQL aktif dan berjalan baik.",
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
  }, {
    detail: {
      summary: "Get All Users",
      description: "Mengambil daftar seluruh user terdaftar (tanpa menyertakan password).",
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
  }, {
    body: t.Object({
      name: t.String({ description: "Nama lengkap user" }),
      email: t.String({ format: "email", description: "Alamat email unik" }),
      password: t.String({ description: "Password akun user" }),
    }),
    detail: {
      summary: "Register User",
      description: "Mendaftarkan user baru ke sistem dengan mengenkripsi password.",
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
  }, {
    detail: {
      summary: "Get Active Profile",
      description: "Mengambil data profil user yang sedang aktif berdasarkan Bearer token.",
      security: [
        {
          bearerAuth: [],
        },
      ],
    }
  });
