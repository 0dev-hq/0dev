import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  githubId?: string;
  emailConfirmed: boolean;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  githubId: { type: String },
  emailConfirmed: { type: Boolean, default: false },
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
