import { Document, model, Schema } from 'mongoose';

export interface IUser {
  userId: string;
  items: string[];
  lastBankrob: number;
  detentionDate: number;
}

export interface IUserDoc extends Document, IUser {}

const UserSchema = new Schema({
  detentionDate: { default: 0, type: Number },
  items: { default: [], type: Array },
  lastBankrob: { default: 0, type: Number },
  userId: { type: String, required: true },
});

export default model<IUserDoc>('users', UserSchema);
