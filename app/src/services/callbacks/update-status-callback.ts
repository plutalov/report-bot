import { Context } from 'telegraf';
import { db } from '../mongo';
import { hasBeenSentTemplate } from '../templates/has-been-sent-template';

export async function updateStatusCallback(ctx: Context) {
  const tasksCollection = db.collection('tasks');

  const task = await tasksCollection.findOne({ statusMessageId: ctx.callbackQuery?.message?.message_id });

  const { text, markup } = hasBeenSentTemplate(task);

  await ctx.telegram.editMessageText(
    ctx.callbackQuery?.message?.chat.id,
    ctx.callbackQuery?.message?.message_id,
    undefined,
    text,
    markup,
  );
}
