import Bot from "../core/Bot";
import { SERVER, CHANNELS } from "../utils/constants";
import { TextChannel, MessageEmbed, Message } from "discord.js";
import Event from "../controllers/event";
import { getChannel } from "../utils";
import { IEvent, IMemberData, IMessageContent, IMessageInfo } from "../typings";

export default class EventMessagesHandler {
  eventsChannel = getChannel(this.client, {
    guildId: SERVER,
    channelId: CHANNELS["community-events"],
  }) as TextChannel;

  constructor(public client: Bot) {
    this.client.addListener("loadEventHandler", () => this.load());
  }

  private async load() {
    const loadingEvents = (await new Event().getAll()).map((event) =>
      this.loadEvent(event)
    );
    return Promise.all(loadingEvents);
  }

  private async loadEvent(event: IEvent) {
    event.message =
      event.message ||
      (
        await this.updateMessage({
          event: {
            teams: event.teams,
            coach: event.coach,
            members: event.members,
          },
          channelId: "",
          guildId: "",
          messageId: "",
          id: event.message,
        })
      )?.id ||
      "";

    const message = this.eventsChannel.messages.resolve(event.message);
    await new Event(event._id).update("message", message?.id);

    message
      ?.createReactionCollector(() => true)
      .on("collect", (_reaction, user) => {
        this.addMemberToEvent({ member: user.id, event: event._id });
      });
  }

  private addMemberToEvent({ member, event }: IMemberData) {
    return new Event(event).pushItemToField("members", member);
  }

  async updateMessage(info: IMessageInfo): Promise<Message | undefined> {
    const embed = this.formatMessage(info.event);
    return info.id
      ? this.eventsChannel.messages.resolve(`${info.id}`)?.edit(embed)
      : this.eventsChannel.send(embed);
  }

  formatMessage(content: IMessageContent): MessageEmbed {
    const embed = new MessageEmbed()
      .addField("Coach", content.coach)
      .addField("Members", `<@${content.members?.join(">\n<@")}>` || "None")
      .setFooter("React to join");

    content.teams.forEach((team, i) =>
      embed.addField("Team " + (+i + 1), team.join("\n") || "None")
    );

    return embed;
  }
}
