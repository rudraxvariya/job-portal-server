import { Router } from "express";
const router = Router();

import {
  getAllJobs,
  getSingleJob,
  createJob,
  deleteJob,
  updateJob,
} from "../controllers/jobControllers.js";

router.route("/").get(getAllJobs).post(createJob);
router.route("/:id").get(getSingleJob).patch(updateJob).delete(deleteJob);

export default router;
