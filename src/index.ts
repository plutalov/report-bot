import { Telegraf } from 'telegraf';
import winston from 'winston';
import { config } from 'dotenv';

const logger = winston.createLogger({
  level: 'silly',
  format: winston.format.json(),
  defaultMeta: { service: 'the-bot' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.timestamp(), winston.format.prettyPrint()),
    }),
  ],
});

config({ path: '.env' });

if (process.env.BOT_TOKEN == null) throw new Error(`BOT_TOKEN environment variable must be set`);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('help', (ctx) => {
  ctx.telegram.sendMessage(ctx.message.chat.id, `<b>No help here!</b><br />There are spots even on the Sun.`);
});

bot.command('quit', (ctx) => {
  ctx.telegram.leaveChat(ctx.message.chat.id);
});

bot.on('text', (ctx) => {
  ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.state.role} (${ctx.message.text})`);
});

bot.on('callback_query', (ctx) => {
  ctx.telegram.answerCbQuery(ctx.callbackQuery.id);
});

bot.on('inline_query', (ctx) => {
  const result: any[] = [];

  ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result);
});

bot.launch().then(() => logger.info('The bot has been launched!'));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
