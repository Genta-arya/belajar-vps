import express from "express";
import AuthRouters from "./src/routes/Auth/AuthRoute.js";
import cors from "cors";
import { createServer } from "http";
import routerGallery from "./src/routes/Gallery/GalleryRoute.js";
import path from "path";
import router from "./src/controllers/Storage/StorageGet.js";

const app = express();
const port = 3000;
const httpserver = createServer(app);

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
app.use('/api/v1/storage',router)

// Start the server
httpserver.listen(port, () => {
  console.log("Server running on port " + port);
});
