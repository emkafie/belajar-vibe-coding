import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export class AuthServices {
  static async loginUser(email?: string, password?: string): Promise<string> {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // 1. Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // 2. Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new Error("Invalid email or password");
    }

    // 3. Generate token
    const token = crypto.randomUUID();

    // 4. Save session
    await db.insert(sessions).values({
      token,
      userId: user.id,
    });

    return token;
  }

  static async logoutUser(token: string): Promise<boolean> {
    const [deletedSession] = await db
      .delete(sessions)
      .where(eq(sessions.token, token))
      .returning();

    return !!deletedSession;
  }
}
