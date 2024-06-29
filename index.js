import express from "express";
import AuthRouters from "./src/routes/Auth/AuthRoute.js";
import cors from 'cors';
import { createServer } from 'http';
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
app.use('/api/v1/auth', AuthRouters);
// Start the server
httpserver.listen(port, () => {
    console.log('Server running on port ' + port);
  });
  