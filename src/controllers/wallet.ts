import Controller from '../core/Controller';
import WalletModel, { IWallet, IWalletDoc } from '../models/wallet';
const walletDebugger = require('debug')('thunder:UserController');

export default class Wallet extends Controller<IWalletDoc, IWallet> {
  constructor(public userId: string) {
    super(WalletModel, { userId, money: 0 }, { userId });
    walletDebugger('Created new Wallet instance for: ' + userId);
  }
}
