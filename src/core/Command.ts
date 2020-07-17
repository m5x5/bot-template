import { Message } from "discord.js";
import { ICommandOptions } from "../typings";

export class Command {
  public constructor(public options: ICommandOptions) { }

  /**
   * Check if the options of the single command apply
   * @param message The message to handle
   */
  checkConfig({ guild, author }: Message):void {
    const {privelagesRequired, guildOnly} = this.options;
    const user = guild?.members.resolve(author);

    if (guildOnly && !guild)
      throw new Error("This is a guild only command");
    if (!user && !(author.id === "705038391540056135"))
      throw new Error("The message author isn't on this server");
    if (privelagesRequired && !user?.hasPermission(privelagesRequired)) {
      throw new Error("You haven't the privilages to use this command");
    }
  }
}
