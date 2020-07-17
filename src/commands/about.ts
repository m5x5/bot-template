import { Message, MessageEmbed } from "discord.js";
import { Command } from "../core/Command";

export default new Command({
  aliases: ["about", "whoareyou", "website"],
  name: "About Command",
  run(message: Message) {
    const embed = new MessageEmbed().setDescription(
      `This bot was created by <@277738577721556994>.
For the [Reflexx Discord Server](https://google.com)`
    );

    return message.channel.send(embed);
  },
});
