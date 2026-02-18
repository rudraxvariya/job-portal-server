import { Router } from "express";
const router = Router();
import {
  register,
  login,
  getUsers,
  deleteUser,
} from "../controllers/userControllers.js";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../middleware/validateMiddleware.js";

router.post("/register", validateRegisterInput, register);
router.post("/login", validateLoginInput, login);
router.get("/getUsers", getUsers);
router.delete("/deleteUser/:id", deleteUser);

export default router;
