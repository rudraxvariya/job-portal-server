import { body, param, validationResult } from "express-validator";
import User from "../models/UserModel.js";
import Job from "../models/JobModel.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/customErrors.js";
import mongoose from "mongoose";

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        if (errorMessages[0].startsWith("no job")) {
          throw new NotFoundError(errorMessages);
        }
        if (errorMessages[0].startsWith("not authorized")) {
          throw new UnauthorizedError("Not authorized to access this route");
        }
        throw new BadRequestError(errorMessages.join(". "));
      }
      next();
    },
  ];
};

export const validateRegisterInput = withValidationErrors([
  body("name").notEmpty().withMessage("Name is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new BadRequestError("Email already in use");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("location").notEmpty().withMessage("Location is required"),
]);

export const validateLoginInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
]);

export const validateIdParam = withValidationErrors([
  param("id").custom(async (value, { req }) => {
    const isValidMongoId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidMongoId) throw new BadRequestError("Invalid Mongo ID");
    const job = await Job.findById(value);
    if (!job) throw new NotFoundError(`No job found with the id ${value}`);
    const isAdmin = req.user.role === "admin";
    const isOwner = req.user.userId === job.createdBy.toString();
    if (!isAdmin && !isOwner) {
      throw new UnauthorizedError("not authorized to access this job");
    }
  }),
]);

export const validateUpdateUserInput = withValidationErrors([
  body("name").notEmpty().withMessage("Name is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email });
      if (user && user._id.toString() !== req.user.userId) {
        throw new BadRequestError("Email already in use");
      }
    }),
  body("location").notEmpty().withMessage("Location is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
]);

export const validateJobInput = withValidationErrors([
  body("company").notEmpty().withMessage("Company is required"),
  body("position").notEmpty().withMessage("Position is required"),
  body("jobStatus").notEmpty().withMessage("Job status is required"),
  body("jobType").notEmpty().withMessage("Job type is required"),
  body("jobLocation").notEmpty().withMessage("Job location is required"),
]);
