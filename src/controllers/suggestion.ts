import Controller from '../core/Controller';
import SuggestionModel, {
  ISuggestion,
  ISuggestionDoc,
} from '../models/suggestion';

export default class SuggestionController extends Controller<
  ISuggestionDoc,
  ISuggestion
> {
  constructor(public content: string, public authorId: string) {
    super(SuggestionModel, { authorId, content }, { content });
  }
}
