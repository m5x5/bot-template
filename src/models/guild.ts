import { Document, model, Schema } from 'mongoose';

export interface IGuild {
  guildId: string;
  enabledCommands: string[];
  prefix: string;
  welcomeChannel?: string;
  leaveChannel?: string;
  pollChannel?: string;
}

export interface IGuildDoc extends Document, IGuild {}

const GuildSchema = new Schema({
  enabledCommands: { type: Array, default: [] },
  guildId: { type: String, required: true },
  leaveChannel: { type: String, default: '' },
  pollChannel: { type: String, default: '' },
  prefix: { type: String, default: '!' },
  welcomeChannel: { type: String, default: '' },
});

export default model<IGuildDoc>('guilds', GuildSchema);
