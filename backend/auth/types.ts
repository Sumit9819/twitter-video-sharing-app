export interface LoginRequest {
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
}

export interface AuthData {
  userID: string;
  isAdmin: boolean;
}
