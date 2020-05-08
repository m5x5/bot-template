import { Document, model, Schema } from 'mongoose';

export interface IWallet {
  userId: string;
  money: number;
}

export interface IWalletDoc extends Document, IWallet {}

const walletSchema = new Schema({
  money: {
    default: 0,
    type: Number,
  },
  userId: {
    require: true,
    type: String,
    unique: true,
  },
});

export default model<IWalletDoc>('wallets', walletSchema);
