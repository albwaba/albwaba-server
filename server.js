import "dotenv/config"; // To read CLERK_API_KEY
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
const port = process.env.PORT || 2000;
import dotenv from "dotenv";
import { Webhook } from "svix";
import mongoose from "mongoose";
import { postRouter } from "./src/routes/postRoutes.js";
import { adminRouter } from "./src/routes/adminRoutes.js";
import { userRoute } from "./src/routes/userRoutes.js";
import { getAlbwabaStats } from "./src/models/DailyVistis.js";
import { User } from "./src/models/Users.js";
dotenv.config();
const app = express();
app.use(express.json({ limit: "50mb" }));
const crosOption = {
  origin: "*",
  optionSuccessStatus: 200,
};
app.use(cors(crosOption)); // Use the lax middleware that returns an empty auth object when unauthenticated
app.get("/api/albwaba-stats", getAlbwabaStats);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRoute);
app.use("/api", postRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).send("Unauthenticated!");
});

app.post(
  "/api/webhooks",
  bodyParser.raw({ type: "application/json" }),
  async function (req, res) {
    // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
    try {
      const payload = req.body;
      const headers = req.headers;

      const svix_id = headers["svix-id"];
      const svix_timestamp = headers["svix-timestamp"];
      const svix_signature = headers["svix-signature"];
      // console.log(JSON.stringify(payload));

      if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error occured -- no svix headers", {
          status: 400,
        });
      }

      const wh = new Webhook(process.env.WEBHOOK_SECRET);
      let evt;
      try {
        evt = wh.verify(JSON.stringify(payload), {
          "svix-id": svix_id,
          "svix-timestamp": svix_timestamp,
          "svix-signature": svix_signature,
        });
      } catch (err) {
        console.log("Error verifying webhook:", err.message);
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      const { id, ...attributes } = evt.data;

      const eventType = evt.type;
      // console.log(evt.data);
      // console.log(attributes);
      // console.log(eventType);

      if (eventType === "user.created") {
        console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
        // console.log(attributes);
        const { first_name, image_url, last_name, email_addresses } =
          attributes;
        try {
          const user = new User({
            clerk_Id: id,
            fristName: first_name,
            lastName: last_name,
            imgUrl: image_url,
            email: email_addresses[0].email_address,
            savedPosts: [],
            notifications: [],
          });
          await user.save();
          console.log(user);
        } catch (error) {
          console.log(error.message);
        }
      }

      if (eventType === "user.deleted") {
        try {
          const user = await User.findOneAndDelete({ clerk_Id: id });
        } catch (error) {
          console.log(error.message);
        }
      }
      if (eventType === "user.updated") {
        const { first_name, image_url, last_name, email_addresses } =
          attributes;
        try {
          const user = await User.updateOne(
            { clerk_Id: id },
            {
              $set: {
                imgUrl: image_url,
                fristName: first_name,
                lastName: last_name,
                email: email_addresses[0].email_address,
              },
            }
          );
        } catch (error) {
          console.log(error);
        }
      }
      return res.status(200).json({
        success: true,
        message: "Webhook received",
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
);

mongoose
  .connect(
    "mongodb+srv://albwaba2025:<db_password>@albwaba.pjgxy.mongodb.net/?retryWrites=true&w=majority&appName=albwaba"
  )
  .then(() => {
    app.listen(port, () => {
      console.log(`server started`);
    });
  });
console.log("s");
