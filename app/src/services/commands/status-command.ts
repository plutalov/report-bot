import { Context } from 'telegraf';
import { db } from '../mongo';
import { TaskState } from '../../models/task';
import { taskStatusTemplate } from '../templates/task-status-template';

export async function statusCommand(ctx: Context) {
  const tasksCollection = db.collection('tasks');

  const tasks = await tasksCollection
    .find({ chatId: ctx.chat?.id, $or: [{ state: TaskState.queued }, { state: TaskState.pendingExport }] })
    .toArray();

  if (tasks.length) {
    const statuses = tasks.map((task) => {
      const { text } = taskStatusTemplate(task);

      return `Файл: ${task.fileName}\nТекущий статус: ${text}`;
    });

    await ctx.reply(statuses.join('\n\n'));
  } else {
    await ctx.reply('Все загруженные файлы были успешно экспортированы.');
  }
}
