import Controller from "../core/Controller";
import UserModel, { IUser, IUserDoc } from "../models/user";

export default class User extends Controller<IUserDoc, IUser> {
  static getUsers(userIds: string[]): Promise<IUserDoc[]> {
    return UserModel.find({}).where("userId").in(userIds).exec();
  }

  constructor(public userId: string) {
    super(
      UserModel,
      { userId, items: [], lastBankrob: 0, detentionDate: 0 },
      { userId }
    );
  }
}
