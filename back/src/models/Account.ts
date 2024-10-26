import { Schema, model, Document, Types } from "mongoose";
import { IUser } from "./User";

interface IAccount extends Document {
  name: string;
  owner: Types.ObjectId;
  members: {
    userId: Types.ObjectId | IUser;
  }[];
  subscription: {
    plan: string;
    status: string;
    stripeSubscriptionId: string;
  };
}

const accountSchema = new Schema<IAccount>({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
  ],
  subscription: {
    plan: { type: String, enum: ["free", "basic", "team"], default: "free" },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
    stripeSubscriptionId: { type: String },
  },
});

const Account = model<IAccount>("Account", accountSchema);
export default Account;
