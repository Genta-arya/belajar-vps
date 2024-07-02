import express from "express";
import AuthRouters from "./src/routes/Auth/AuthRoute.js";
import cors from "cors";
import { createServer } from "http";
import routerGallery from "./src/routes/Gallery/GalleryRoute.js";
import path from "path";
import router from "./src/controllers/Storage/StorageGet.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

// Create Express application
const app = express();
const port = 3000;
const httpserver = createServer(app);

// Rate Limiter Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (15 minutes)
  message: "Too many requests from this IP, please try again later.",
});

// Apply rate limiter to all requests
app.use(limiter);

// Security Headers Middleware
app.use(helmet());

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use('/uploads', express.static(path.resolve('uploads')));
app.use("/api/v1/gallery", routerGallery);
// Use AuthRouters for authentication routes
app.use("/api/v1/auth", AuthRouters);
app.use('/api/v1/storage', router);

// Start the server
httpserver.listen(port, () => {
  console.log("Server running on port " + port);
});
