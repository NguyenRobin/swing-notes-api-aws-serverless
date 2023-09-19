const jwt = require('jsonwebtoken');

interface UserEmail {
  email: string;
}
export function createToken(email: UserEmail) {
  const token = jwt.sign({ email: email }, `${process.env.SECRET_KEY}`, {
    expiresIn: '1h',
  });
  console.log(token);
  return token;
}
