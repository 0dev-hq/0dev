import mongoose, { Schema, Document } from "mongoose";

export interface IAgentRegistryAction extends Document {
  name: string;
  description: string;
  service: string;
  tags: string[];
  inputs: string[];
  outputs: string[];
  creator: "Official";
}

const AgentRegistryActionSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  service: { type: String, required: true },
  tags: { type: [String], required: true },
  inputs: { type: [String], required: true },
  outputs: { type: [String], required: true },
  creator: {
    type: String,
    enum: ["Official"],
    required: true,
  },
});

const AgentRegistryAction = mongoose.model<IAgentRegistryAction>(
  "AgentRegistryAction",
  AgentRegistryActionSchema
);
export default AgentRegistryAction;
