import express from "express";
import {
  getNotification,
  getNotSeenNotificationsCount,
} from "../controlles/userController.js";

const userRoute = express.Router();

userRoute.get("/notifications/:userId/count", getNotSeenNotificationsCount);
userRoute.get("/notifications/:userId", getNotification);

export { userRoute };
