import { useAuth } from '../contexts/AuthContext';
import backend from '~backend/client';

export function useAuthenticatedBackend() {
  const { token } = useAuth();
  
  if (!token) {
    return backend;
  }
  
  return backend.with({
    auth: () => ({ authorization: `Bearer ${token}` })
  });
}
