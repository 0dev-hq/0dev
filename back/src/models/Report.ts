import mongoose, { Schema, Document } from "mongoose";

// Define the schema for blocks within the report
const blockSchema = new Schema({
  blocks: [{ x: Number, y: Number }],
  color: String,
  config: {
    title: String,
    query: { type: Schema.Types.ObjectId, ref: "Query" },
    type: { type: String, enum: ["bar", "pie", "line", "table", "value"] },
  },
  // Add chartParams to store OpenAI-generated parameters
  chartParams: { type: Schema.Types.Mixed, default: null },
});

// Define the report schema
const reportSchema = new Schema({
  name: { type: String, required: true },
  blockGroups: [blockSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface IReport extends Document {
  name: string;
  blockGroups: any[];
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export default mongoose.model<IReport>("Report", reportSchema);
