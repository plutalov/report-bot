import { Context } from 'telegraf';
import { helpTemplate } from '../templates/help-template';

export async function helpCommand(ctx: Context) {
  const { text } = helpTemplate();

  await ctx.replyWithMarkdown(text);
}
