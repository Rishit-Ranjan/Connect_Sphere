import pkg from 'jsonwebtoken';
const { sign } = pkg;

function generateToken(userId) {
  return sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
}

export default generateToken;