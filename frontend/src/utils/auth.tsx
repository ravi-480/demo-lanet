// /utils/auth.ts
import { jwtVerify } from "jose";

export async function verifyJwtToken(token: string): Promise<boolean> {
  try {
    // Use your secret key (should be in environment variables)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    // Verify the token
    const { payload } = await jwtVerify(token, secret);

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < currentTime) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}
