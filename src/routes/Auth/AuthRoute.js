import express from "express";
import { HandleRegister } from "../../controllers/Auth/Post/AuthPost.js";
import { getUser } from "../../controllers/Auth/Get/AuthGet.js";

const AuthRouters = express.Router();

AuthRouters.post("/register", HandleRegister);
AuthRouters.get("/user", getUser);

export default AuthRouters;
