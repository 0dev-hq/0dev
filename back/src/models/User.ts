import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  githubId?: string;
  account?: string;
  emailConfirmed: boolean;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  githubId: { type: String },
  account: { type: Schema.Types.ObjectId, ref: "Account", default: null },
  emailConfirmed: { type: Boolean, default: false },
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
