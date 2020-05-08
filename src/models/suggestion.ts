import { Document, model, Schema } from 'mongoose';

export interface ISuggestion {
  authorId: string;
  content: string;
}

export interface ISuggestionDoc extends Document, ISuggestion {}

const SuggestionSchema = new Schema({
  authorId: {
    require: true,
    type: String,
  },
  content: {
    required: true,
    type: String,
  },
});

export default model<ISuggestionDoc>('suggestions', SuggestionSchema);
