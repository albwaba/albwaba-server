import { PostModel } from "../models/Posts.js";
import { User } from "../models/Users.js";

export const getPendingPosts = async (req, res) => {
  console.log(req.auth);

  if (!req.auth || req.auth?.claims?.metadata?.role !== "admin") {
    return res.status(401).json({ error: "Unauthenticated" });
  }
  try {
    const posts = await PostModel.find({ status: "pending" });
    res.status(200).json(posts);
  } catch (error) {
    res.status(401).json(error);
  }
};

export const rejectPost = async (req, res) => {
  console.log(req.auth);

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
    console.log(sendNotification);
    res.status(200).json({ status: "true" });
  } catch (error) {
    console.log(error);
  }
};

export const approvePost = async (req, res) => {
  console.log(req.auth);

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
    res.status(200).json({ status: "true" });
  } catch (error) {
    console.log(error);
  }
};
