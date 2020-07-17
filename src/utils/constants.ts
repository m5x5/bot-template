import dotenv from "dotenv";

dotenv.config();

export const ENV_STRING = process.env.NODE_ENV === "prod" ? "prod" : "dev";
export const COINS_SYMBOL = ":moneybag:";
export const PREFIX = process.env.PREFIX || "!";
export const BOT_NAME = "reflexx-bot";
export const COLORS = {
  error: "RED",
  info: "BLUE",
  success: "GREEN",
};

export const ICONS = {
  error: ":rotating_light:",
  info: ":information_source:",
  success: ":white_check_mark:",
};

export const SERVER = {
  prod: "637184660496973834",
  dev: "501765498145341460",
}[ENV_STRING];

export const CHANNELS = {
  prod: {
    "community-events": "719447850391699496",
  },
  dev: {
    "community-events": "730837972303478835",
  },
}[ENV_STRING];
