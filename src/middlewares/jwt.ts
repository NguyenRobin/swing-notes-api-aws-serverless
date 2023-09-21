const jwt = require('jsonwebtoken');

export type UserEmail = string;

export function createToken(email: UserEmail) {
  const token: string = jwt.sign(
    { email: email },
    `${process.env.SECRET_KEY}`,
    {
      expiresIn: '1h',
    }
  );
  console.log(token);
  return token;
}

export function validateToken(token: string): boolean {
  const isTokenValid = jwt.verify(token, `${process.env.SECRET_KEY}`);
  if (isTokenValid) {
    return true;
  } else {
    return false;
  }
}
