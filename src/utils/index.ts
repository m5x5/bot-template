import {
  Client,
  GuildChannel,
  Message,
  MessageEmbed,
  TextChannel,
} from "discord.js";
import { COLORS } from "./constants";
import dotenv from "dotenv";
import { IMessageInfo, IChannelInfo, IConfirm, IReplyInfo } from "../typings";

dotenv.config();

export function sendReply({
  type = "info",
  message,
  channel,
}: IReplyInfo): void {
  const embed = new MessageEmbed()
    .setColor(COLORS[type])
    .setDescription(message);
  channel?.send(embed);
}

export const confirmAction = async (confirm: IConfirm): Promise<boolean> => {
  const { message, confirmText } = confirm;
  const { author } = message;
  const confirmMsg = await message.reply(confirmText);
  const choice = ["✅", "❌"];
  const collector = await confirmMsg.awaitReactions(
    ({ emoji }, { id }) => choice.includes(emoji.name) && id === author.id,
    { time: 15000, max: 1 }
  );

  // React with emojis
  choice.map(confirmMsg.react);

  return collector.first()?.emoji.name === "✅";
};

export const getChannel = (
  client: Client,
  channelInfo: IChannelInfo
): GuildChannel | null | undefined => {
  const { guildId, channelId } = channelInfo;
  return client.guilds.resolve(guildId)?.channels.resolve(channelId);
};

export const getMessage = (
  client: Client,
  msgInfo: IMessageInfo
): Message | null | undefined => {
  return (getChannel(client, msgInfo) as
    | TextChannel
    | null
    | undefined)?.messages.resolve(msgInfo.messageId);
};
