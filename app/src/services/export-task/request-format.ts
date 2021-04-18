import { Task } from '../../models/task';
import { db } from '../mongo';
import { hasBeenSentTemplate } from '../templates/has-been-sent-template';
import { bot } from '../bot';

export async function requestFormat(task: Task) {
  const { text, markup } = hasBeenSentTemplate(task);

  const res = await bot.telegram.sendMessage(task.chatId, text, markup);

  const tasksCollection = db.collection('tasks');

  await tasksCollection.updateOne({ _id: task._id }, { $set: { statusMessageId: res.message_id } });
}
