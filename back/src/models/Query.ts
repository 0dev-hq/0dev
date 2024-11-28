import mongoose, { Schema, Document } from "mongoose";

export interface IQuery extends Document {
  name: string;
  createdBy: mongoose.Types.ObjectId;
  dataSource: mongoose.Types.ObjectId;
  description: string;
  raw: string;
  operation: "create" | "read" | "update" | "delete";
  owner?: mongoose.Types.ObjectId;
}

const QuerySchema: Schema = new Schema({
  name: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dataSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DataSource",
    required: true,
  },
  description: { type: String, required: true },
  raw: { type: String, required: true },
  operation: {
    type: String,
    enum: ["create", "read", "update", "delete"],
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
  },
});

const Query = mongoose.model<IQuery>("Query", QuerySchema);
export default Query;
