import { api, APIError } from "encore.dev/api";
import { Header } from "encore.dev/api";
import type { AuthData } from "./types";

interface VerifyTokenRequest {
  authorization: Header<"Authorization">;
}

interface VerifyTokenResponse {
  valid: boolean;
  user?: AuthData;
}

// Verifies authentication token.
export const verifyToken = api<VerifyTokenRequest, VerifyTokenResponse>(
  { expose: true, method: "POST", path: "/auth/verify" },
  async (req) => {
    const token = req.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return { valid: false };
    }

    try {
      // Decode the simple token (in production, verify JWT signature)
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [user, timestamp] = decoded.split(':');
      
      if (user !== 'admin') {
        return { valid: false };
      }

      // Check if token is not older than 24 hours
      const tokenTime = parseInt(timestamp);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - tokenTime > twentyFourHours) {
        return { valid: false };
      }

      return {
        valid: true,
        user: {
          userID: 'admin',
          isAdmin: true,
        },
      };
    } catch (error) {
      return { valid: false };
    }
  }
);
