var mongoose = require("mongoose");

var ObjectId = mongoose.Schema.Types.ObjectId;

var UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    phone: {
      type: String,
      match: [
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
        "is invalid",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [
        /^(\D)+(\w)*((\.(\w)+)?)+@(\D)+(\w)*((\.(\D)+(\w)*)+)?(\.)[a-z]{2,}$/,
        "is invalid",
      ],
    },
    avatar: { type: ObjectId, ref: "Media" },
    hash: String,
    salt: String,
    userType: String,
    verifications: [String],
    deactivated: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
