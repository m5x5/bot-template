import { Document, model, Schema } from "mongoose";

export interface IEvent {
  name: string;
  coach: string;
  members: string[];
  teams: string[][];
  message: string;
}

export interface IEventDoc extends Document, IEvent {}

const EventSchema = new Schema({
  members: { default: [], type: Array },
  teams: { default: [], type: Array },
  coach: { type: String, default: "Xpym" },
  name: { type: String, required: true },
  message: { type: String, default: "" },
});

export default model<IEventDoc>("users", EventSchema);
