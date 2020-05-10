export class EventHandlerError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'EventHandlerError';
  }
}
