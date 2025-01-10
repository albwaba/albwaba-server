import mongoose from "mongoose";
import { User } from "./Users.js";
import { PostModel } from "./Posts.js";

const DailyVisitsSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
  },
  visitors: {
    type: Number,
    required: true,
    default: 0,
  },
});

DailyVisitsSchema.index({ expireAfterSeconds: 172800 });
const Visitor = mongoose.model("Visitors", DailyVisitsSchema);

export const getAlbwabaStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await PostModel.countDocuments({ status: "approved" });
    const today = new Date().toDateString();
    const visit = await Visitor.findOneAndUpdate(
      { date: today },
      { $inc: { visitors: 1 } },
      { upsert: true, new: true }
    );
    res
      .status(200)
      .json({ totalUsers, totalPosts, DailyVisitors: visit.visitors });
  } catch (error) {
    console.log(error);
  }
};
