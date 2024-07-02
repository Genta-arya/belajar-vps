import express from "express";
import {
  HandleRegister,
  Logout,
  checkLogin,
  handleLogin,
} from "../../controllers/Auth/Post/AuthPost.js";
import { getUser } from "../../controllers/Auth/Get/AuthGet.js";

const AuthRouters = express.Router();

AuthRouters.post("/register", HandleRegister);
AuthRouters.post("/login", handleLogin);
AuthRouters.post("/logout", Logout);
AuthRouters.post("/authentikasi", checkLogin);
AuthRouters.get("/user", getUser);

export default AuthRouters;
