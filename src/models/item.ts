import { Document, model, Schema } from 'mongoose';

export interface IItem {
  price: number;
  description?: string;
  aliases: string[];
  count: number;
}

export interface IItemDoc extends Document, IItem {}

const ItemSchema = new Schema({
  aliases: {
    required: true,
    type: Array,
  },
  count: {
    default: 0,
    type: Number,
  },
  description: {
    default: '',
    type: String,
  },
  price: {
    required: true,
    type: Number,
  },
});

export default model<IItemDoc>('shop', ItemSchema);
