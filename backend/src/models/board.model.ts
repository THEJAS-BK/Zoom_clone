import mongoose, { Schema } from "mongoose";

const boardSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    boardColor: { type: String, default: "#27272A" },
    strokes: { type: Schema.Types.Mixed, default: [] },   
    elements: { type: Schema.Types.Mixed, default: [] },  
  },
  { timestamps: true },
);

export default mongoose.model("Board", boardSchema);