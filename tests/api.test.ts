import { describe, it, expect, beforeEach } from "bun:test";
import { app } from "../src";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";

describe("API Test Suite", () => {
  beforeEach(async () => {
    // Clean up database tables in order of foreign key dependency
    await db.delete(sessions);
    await db.delete(users);
  });

  // A. Health Check endpoint
  describe("GET /ping", () => {
    it("should return database connection status", async () => {
      const response = await app.handle(
        new Request("http://localhost/ping")
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body).toEqual({
        status: "ok",
        message: "Database connection test successful",
        data: "ok",
      });
    });
  });

  // B. User Registration endpoint
  describe("POST /users", () => {
    it("should register a new user successfully", async () => {
      const response = await app.handle(
        new Request("http://localhost/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(201);

      const body = await response.json();
      expect(body).toEqual({
        status: "ok",
        message: "User created successfully",
        data: "ok",
      });
    });

    it("should fail when required fields are missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            // missing password
          }),
        })
      );
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.status).toBe("error");
      expect(body.message).toBe("User created failed");
    });

    it("should fail when registering a duplicate email", async () => {
      // Create first user
      await app.handle(
        new Request("http://localhost/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "duplicate@example.com",
            password: "password123",
          }),
        })
      );

      // Attempt duplicate email registration
      const response = await app.handle(
        new Request("http://localhost/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Jane Doe",
            email: "duplicate@example.com",
            password: "differentpassword",
          }),
        })
      );
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.status).toBe("error");
      expect(body.message).toBe("User created failed");
    });
  });

  // C. List Users endpoint
  describe("GET /users", () => {
    it("should fetch all users and omit password fields", async () => {
      // Register a user
      await app.handle(
        new Request("http://localhost/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );

      const response = await app.handle(
        new Request("http://localhost/users")
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.status).toBe("ok");
      expect(body.data).toBeArray();
      expect(body.data.length).toBe(1);
      
      const user = body.data[0];
      expect(user.name).toBe("John Doe");
      expect(user.email).toBe("john@example.com");
      expect(user.password).toBeUndefined(); // check password is excluded
    });
  });

  // D. Login User endpoint
  describe("POST /login", () => {
    beforeEach(async () => {
      // Register a user to login with
      await app.handle(
        new Request("http://localhost/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
    });

    it("should login successfully and return a UUID token", async () => {
      const response = await app.handle(
        new Request("http://localhost/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.status).toBe("ok");
      expect(body.message).toBe("Login successfully");
      expect(body.data).toBeString(); // contains UUID token
    });

    it("should fail to login with an incorrect password", async () => {
      const response = await app.handle(
        new Request("http://localhost/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "john@example.com",
            password: "wrongpassword",
          }),
        })
      );
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body.status).toBe("error");
      expect(body.message).toBe("Login failed");
      expect(body.data).toBeNull();
    });
  });

  // E. Current User endpoint
  describe("POST /user/current", () => {
    let token: string;

    beforeEach(async () => {
      // Register
      await app.handle(
        new Request("http://localhost/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );

      // Login to get token
      const loginResponse = await app.handle(
        new Request("http://localhost/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
      const loginBody = await loginResponse.json();
      token = loginBody.data;
    });

    it("should return the user profile with a valid Bearer token", async () => {
      const response = await app.handle(
        new Request("http://localhost/user/current", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.data).toBeObject();
      expect(body.data.name).toBe("John Doe");
      expect(body.data.email).toBe("john@example.com");
      expect(body.data.password).toBeUndefined();
    });

    it("should fail when Authorization header is missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/user/current", {
          method: "POST",
        })
      );
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });

    it("should fail when token is invalid", async () => {
      const response = await app.handle(
        new Request("http://localhost/user/current", {
          method: "POST",
          headers: { Authorization: "Bearer invalid-token" },
        })
      );
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });
  });

  // F. User Logout endpoint
  describe("DELETE /user/logout", () => {
    let token: string;

    beforeEach(async () => {
      // Register
      await app.handle(
        new Request("http://localhost/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );

      // Login to get token
      const loginResponse = await app.handle(
        new Request("http://localhost/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
      const loginBody = await loginResponse.json();
      token = loginBody.data;
    });

    it("should delete the session and logout successfully", async () => {
      // Logout
      const response = await app.handle(
        new Request("http://localhost/user/logout", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body).toEqual({ data: "OK" });

      // Verify the session is gone in the DB
      const sessionCount = await db.select().from(sessions);
      expect(sessionCount.length).toBe(0);
    });

    it("should fail when using an invalid token", async () => {
      const response = await app.handle(
        new Request("http://localhost/user/logout", {
          method: "DELETE",
          headers: { Authorization: "Bearer invalid-token" },
        })
      );
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body).toEqual({ error: "Unauthorized" });
    });
  });
});
