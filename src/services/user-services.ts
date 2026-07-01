import { sql, eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions } from "../db/schema";
import bcrypt from "bcrypt";

export class UserServices {
  /**
   * Mengecek apakah koneksi ke database aktif dan berjalan dengan baik.
   * Menjalankan query sederhana 'SELECT 1'.
   * @returns Promise<boolean> true jika terhubung, false jika gagal.
   */
  static async checkDbConnection(): Promise<boolean> {
    try {
      await db.execute(sql`SELECT 1`);
      return true;
    } catch (error) {
      console.error("Database connection check failed:", error);
      return false;
    }
  }

  /**
   * Mengambil semua daftar user terdaftar di database.
   * Field 'password' sengaja tidak diseleksi demi keamanan data.
   * @returns Daftar user berupa array objek.
   */
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

  /**
   * Mendaftarkan user baru ke database.
   * Melakukan enkripsi password menggunakan bcrypt dengan salt rounds 10.
   * @param data Objek berisi name, email, dan password.
   * @returns Objek user yang berhasil dibuat (tanpa field password).
   */
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

  /**
   * Mencari dan mengambil profil user aktif berdasarkan token sesi.
   * Menghubungkan tabel 'sessions' dengan tabel 'users'.
   * @param token Token UUID sesi yang sedang aktif.
   * @returns Objek user jika sesi valid, atau null jika sesi tidak ditemukan.
   */
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
