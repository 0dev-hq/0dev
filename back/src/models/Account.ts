import { Schema, model, Document, Types } from "mongoose";
import { IUser } from "./User";

interface AccountDocument extends Document {
  name: string;
  owner: Types.ObjectId;
  members: {
    userId: Types.ObjectId | IUser;
    role: "Admin" | "Editor" | "Readonly";
  }[];
  subscription: {
    plan: string;
    status: string;
    stripeSubscriptionId: string;
  };
}

const accountSchema = new Schema<AccountDocument>({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      role: {
        type: String,
        enum: ["Admin", "Editor", "Readonly"],
        default: "Readonly", // Set default role if not specified
      },
    },
  ],
  subscription: {
    plan: { type: String, enum: ["free", "basic", "team"], default: "free" },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
    stripeSubscriptionId: { type: String },
  },
});

const Account = model<AccountDocument>("Account", accountSchema);
export default Account;
