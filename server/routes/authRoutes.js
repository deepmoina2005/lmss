import express from "express";
import { login, logout, register, verifyAuthToken } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/verify", authenticate, verifyAuthToken);

export default authRouter;
