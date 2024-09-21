import mongoose, { Schema, Document } from "mongoose";

export interface IDataSource extends Document {
  name: string;
  type: string;
  connectionString?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  googleSheetId?: string;
  fileName?: string;
  schemaInfo?: any; // Field to store schema information (can be any object structure)
  lastTimeAnalyzed?: Date; // Field to store the last time the schema was updated
  createdBy: mongoose.Types.ObjectId;
}

const DataSourceSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  connectionString: { type: String },
  username: { type: String },
  password: { type: String },
  apiKey: { type: String },
  googleSheetId: { type: String },
  fileName: { type: String },
  schemaInfo: { type: Schema.Types.Mixed }, // Allows storage of any object
  lastTimeAnalyzed: { type: Date }, // Date for tracking the last update
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const DataSource = mongoose.model<IDataSource>("DataSource", DataSourceSchema);

export default DataSource;
