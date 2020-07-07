const { model, Schema } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

/**
 * Notifications Schema
 * @private
 */

const Notifications = new Schema(
  {
    to: { type: ObjectId, ref: "User" },
    from: { type: ObjectId, ref: "User" },
    title: String,
    message: String,
    body: String,
    data: Schema.Types.Mixed,

    eventType: { type: String },
    dbRef: {
      table: String,
      docId: ObjectId,
    },

    seen: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

/**
 * Statics
 */
Notifications.statics = {};

/**
 * @typedef Notifications
 */
module.exports = model("Notifications", Notifications);
