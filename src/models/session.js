/* eslint-disable no-invalid-this */
const mongoose = require("mongoose");

/**
 * User Schema
 * @private
 */

const Schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    accessToken: { type: String },
    clientType: { type: String },
    deviceToken: { type: String },
    notificationToken: { type: String },
    isActive: {
      default: true,
      type: String,
    },
    refreshToken: { type: String },
    socketId: { type: String },
    issuedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const model = mongoose.model("Session", Schema);

model.createIndexes({
  user: 1,
});

module.exports = model;
