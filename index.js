import express from "express";
import AuthRouters from "./src/routes/Auth/AuthRoute.js";
import cors from "cors";
import { createServer } from "http";
import routerGallery from "./src/routes/Gallery/GalleryRoute.js";
import path from "path";
import router from "./src/controllers/Storage/StorageGet.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import prisma from "./Config/Prisma.js";
// Create Express application
const app = express();
const port = 3000;
const httpserver = createServer(app);

// Rate Limiter Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 5 requests per `window` (15 minutes)
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests from this IP, please try again later.",
    });
  },
});
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
// Apply rate limiter to all requests
app.use(limiter);

// Security Headers Middleware

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const authorizeUploads = async (req, res, next) => {
  const queryToken = req.query.token; // Token dari query parameter

  // Prioritaskan header authorization jika ada
  const token = queryToken;

  if (!token) {
    return res.status(403).json({ message: "Akses Ditolak" });
  }

  try {
    // Cek apakah token ada di tabel auth
    const authRecord = await prisma.auth.findFirst({
      where: { token: token },
    });

    if (!authRecord) {
      return res.status(403).json({ message: "Akses Ditolak" });
    }

    // Verifikasi token JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Failed to authenticate token" });
      }

      // Set pengguna yang terautentikasi pada permintaan
      req.user = user;
      next();
    });
  } catch (err) {
    console.error("Error verifying token:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

app.use("/uploads", authorizeUploads, express.static(path.resolve("uploads")));

app.use("/api/v1/gallery", routerGallery);
// Use AuthRouters for authentication routes
app.use("/api/v1/auth", AuthRouters);
app.use("/api/v1/storage", router);

// Start the server
httpserver.listen(port, () => {
  console.log("Server running on port " + port);
});
