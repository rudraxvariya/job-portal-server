import { BadRequestError, UnauthorizedError } from "../errors/customErrors.js";
import { verifyJWT } from "../utils/tokenUtils.js";

export const authenticateUser = (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);
  if (!token || token === "logout")
    throw new UnauthorizedError("Unauthorized User");
  try {
    const { userId, role } = verifyJWT(token);
    const testUser = userId === process.env.TEST_USER_ID;
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
