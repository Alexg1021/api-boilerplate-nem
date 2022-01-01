import mongoose from "mongoose";
import bcrypt from "bcrypt";
import randomize from "randomatic";

const UserSchema = mongoose.Schema({
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  email: { type: String, unique: true, default: null },
  password: { type: String, select: false },
  userTokenHash: { type: String, select: false },
  passwordReset: {
    select: false,
    token: { type: String, default: null },
    exp: { type: Date, default: null },
  },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

// Static method to hash password
UserSchema.statics.hashPassword = async (password) => {
  try {
    let saltRounds = 10;
    let salt = await bcrypt.genSalt(saltRounds);
    let hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (e) {
    next(e);
  }
};

// method to compare user password hash for specific user
UserSchema.methods.comparePassword = async (userPass, hashedPassword) => {
  try {
    let isMatch = await bcrypt.compare(userPass, hashedPassword);
    return isMatch;
  } catch (e) {
    throw e;
  }
};

UserSchema.methods.generateRandomHash = () => {
  return randomize("Aa0!", 14);
};

let UserModel = mongoose.model("User", UserSchema);

export default UserModel;
