import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import type { LoginRequest, LoginResponse } from "./types";

const adminPassword = secret("AdminPassword");

// Authenticates admin users with password.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    const correctPassword = adminPassword();
    
    if (req.password !== correctPassword) {
      throw APIError.unauthenticated("Invalid password");
    }

    // Generate a simple token (in production, use JWT or similar)
    const token = Buffer.from(`admin:${Date.now()}`).toString('base64');

    return {
      success: true,
      token,
    };
  }
);
