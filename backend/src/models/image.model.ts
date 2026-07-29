import mongoose, { Schema } from "mongoose";

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },   
    uploadedBy: { type: String, required: true },
    x: { type: Number },
    y: { type: Number },
    width: { type: Number },
    height: { type: Number },
    rotation: { type: Number, default: 0 },
    zIndex:{type:Number,default:0},
    isDeleted:{type:Boolean,default:false,index:true}
  },
  { timestamps: true },
);

export default mongoose.model("Image", imageSchema);