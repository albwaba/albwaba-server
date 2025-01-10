import mongoose, { isValidObjectId } from "mongoose";
import { uploadImages } from "../cloudinary/uploader.js";
import { PostModel } from "../models/Posts.js";
import { User } from "../models/Users.js";
const createPost = async (req, res) => {
  try {
    const images = await uploadImages(req.body.images);
    const data = { ...req.body, images };
    // const data = req.body;
    const newPost = await PostModel.create(data);

    const notification = {
      type: "pending",
      postId: newPost._id,
      postName: newPost.postName,
      seen: false,
    };
    await User.updateOne(
      { clerk_Id: data.userId },
      { $push: { notifications: notification } }
    );
    return res.status(200).json({ success: true, status: 200 });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  const postId = new mongoose.Types.ObjectId(req.params.postId);
  try {
    const images = await uploadImages(req.body.images);
    const data = { ...req.body, images, status: "pending" };

    const update = await PostModel.findOneAndReplace({ _id: postId }, data);

    const notification = {
      type: "update",
      postId,
      postName: data.postName,
      seen: false,
    };
    await User.updateOne(
      { clerk_Id: data.userId },
      { $push: { notifications: notification } }
    );
    console.log(update);

    res.status(200).json({ success: true, status: 200 });
  } catch (error) {
    console.log(error);
  }
};

const getAllPosts = async (req, res) => {
  const { sort_type } = req.query;

  const page = req.query.page || 1;
  const postsPerPage = 10;
  const skip = (page - 1) * postsPerPage;
  try {
    const totalPosts = await PostModel.countDocuments({ status: "approved" });
    const posts = await PostModel.find({ status: "approved" })
      .sort({ createdAt: sort_type === "asc" ? -1 : 1 })
      .skip(skip)
      .limit(postsPerPage);
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    res.status(200).json({ posts, totalPages, totalPosts });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: error.message });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await PostModel.findOne({
      _id: req.params.postId,
    });

    if (post && !post.views.includes(req.query.userId)) {
      post.views.push(req.query.userId);
      await post.save();
    }
    if (post) {
      return res.status(200).json(post);
    }
    res.status(204).json({});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getFilterPosts = async (req, res) => {
  const page = req.query.page || 1;
  const postsPerPage = 10;
  const skip = (page - 1) * postsPerPage;
  const query = req.query;

  const filter = {
    postName: new RegExp(query.q || "", "i"),
    status: "approved",
    ...(query.furnished && { "realEstate.furnished": query.furnished }),
    ...(query.facade && { "realEstate.facade": query.facade }),
    ...(query.realEstateType && {
      realEstate: { "realEstate.realEstateType": query.realEstateType },
    }),
  };

  try {
    const totalPosts = await PostModel.countDocuments(filter);
    const posts = await PostModel.find(filter)
      .sort({ createdAt: query?.sort_type === "asc" ? -1 : 1 })
      .skip(skip)
      .limit(postsPerPage);
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    // console.log(totalDucuments);

    res.status(200).json({ posts, totalPages, totalPosts });
  } catch (error) {
    console.log(error);
  }
};

const getSearchResults = async (req, res) => {
  try {
    const {
      realEstate,
      realEstateFor,
      realEstateType,
      realStateArea,
      furnished,
      numOfRooms,
      numOfBathrooms,
      facade,
      priceFrom,
      priceTo,
    } = req.query;
    let posts;
    if (realEstate !== "land") {
      posts = await PostModel.find({ "realEstate.name": realEstate })
        .where("realEstate.furnished")
        .equals(furnished)
        .where("realEstate.numOfRooms")
        .gt(numOfRooms)
        .where("realEstate.numOfBathrooms")
        .gt(numOfBathrooms)
        .where("realEstate.facade")
        .equals(facade)
        .where("realEstate.realEstateFor")
        .equals(realEstateFor)
        .where("realEstate.realEstateType")
        .equals(realEstateType)
        .where("realEstate.area")
        .gt(realStateArea)
        .where("price")
        .gte(priceFrom)
        .lte(priceTo)
        .exec();
    } else {
      posts = await PostModel.find({ "realEstate.name": realEstate })
        .where("realEstate.realEstateFor")
        .equals(realEstateFor)
        .where("realEstate.realEstateType")
        .equals(realEstateType)
        .where("realEstate.area")
        .gt(realStateArea)
        .where("price")
        .gte(priceFrom)
        .lte(priceTo)
        .exec();
    }
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
  }
};
// async function run() {
//   const posts = await PostModel.find({
//     "realEstate.name": "house",
//     price: { $gte: "200001" },
//   });

//   console.log(posts);
// }
// run();
const getMyPosts = async (req, res) => {
  // console.log(req.auth);

  // if (req.auth.userId !== req.params.userId) {
  //   res.status(401).json({ error: "Unauthenticated!" });
  // }

  try {
    const posts = await PostModel.find({ userId: req.params.userId });
    res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const userSavedPosts = await User.find(
      { clerk_Id: req.params.userId },
      { savedPosts: 1 }
    );
    const savedPosts = await PostModel.find({
      _id: { $in: userSavedPosts[0].savedPosts },
    });
    res.status(200).json(savedPosts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addToFavorites = async (req, res) => {
  const { userId, postId } = req.body;

  try {
    const user = await User.updateOne(
      { clerk_Id: userId },
      { $push: { savedPosts: postId } }
    );

    res.status(200).json({ success: true, status: 200 });
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const deleteFromFavorites = async (req, res) => {
  try {
    const user = await User.updateOne(
      { clerk_Id: req.body.userId },
      { $pull: { savedPosts: req.body.postId } }
    );

    res.status(200).json({ success: true, status: 200 });
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const deletePost = async (req, res) => {
  try {
    const deleted = await PostModel.updateOne(
      { _id: req.params.postId },
      { $set: { status: "deleted" } }
    );
    const deletedPost = await PostModel.findById(req.params.postId);
    res.status(200).json(deletedPost);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

// const getMyPostsInfo = async (req, res) => {
//   const userId = req.params.userId;
//   const myPosts = await PostModel.find({ userId: userId });
//   // const totalViews = myPosts.reduce((acc, curr) => acc + curr.views.length, 0);
//   // const pendingPosts = myPosts.filter((post) => post.status === "pending");
//   // const rejectedPosts = myPosts.filter((post) => post.status === "rejected");

// };

// const serchResult = async (req, res) => {
//   const { realEstateType, furnished, facade } = req.query;
//   console.log(realEstateType);

//   try {
//     const query = PostModel.find();
//     if (realEstateType.length) {
//       query.where("realEstate.realEstateType").in(["land"]);
//     }
//     // if (furnished.length) {
//     //   query.$where("realEstate.furnished").equals(furnished);
//     // }
//     // if (facade.length) {
//     //   query.$where("realEstate.facade").equals(facade);
//     // }

//     const result = await query.exec();
//     res.status(200).json(result);
//   } catch (error) {
//     console.log(error);
//   }
// };
const approvePost = async (req, res) => {
  try {
    const approve = await PostModel.updateOne(
      { _id: req.params.postId },
      { $set: { status: "approved" } }
    );
    const approvedPost = await PostModel.findById(req.params.postId);
    res.status(200).json(approvedPost);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const soldPost = async (req, res) => {
  try {
    const sold = await PostModel.updateOne(
      { _id: req.params.postId },
      { $set: { status: "sold" } }
    );
    const theSoldPost = await PostModel.findById(req.params.postId);
    res.status(200).json(theSoldPost);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const deletePostFroever = async (req, res) => {
  try {
    await PostModel.findByIdAndDelete(req.params.postId);
    res.status(200).json({ success: true, status: 200 });
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const getProfileInfo = async (req, res) => {
  const userId = req.params.userId;
  try {
    const userInfo = await User.findOne({ clerk_Id: userId });
    const userPosts = await PostModel.find({
      userId: userId,
      status: "approved",
    });
    const profile = {
      profileImg: userInfo.imgUrl,
      firstName: userInfo.fristName,
      lastName: userInfo.lastName,
      posts: userPosts,
      memberSince: userInfo.createdAt,
      totalViews: userPosts.reduce((acc, curr) => acc + curr.views?.length, 0),
    };
    res.status(200).json(profile);
  } catch (error) {
    res.status(400).json({ error });
  }
};

export {
  getFilterPosts,
  deletePost,
  createPost,
  updatePost,
  deletePostFroever,
  getAllPosts,
  getPost,
  soldPost,
  getMyPosts,
  getSavedPosts,
  addToFavorites,
  deleteFromFavorites,
  approvePost,
  getProfileInfo,
  getSearchResults,
};
