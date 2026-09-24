import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "arindama-secret-key-2026";

export interface JwtPayloadData {
  id: string;
  email: string;
  role: string;
}

/**
 * Sign JWT token dengan payload id, email, role (durasi 2h)
 */
export function signJwtToken(payload: JwtPayloadData): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
}

/**
 * Verify JWT token dan return payload data
 */
export function verifyJwtToken(token: string): JwtPayloadData | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayloadData;
  } catch {
    return null;
  }
}

/**
 * Hash password dengan bcrypt (salt rounds 10)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify password dengan hashed password dari database
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate random secure password
 */
export function generatePassword(length: number = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

