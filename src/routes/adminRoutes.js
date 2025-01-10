import express from "express";
import {
  approvePost,
  getPendingPosts,
  rejectPost,
} from "../controlles/adminController.js";
import {
  ClerkExpressRequireAuth,
  ClerkExpressWithAuth,
} from "@clerk/clerk-sdk-node";

const adminRouter = express.Router();

adminRouter.get("/posts", ClerkExpressRequireAuth(), getPendingPosts);
adminRouter.patch(
  "/posts/reject/:postId",
  ClerkExpressRequireAuth(),
  rejectPost
);
adminRouter.patch(
  "/posts/approve/:postId",
  ClerkExpressRequireAuth(),
  approvePost
);

export { adminRouter };
