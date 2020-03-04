var mongoose = require("mongoose");

mongoose.set("useCreateIndex", true);

var ObjectId = mongoose.Schema.Types.ObjectId;

var ConnectedSocket = new mongoose.Schema(
  {
    socketId: {
      type: String,
      unique: true
    },
    user: { type: ObjectId, ref: "User" },
    namespace: {
      type: String,
      default: "/"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ConnectedSocket", ConnectedSocket);
