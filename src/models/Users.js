import mongoose from "mongoose";
const notificationsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    postId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    postName: {
      type: String,
    },
    messages: {
      type: [Object],
      required: false,
    },
    seen: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true, _id: true }
);
const userShema = new mongoose.Schema(
  {
    clerk_Id: {
      type: String,
      required: true,
      unique: true,
    },
    fristName: {
      type: String,
      // required: true,
    },
    lastName: {
      type: String,
      // required: true,
    },
    imgUrl: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    savedPosts: [mongoose.Types.ObjectId],
    notifications: [notificationsSchema],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userShema);
