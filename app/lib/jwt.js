// lib/jwt.js
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

// export function verifyToken(token) {
//   return jwt.verify(token, SECRET);
// }

export const getTokenFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token'); // This is how you access the token stored in localStorage
  }
  return null;
};// app/lib/jwt.js (server-side)

export const verifyToken = (token) => {
  try {
    // Replace 'your-secret-key' with the actual secret key used to sign your JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;  // Return null if token is invalid or expired
  }
};
