import { Context } from 'telegraf';
import { helpTemplate } from '../templates/help-template';
import { errorTemplate } from '../templates/error-template';
import { logger } from '../logger';

export async function helpCommand(ctx: Context) {
  try {
    const { text } = helpTemplate();

    await ctx.replyWithMarkdown(text);
  } catch (e) {
    logger.error(e, { ctx });

    await ctx.reply(errorTemplate().text);
  }
}
