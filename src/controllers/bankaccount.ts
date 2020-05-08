import Controller from '../core/Controller';
import BankAccountModel, {
  IBankAccount,
  IBankAccountDocument,
} from '../models/bankaccount';
import Wallet from './wallet';
const userDebugger = require('debug')('thunder:UserController');

export default class BankAccountController extends Controller<
  IBankAccountDocument,
  IBankAccount
> {
  static getFromArray(userIds: string[]) {
    return BankAccountModel.find({}).where('userId').in(userIds).exec();
  }

  constructor(public userId: string) {
    super(BankAccountModel, { userId, money: 0 });
    this.conditions = { userId };
    userDebugger('Created BankAccountController instance for: ' + userId);
  }

  async deposit(amount: number) {
    return Promise.all([
      new Wallet(this.userId).decrease('money', amount),
      this.increase('money', amount),
    ]);
  }

  async withdraw(amount: number) {
    return Promise.all([
      new Wallet(this.userId).increase('money', amount),
      this.decrease('money', amount),
    ]);
  }

  async robBank(robberIds: string[]) {
    const bankaccounts = await this.getAll({
      conditions: {
        userId: { $nin: robberIds },
      },
      selectOptions: {
        money: 1,
        userId: 1,
      },
    });
    let loot = 0;

    const promises = bankaccounts.map((account) => {
      const accountLoot = Math.floor(account.money * 0.75);

      loot += accountLoot;

      return new BankAccountController(account.userId).update(
        'money',
        account.money - accountLoot
      );
    });

    await Promise.all(promises);

    return loot;
  }
}
