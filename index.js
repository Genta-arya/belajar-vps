import express from "express";
import AuthRouters from "./src/routes/Auth/AuthRoute.js";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import routerGallery from "./src/routes/Gallery/GalleryRoute.js";
import path from "path";
import router from "./src/controllers/Storage/StorageGet.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import prisma from "./Config/Prisma.js";
import routerChat from "./src/routes/chat/ChatRoute.js";
import { manageChat } from "./src/controllers/chat/Chat.js";

// Create Express application
const app = express();
const port = 3000;
const httpServer = createServer(app);

// Set up Socket.io
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*", // Allow all origins or specify your allowed origins
    methods: ["GET", "POST"],
    credentials: true,
  },
});
manageChat(io);

// Rate Limiter Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // Limit each IP to 1000 requests per `window` (15 minutes)
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
app.use("/api/v1", routerChat); // Use chat routes

const authorizeUploads = async (req, res, next) => {
  const queryToken = req.query.token; // Token from query parameter

  // Prioritize authorization header if present
  const token = queryToken;

  if (!token) {
    return res.status(403).json({ message: "Access Denied" });
  }

  try {
    // Check if the token exists in the auth table
    const authRecord = await prisma.auth.findFirst({
      where: { token: token },
    });

    if (!authRecord) {
      return res.status(403).json({ message: "Access Denied" });
    }

    // Verify JWT token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Failed to authenticate token" });
      }

      // Set the authenticated user on the request
      req.user = user;
      next();
    });
  } catch (err) {
    console.error("Error verifying token:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api/v1/gallery", routerGallery);
app.use("/api/v1/auth", AuthRouters);
app.use("/api/v1/storage", router);

// Start the server
httpServer.listen(port, () => {
  console.log("Server running on port " + port);
});
