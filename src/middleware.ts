
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET;

function authMiddelware(req:any,res:any,next:any){

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({});
  }

  const token = authHeader.split(' ')[1];

  try {
      if(!JWT_SECRET) return
      const decoded = jwt.verify(token, JWT_SECRET);
      // @ts-ignore
      req.userId = decoded.userId;

      next();
  } catch (err) {
      return res.status(403).json({});
  }
}

export default authMiddelware