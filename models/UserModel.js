import mongoose from "mongoose";

export const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  lastName: {
    type: String,
    default: "lastName",
  },
  location: {
    type: String,
    default: "my city",
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

export default mongoose.model("User", UserSchema);
