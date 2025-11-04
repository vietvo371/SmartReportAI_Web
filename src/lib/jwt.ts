import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production-12345",
);

export interface JWTPayload {
  userId: number;
  email: string;
  vai_tro: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    console.log("Verifying token:", token.substring(0, 20) + "...");
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log("Token verified successfully:", payload);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    console.error("Token that failed:", token.substring(0, 50) + "...");
    return null;
  }
}

