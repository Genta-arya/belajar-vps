import express from "express";
import {
  HandleRegister,
  getUser,
} from "../../controllers/Auth/AuthController.js";

const AuthRouters = express.Router();

AuthRouters.post("/register", HandleRegister);
AuthRouters.get("/user", getUser);

export default AuthRouters;
