import { BadRequestError, UnauthorizedError } from "../errors/customErrors.js";
import { verifyJWT } from "../utils/tokenUtils.js";

export const authenticateUser = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) throw new UnauthorizedError("Unauthorized User");
  try {
    const { userId, role } = verifyJWT(token);
    const testUser = userId === "6995a6f3a86e4ce4dd6966bb";
    req.user = { userId, role, testUser };
    next();
  } catch (error) {
    throw new UnauthorizedError("Unauthorized User");
  }
};

export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("Unauthorized to access this route");
    }
    next();
  };
};

export const checkForTestUser = (req, res, next) => {
  if (req.user.testUser) {
    throw new BadRequestError("Demo User. Read Only!");
  }
  next();
};
