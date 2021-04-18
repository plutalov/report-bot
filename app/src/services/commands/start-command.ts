import { Context } from 'telegraf';
import { startTemplate } from '../templates/start-template';

export async function startCommand(ctx: Context) {
  const { text, markup } = startTemplate();

  await ctx.telegram.sendMessage(ctx.chat?.id as number, text, markup);
}
