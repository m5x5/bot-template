import { Permissions, RoleData } from 'discord.js';

export const COINS_SYMBOL = ':moneybag:';
export const ONE_SECOND_IN_MS = 1000;
export const ONE_MINUTE_IN_MS = ONE_SECOND_IN_MS * 60;
export const ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60;
export const TWELVE_HOURS_IN_MS = ONE_HOUR_IN_MS * 12;
export const MUTE_ROLE_OPTIONS = {
  data: {
    color: 'GREY',
    name: 'muted',
    permssions: new Permissions()
      .add(Permissions.FLAGS.VIEW_CHANNEL)
      .remove(
        Permissions.FLAGS.SPEAK,
        Permissions.FLAGS.SEND_MESSAGES,
        Permissions.FLAGS.SEND_TTS_MESSAGES
      ),
  } as RoleData,
};

export const COLORS = {
  error: 'RED',
  info: 'BLUE',
  success: 'GREEN',
};
export const ICONS = {
  error: ':rotating_light:',
  info: ':information_source:',
  success: ':white_check_mark:',
};
