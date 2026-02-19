import { Router } from "express";
const router = Router();

import {
  getAllJobs,
  getSingleJob,
  createJob,
  deleteJob,
  updateJob,
} from "../controllers/jobControllers.js";
import {
  validateIdParam,
  validateJobInput,
} from "../middleware/validateMiddleware.js";
import { checkForTestUser } from "../middleware/authMiddleware.js";
import upload from "../middleware/multerMiddleware.js";

router
  .route("/")
  .get(getAllJobs)
  .post(
    checkForTestUser,
    upload.single("companyLogo"),
    validateJobInput,
    createJob,
  );
router
  .route("/:id")
  .get(validateIdParam, getSingleJob)
  .patch(
    checkForTestUser,
    upload.single("companyLogo"),
    validateJobInput,
    validateIdParam,
    updateJob,
  )
  .delete(checkForTestUser, validateIdParam, deleteJob);

export default router;
