import { Task, TaskState } from '../../models/task';
import { Context } from 'telegraf';
import { db } from '../mongo';
import { startTask } from '../export-task/start-task';
import { logger } from '../logger';

export async function setFormatCallback(ctx: Context) {
  const data = (ctx.callbackQuery as any).data;

  const result = /^set_format_(\w+)$/.exec(data);

  if (result == null) throw new Error(`${data} callback is invalid`);

  const [, extension] = result;

  const tasksCollection = db.collection('tasks');

  const task = await tasksCollection.findOne({ statusMessageId: ctx.callbackQuery?.message?.message_id });

  await tasksCollection.updateOne(
    { _id: task._id },
    { $set: { state: TaskState.pendingExport, exportExtension: extension } },
  );

  const resultTask = await tasksCollection.findOne({ _id: task._id });

  await startTask(resultTask, ctx);
}
