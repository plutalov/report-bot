import { Telegraf } from 'telegraf';

if (process.env.BOT_TOKEN == null) throw new Error(`BOT_TOKEN environment variable must be set`);

export const bot = new Telegraf(process.env.BOT_TOKEN);
