import { sql, eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions } from "../db/schema";
import bcrypt from "bcrypt";

export class UserServices {
  static async checkDbConnection(): Promise<boolean> {
    try {
      await db.execute(sql`SELECT 1`);
      return true;
    } catch (error) {
      console.error("Database connection check failed:", error);
      return false;
    }
  }

  static async getAllUsers() {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);
  }

  static async createUser(data: any) {
    const { name, email, password } = data;
    
    if (!name || !email || !password) {
      throw new Error("Missing required fields");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return newUser;
  }

  static async getCurrentUserByToken(token: string) {
    const [result] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token))
      .limit(1);

    return result || null;
  }
}
