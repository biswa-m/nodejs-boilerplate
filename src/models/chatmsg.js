const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

/**
 * Chat Schema
 * @private
 */
const Chatmsg = new mongoose.Schema(
  {
    localId: String,

    sender: { ref: "User", type: mongoose.Schema.Types.ObjectId },
    receivers: [{ ref: "User", type: mongoose.Schema.Types.ObjectId }],
    chatmap: { ref: "Chatmap", type: mongoose.Schema.Types.ObjectId },

    message: { type: String },
    type: {
      default: "text",
      enum: ["text", "photo", "video", "audio"],
      type: String,
    },

    readUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deliveredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deliveredDevices: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    ],
    deletes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

Chatmsg.plugin(mongoose_delete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

const model = mongoose.model("Chatmsg", Chatmsg);

module.exports = model;
