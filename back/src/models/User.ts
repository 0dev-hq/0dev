import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  githubId?: string;
  account?: string;
  emailConfirmed: boolean;
  isActive?: boolean; // This field allows logical deletion of users
  role?: "Admin" | "Editor" | "Readonly"; // Adding role field to the user
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  githubId: { type: String },
  account: { type: Schema.Types.ObjectId, ref: "Account", default: null },
  emailConfirmed: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  role: {
    type: String,
    enum: ["Admin", "Editor", "Readonly"],
    default: "Readonly",
  }, // Role field with default value
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
