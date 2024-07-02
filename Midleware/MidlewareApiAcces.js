import prisma from "../Config/Prisma.js";

export const MidlewareApi = async (req, res, next) => {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(400).json({ error: "Authorization header is required" });
    }
    
    const token = authHeader.replace("Bearer ", ""); // Jika token diawali dengan 'Bearer '
  
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }
  
    try {
      // Cari token di database
      const tokenRecord = await prisma.auth.findFirst({
        where: { token },
      });
  
      if (!tokenRecord) {
        return res.status(401).json({ error: "Invalid token" });
      }
  
      // Periksa apakah token sudah kadaluarsa
      if (new Date() > new Date(tokenRecord.expiresAt)) {
        return res.status(401).json({ error: "Token has expired" });
      }
  
      // Token valid, lanjutkan ke middleware berikutnya atau route handler
      next();
    } catch (error) {
      console.error("Error verifying token", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };