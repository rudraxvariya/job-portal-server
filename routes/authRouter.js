import { Router } from "express";
const router = Router();
import { register, login, logout } from "../controllers/authControllers.js";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../middleware/validateMiddleware.js";

import rateLimiter from "express-rate-limit";

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: "Too many requests, please try again later.",
});

router.post("/register", apiLimiter, validateRegisterInput, register);
router.post("/login", apiLimiter, validateLoginInput, login);
router.get("/logout", logout);

export default router;
