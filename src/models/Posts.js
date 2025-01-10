import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    postName: {
      type: String,
      required: true,
    },
    realEstate: {
      name: String,
      realEstateFor: String,
      area: Number,
      numOfRooms: Number,
      furnished: String,
      realEstateType: String,
      facade: String,
      numOfBathrooms: Number,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    address: {
      cityName: String,
      lat: String,
      lng: String,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    images: [Object],
    userId: {
      type: String,
      required: true,
    },
    views: [String],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "sold", "deleted"],
      default: "pending",
    },
  },
  { timestamps: true }
);

PostSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export const PostModel = mongoose.model("Post", PostSchema);
