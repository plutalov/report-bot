import { Context } from 'telegraf';
import { startTemplate } from '../templates/start-template';
import { errorTemplate } from '../templates/error-template';
import { logger } from '../logger';

export async function startCommand(ctx: Context) {
  try {
    const { text, markup } = startTemplate();

    await ctx.telegram.sendMessage(ctx.chat?.id as number, text, markup);
  } catch (e) {
    logger.error(e, { ctx });

    await ctx.reply(errorTemplate().text);
  }
}
