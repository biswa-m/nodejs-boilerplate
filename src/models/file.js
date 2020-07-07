const mongoose = require("mongoose");
const {
  enums: { mediaTypes },
} = require("../config");

/**
 * File Schema
 * @private
 */
const File = new mongoose.Schema(
  {
    file_path: { type: String },
    file_extension: { type: String },
    file_mime_type: { type: String },
    file_original_name: { type: String },
    file_size: {
      default: 0,
      type: Number,
    },
    file_type: {
      default: "photo",
      enum: mediaTypes,
      type: String,
    },
    is_temp: {
      default: false,
      type: Boolean,
    },
    is_deleted: {
      default: false,
      type: Boolean,
    },
    user_id: {
      ref: "User",
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - victuals
 */
File.pre("save", async () => {});

/**
 * Methods
 */
File.method({});

/**
 * Statics
 */
File.statics = {};

/**
 * @typedef File
 */

const model = mongoose.model("File", File);

module.exports = model;
