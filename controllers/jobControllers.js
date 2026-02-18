import Job from "../models/JobModel.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/customErrors.js";

export const getAllJobs = async (req, res) => {
  const jobs = await Job.find({});
  res.status(StatusCodes.OK).json({ jobs });
};

export const createJob = async (req, res) => {
  const { company, position } = req.body;
  if (!company || !position) {
    return res
      .status(StatusCodes.NOT_ACCEPTABLE)
      .json({ msg: "please provide company and position" });
  }
  const job = await Job.create({ company, position });
  res.status(StatusCodes.CREATED).json({ job });
};

export const getSingleJob = async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) throw new NotFoundError(`No job with id ${id}`);
  return res.status(200).json({ job });
};

export const updateJob = async (req, res) => {
  const { company, position } = req.body;
  if (!company || !position) {
    return res
      .status(StatusCodes.NOT_ACCEPTABLE)
      .json({ msg: "please provide company and position details" });
  }
  const { id } = req.params;

  const updatedJob = await Job.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  });
  if (!updatedJob) throw new NotFoundError("No job found with the id");

  res.status(StatusCodes.OK).json({ msg: "Job modified", updatedJob });
};

export const deleteJob = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json("Please provide id");
  }

  const removeJobs = await Job.findByIdAndDelete(id);
  if (!removeJobs) throw new NotFoundError("No job found with the id");

  res.status(200).json({ msg: "job deleted successfully!", job: removeJobs });
};
