import { Document, model, Schema } from 'mongoose';

export interface IBankAccount {
  userId: string;
  money: number;
}

export interface IBankAccountDocument extends Document, IBankAccount {}

const bankAccountSchema = new Schema({
  money: {
    default: 0,
    type: Number,
  },
  userId: {
    required: true,
    type: String,
  },
});

export default model<IBankAccountDocument>('bank', bankAccountSchema);
