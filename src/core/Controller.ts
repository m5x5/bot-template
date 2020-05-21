import { Document, FilterQuery, Model } from 'mongoose';

export default class Controller<M extends Document, O extends unknown> {
  constructor(
    public model: Model<M>,
    public defaultDocument: O,
    public conditions: FilterQuery<M> = {}
  ) {}

  get() {
    return this.model.findOne(this.conditions).lean().exec();
  }

  async forceGet(selector?: string) {
    if (selector) {
      // tslint:disable-next-line: no-console
      console.warn('Selector is deprecated');
    }
    const doc = await this.model.findOne(this.conditions).exec();
    return doc || this.create();
  }

  async getField(selector: string) {
    const query = this.model.findOne(this.conditions).lean();

    if (selector) {
      query.select(selector);
    }

    return (await query.exec()) || (await this.create());
  }

  getByField(field: string, value: string) {
    return this.model
      .findOne({ [field]: value } as FilterQuery<M>)
      .lean()
      .exec();
  }

  create(data?: O) {
    return new this.model(
      Object.assign(this.defaultDocument, data || {})
    ).save();
  }

  exists(): Promise<boolean> {
    return this.model.exists(this.conditions);
  }

  async getRandomWallet(): Promise<O> {
    const docCount = await this.model.count({});
    const randomNumber = Math.floor(Math.random() * docCount);
    return this.model.findOne({}).lean().skip(randomNumber).exec() as Promise<
      O
    >;
  }

  /**
   * This function increases the value of a given field,
   * and creates a new one if the document doesn't exist
   * @param field The name of the field which to increase
   * @param amount The number by which to increase the given field
   */
  async increase(field: string, amount: number): Promise<void> {
    const exists = await this.exists();
    if (!exists) {
      await this.create();
    }
    await this.model
      .updateOne(this.conditions, { $inc: { [field]: amount } } as any)
      .exec();
  }

  async decrease(field: string, amount: number): Promise<void> {
    const exists = await this.exists();
    if (!exists) {
      await this.create();
    }
    await this.model
      .updateOne(this.conditions, { $inc: { [field]: -amount } } as any)
      .exec();
  }

  async pushItemToField(field: string, item: string): Promise<void> {
    await this.model
      .updateOne(this.conditions, { $push: { [field]: item } } as any)
      .exec();
  }

  update(field: string, value: any): Promise<void> {
    return this.model
      .updateOne(this.conditions, { [field]: value } as any)
      .exec();
  }

  delete() {
    return this.model.deleteOne(this.conditions).lean().exec();
  }

  getAll({
    conditions,
    selectOptions,
  }: { conditions?: FilterQuery<M>; selectOptions?: any } = {}) {
    return this.model
      .find(conditions || {})
      .select(selectOptions ? selectOptions : {})
      .lean()
      .exec();
  }
}
