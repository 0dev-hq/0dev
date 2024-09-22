import { Schema, model, Document, Types } from "mongoose";

export interface IInvitation extends Document {
  email: string;
  invitingUserId: Types.ObjectId;
  accountId: Types.ObjectId;
  role: "Admin" | "Editor" | "Readonly";
  token: string;
  expiresAt: Date;
  status: "pending" | "accepted" | "expired";
}

const invitationSchema = new Schema<IInvitation>(
  {
    email: { type: String, required: true },
    invitingUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    role: {
      type: String,
      enum: ["Admin", "Editor", "Readonly"],
      required: true,
    },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const Invitation = model<IInvitation>("Invitation", invitationSchema);
