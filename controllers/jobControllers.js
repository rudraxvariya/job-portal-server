import Job from "../models/JobModel.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/customErrors.js";
import cloudinary from "cloudinary";
import { promises as fs } from "fs";

export const getAllJobs = async (req, res) => {
  const { search, jobStatus, jobType, sort } = req.query;
  const queryObject = {
    createdBy: req.user.userId,
  };
  if (search) {
    queryObject.$or = [
      { position: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }
  if (jobStatus && jobStatus !== "all") {
    queryObject.jobStatus = jobStatus;
  }
  if (jobType && jobType !== "all") {
    queryObject.jobType = jobType;
  }

  const sortOptions = {
    newest: "-createdAt",
    oldest: "createdAt",
    "a-z": "position",
    "z-a": "-position",
  };

  const sortKey = sortOptions[sort] || sortOptions.newest;

  // setup pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const jobs = await Job.find(queryObject)
    .sort(sortKey)
    .limit(limit)
    .skip(skip);
  const totalJobs = await Job.countDocuments(queryObject);

  const numOfPages = Math.ceil(totalJobs / limit);
  res
    .status(StatusCodes.OK)
    .json({ totalJobs, numOfPages, currentPage: page, jobs });
};

export const createJob = async (req, res) => {
  const newJob = { ...req.body };
  newJob.createdBy = req.user.userId;

  if (req.file) {
    const response = await cloudinary.v2.uploader.upload(req.file.path);
    await fs.unlink(req.file.path);
    newJob.companyLogo = response.secure_url;
    newJob.companyLogoPublicId = response.public_id;
  }
  const updatedJob = await Job.create(newJob);
  res.status(StatusCodes.CREATED).json({ updatedJob });
};

export const getSingleJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new NotFoundError(`No job with id ${req.params.id}`);
  return res.status(200).json({ job });
};

export const updateJob = async (req, res) => {
  const existingJob = await Job.findById(req.params.id);
  if (!existingJob) throw new NotFoundError("No job found with the id");

  const newJob = { ...req.body };
  if (req.file) {
    const response = await cloudinary.v2.uploader.upload(req.file.path);
    await fs.unlink(req.file.path);
    newJob.companyLogo = response.secure_url;
    newJob.companyLogoPublicId = response.public_id;
  }
  const updatedJob = await Job.findOneAndUpdate(
    { _id: req.params.id },
    newJob,
    {
      new: true,
    },
  );
  // Delete the OLD image from Cloudinary
  if (req.file && existingJob.companyLogoPublicId) {
    await cloudinary.v2.uploader.destroy(existingJob.companyLogoPublicId);
  }
  res.status(StatusCodes.OK).json({ msg: "Job modified", updatedJob });
};

export const deleteJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new NotFoundError("No job found with the id");
  if (job.companyLogoPublicId) {
    await cloudinary.v2.uploader.destroy(job.companyLogoPublicId);
  }
  await Job.findByIdAndDelete(req.params.id);
  res.status(StatusCodes.OK).json({ msg: "job deleted successfully!" });
};
