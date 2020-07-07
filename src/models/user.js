/* eslint-disable no-invalid-this */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongoose_delete = require("mongoose-delete");
const { DateTime } = require("luxon");
const jwt = require("jwt-simple");
const {
  env,
  jwtSecret,
  jwtExpirationInterval,
  enums: { roles },
} = require("../config");

/**
 * User Schema
 * @private
 */

const userSchema = new mongoose.Schema(
  {
    email: { type: String },
    fullName: { type: String },
    phone: { type: String },
    photo: { ref: "File", type: mongoose.Schema.Types.ObjectId },
    location: { type: mongoose.Schema.Types.Mixed },
    role: { default: "user", enum: roles, type: String },
    tosAgreement: { type: Boolean, default: false },
    password: { type: String },

    status: {
      default: "active",
      enum: ["active", "blocked", "deactivated"],
      type: String,
    },
    verifications: [
      {
        enum: ["email", "phone"],
        type: String,
      },
    ],
    activeSession: { ref: "Session", type: mongoose.Schema.Types.ObjectId },
    verifyTokens: {
      email: { default: "", type: String },
      resetPassword: { default: "", type: String },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(mongoose_delete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
userSchema.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();

    const rounds = 10;

    const hash = await bcrypt.hash(this.password, rounds);

    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
userSchema.method({
  async passwordMatches(password) {
    const result = await bcrypt.compare(password, this.password);

    return result;
  },
  token() {
    const date = DateTime.local();
    const payload = {
      _id: this._id,
      exp: date.plus({ minutes: jwtExpirationInterval }).toSeconds(),
      iat: date.toSeconds(),
    };

    return jwt.encode(payload, jwtSecret);
  },
  async hashPassword(password) {
    const rounds = 10;
    const hash = await bcrypt.hash(password, rounds);

    return hash;
  },
});

/**
 * Statics
 */
userSchema.statics = {};

/**
 * @typedef User
 */

const model = mongoose.model("User", userSchema);

model.createIndexes({
  email: 1,
  fullName: 1,
  role: 1,
});

module.exports = model;
