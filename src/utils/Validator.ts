import { COINS_SYMBOL } from './constants';

export default class Validator {
  static money(money: string) {
    if (isNaN(+money)) {
      throw new Error('Please provide a valid number');
    } else if (+money < 1) {
      throw new Error(
        `You can't add less than 1${COINS_SYMBOL} to someones wallet`
      );
    }

    return Validator;
  }
}
