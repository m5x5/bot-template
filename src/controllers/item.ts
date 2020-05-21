import Controller from '../core/Controller';
import ItemModel, { IItem, IItemDoc } from '../models/item';

export default class Item extends Controller<IItemDoc, IItem> {
  constructor(alias?: string) {
    super(ItemModel, {
      aliases: ['unnamed'],
      count: 0,
      price: 10,
    });
    this.conditions = { alias };
  }
}
