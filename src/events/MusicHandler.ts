import { MessageEmbed, VoiceChannel, VoiceConnection } from 'discord.js';
import search from 'yt-search';
import ytdl from 'ytdl-core-discord';
import { GuildMessage } from '../../typings';
import Bot from '../core/Bot';
import EventHandler, { IEvents } from '../core/EventHandler';

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

interface IGuildData {
  position: number;
  playlist: search.VideoSearchResult[];
  currentSong?: search.VideoSearchResult;
  connection: VoiceConnection;
}

interface IMusicEvents extends IEvents {
  pause: (message: GuildMessage) => void;
}

export default class MusicHandler extends EventHandler<IMusicEvents> {
  guildsMusicData: Map<string, IGuildData> = new Map();

  constructor(client: Bot) {
    super(client, 'MusicHandler');

    this.registerEvent('pause', this.pause.bind(this));
    this.registerEvent('play', this.play.bind(this));
    this.registerEvent('queue', this.queue.bind(this));
    this.registerEvent('repeat', this.repeat.bind(this));
    this.registerEvent('shuffle', this.shuffle.bind(this));
    this.registerEvent('skip', this.skip.bind(this));
    this.registerEvent('stop', this.stop.bind(this));
  }

  async play({ member, guild, channel }: GuildMessage, songName?: string) {
    if (!member?.voice.channel)
      throw new Error('You have to be in a voice channel to use this command');
    const voiceChannel = member?.voice.channel;
    let musicData = this.guildsMusicData.get(guild.id);
    if (!musicData) {
      musicData = await this.createMusicData(voiceChannel);
      this.guildsMusicData.set(guild.id, musicData);
    }

    if (musicData.connection.dispatcher?.paused) {
      // Resume if paused
      return musicData.connection.dispatcher.resume();
    }
    if (!songName) throw new Error('Please enter the song you want to play');

    const songInfo = await this.getSongInfo(songName);

    if (!songInfo) throw new Error("Sorry, I couldn't find this song");
    if (musicData.currentSong) return musicData.playlist.push(songInfo);

    musicData.currentSong = songInfo;
    await this.playNewSong(songInfo.url, musicData);

    const embed = new MessageEmbed().setDescription(
      'Playing ' + songInfo.title
    );

    await channel.send(embed);
  }

  async getSongInfo(songName: string) {
    return (await search({ search: songName })).videos[0];
  }

  pause({ guild }: GuildMessage) {
    const musicData = this.guildsMusicData.get(guild.id);
    if (!musicData) throw new Error('There is nothing to pause');
    musicData.connection.dispatcher.pause(true);
  }

  repeat({ guild }: GuildMessage) {
    const musicData = this.guildsMusicData.get(guild.id);
    if (!musicData?.currentSong?.url)
      throw new Error('There is nothing to repeat');
    return this.playNewSong(musicData.currentSong.url as string, musicData);
  }

  stop({ guild }: GuildMessage) {
    const musicData = this.guildsMusicData.get(guild.id);
    if (!musicData?.connection.dispatcher)
      throw new Error('There is nothing playing right now');
    musicData.connection.dispatcher.destroy();
  }

  skip({ guild }: GuildMessage) {
    const musicData = this.guildsMusicData.get(guild.id);
    const nextSong = musicData?.playlist.shift();

    if (!musicData) throw new Error('There is no music playing right now');
    if (!nextSong) throw new Error('This is the last song in the queue');

    musicData.currentSong = nextSong;
    return this.playNewSong(musicData.currentSong.url, musicData);
  }

  shuffle({ guild, channel }: GuildMessage) {
    const musicData = this.guildsMusicData.get(guild.id);
    if (!musicData?.playlist[0])
      throw new Error('There is nothing in the queue to shuffle');

    musicData.playlist = shuffleArray(musicData.playlist);

    return channel.send('Shuffled successfully');
  }

  queue({ guild, channel }: GuildMessage) {
    const musicData = this.guildsMusicData.get(guild.id);
    const embed = new MessageEmbed();
    const songTitles = musicData?.playlist.map((song) => song.title);

    if (songTitles && songTitles[0]) {
      embed.setDescription(songTitles.join('\n'));
    } else {
      embed.setDescription('*There are no songs in queue*');
    }
    return channel.send(embed);
  }

  private async createMusicData(voiceChannel: VoiceChannel) {
    const connection = await voiceChannel.join();

    return {
      connection,
      playlist: [],
      position: 0,
    };
  }

  private async playNewSong(url: string, { connection }: IGuildData) {
    connection.play(
      await ytdl(url, { filter: 'audioonly', quality: 'lowest' }),
      { type: 'opus' }
    );
  }
}
