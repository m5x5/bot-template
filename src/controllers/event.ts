import Controller from "../core/Controller";
import UserModel, { IEvent, IEventDoc } from "../models/event";

export default class Event extends Controller<IEventDoc, IEvent> {
  constructor(public eventId?: number) {
    super(
      UserModel,
      {
        name: "Unknown Event",
        teams: [],
        members: [],
        coach: "Xpym",
        message: "",
      },
      { _id: eventId }
    );
  }
}
