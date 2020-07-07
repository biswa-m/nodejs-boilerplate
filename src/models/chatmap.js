var mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

mongoose.set("useCreateIndex", true);

var ObjectId = mongoose.Schema.Types.ObjectId;

var ChatmapSchema = new mongoose.Schema(
  {
    participants: [{ type: ObjectId, ref: "User" }],
    lastmsg: { type: ObjectId, ref: "Chatmsg" },
    lastmsgTime: { type: Date },
    unreads: [{ user: { type: ObjectId, ref: "User" }, count: Number }],
    deletes: [{ type: ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

ChatmapSchema.plugin(mongoose_delete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: "all",
});

module.exports = mongoose.model("Chatmap", ChatmapSchema);
