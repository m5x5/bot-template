import Controller from '../core/Controller';
import UserModel, { IUser, IUserDoc } from '../models/user';
import Item from './item';

export default class User extends Controller<IUserDoc, IUser> {
  static getUsers(userIds: string[]) {
    return UserModel.find({}).where('userId').in(userIds).exec();
  }

  constructor(public userId: string) {
    super(
      UserModel,
      { userId, items: [], lastBankrob: 0, detentionDate: 0 },
      { userId }
    );
  }

  /**
   * This function gets the item, removes the money from the wallet and the item from the store,
   * and adds the item to the user
   * @param userId The discord id of the user who is buying the item
   * @param itemAlias The alias used to describe the item
   */
  async buyItem(itemAlias: string) {
    const item = await new Item(itemAlias).forceGet();
    if (item.count < 0) {
      throw new Error('Item does not exist, or is already out of stock');
    }

    // REVIEW
    await Promise.all([
      this.decrease('money', item.price),
      new Item(itemAlias).decrease('count', 1),
      this.pushItemToField('items', itemAlias),
    ]);

    return item;
  }

  getWithLean() {
    return this.model.findOne(this.conditions).lean();
  }
}
