import { PostModel } from "../models/Posts.js";
import { User } from "../models/Users.js";

export const getPendingPosts = async (req, res) => {
  if (req.auth?.claims?.metadata?.role === "admin") {
    try {
      const posts = await PostModel.find({ status: "pending" });
      return res.status(200).json(posts);
    } catch (error) {
      return res.status(401).json(error);
    }
  }
  return res.status(401).json({ error: "Unauthorized!" });
};

export const rejectPost = async (req, res) => {
  if (req.auth?.claims?.metadata?.role === "admin") {
    const { rejectionReasons, userId } = req.body;
    const notification = {
      type: "rejected",
      ...rejectionReasons,

      seen: false,
    };
    try {
      const sendNotification = await User.updateOne(
        { clerk_Id: userId },
        { $push: { notifications: notification } }
      );
      await PostModel.findByIdAndUpdate(req.params.postId, {
        status: "rejected",
      });

      return res.status(200).json({ status: "true" });
    } catch (error) {
      console.log(error);
    }
  }
  return res.status(401).json({ error: "Unauthorized!" });
};

export const approvePost = async (req, res) => {
  if (req.auth?.claims?.metadata?.role === "admin") {
    const { userId } = req.body;
    const postId = req.params.postId;
    const post = await PostModel.findById(postId);
    const notification = {
      type: "approved",
      postId,
      postName: post.postName,

      seen: false,
    };
    try {
      await PostModel.findByIdAndUpdate(postId, {
        status: "approved",
      });
      await User.updateOne(
        { clerk_Id: userId },
        {
          $push: { notifications: notification },
        }
      );
      return res.status(200).json({ status: "true" });
    } catch (error) {
      console.log(error);
    }
  }
  return res.status(401).json({ error: "Unauthorized!" });
};
