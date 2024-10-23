// models/DataHub.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IDataHub extends Document {
  name: string;
  language: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
}

const DataHubSchema: Schema = new Schema({
  name: { type: String, required: true },
  language: { type: String, required: true },
  description: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const DataHub = mongoose.model<IDataHub>("DataHub", DataHubSchema);

export default DataHub;
