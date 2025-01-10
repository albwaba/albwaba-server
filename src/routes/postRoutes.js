import express from "express";
import {
  createPost,
  getAllPosts,
  getMyPosts,
  getPost,
  getSavedPosts,
  addToFavorites,
  deleteFromFavorites,
  deletePost,
  approvePost,
  soldPost,
  updatePost,
  deletePostFroever,
  getProfileInfo,
  getFilterPosts,
  getSearchResults,
} from "../controlles/postController.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
// postRouter.get("/allPosts", getAllPosts);
const postRouter = express.Router();
// postRouter.get("/", ClerkExpressRequireAuth(), (req, res, next) => {
//   res.json(req.auth);

// });
postRouter.post("/posts", createPost);
postRouter.put("/posts/:postId", updatePost);
postRouter.get("/posts", getAllPosts);
// postRouter.get("/posts/search", serchResult);
postRouter.get("/myPosts/:userId", getMyPosts);
postRouter.get("/profile/:userId", getProfileInfo);
postRouter.get("/post/:postId", getPost);
postRouter.get("/posts/filters", getFilterPosts);
postRouter.get("/posts/search", getSearchResults);

postRouter.delete("/myPosts/delete/:postId", deletePostFroever);
postRouter.patch("/myPosts/delete/:postId", deletePost);
postRouter.patch("/myPosts/approve/:postId", approvePost);
postRouter.patch("/myPosts/sold/:postId", soldPost);
postRouter.patch(
  "/posts/add/favorites",
  // ClerkExpressRequireAuth(),
  addToFavorites
);
postRouter.patch("/posts/delete/favorites", deleteFromFavorites);
postRouter.get(
  "/posts/:userId/favorites",
  // ClerkExpressRequireAuth(),
  getSavedPosts
);
export { postRouter };
