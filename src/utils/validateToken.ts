import {jwtDecode} from "jwt-decode";

export const validateToken = (token:string) => {
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    return decoded.exp && decoded.exp > currentTime; // valid if not expired
  } catch (e) {
    return false;
  }
};
