import { Context } from 'telegraf';
import { db } from '../mongo';
import { Task, TaskState } from '../../models/task';
import { startTask } from './start-task';
import { logger } from '../logger';
import { errorTemplate } from '../templates/error-template';

export async function upload(ctx: Context) {
  try {
    const file = (ctx.update as any).message.document;

    const { file_id: fileId, file_name: fileName } = file;

    if (fileName == null) {
      await ctx.reply('The file has no name');

      return;
    }

    const extensionResult = /\.(frx|fpx)$/i.exec(fileName);

    if (!extensionResult) {
      await ctx.reply('The file has an unsupported extension');

      return;
    }

    const fileUrl = await ctx.telegram.getFileLink(fileId);

    const tasksCollection = db.collection('tasks');

    const insertedResponse = await tasksCollection.insertOne({
      chatId: ctx.chat?.id,
      state: TaskState.queued,
      fileUrl: fileUrl.toString(),
      fileName,
      fileExtension: extensionResult[1],
    });

    const task: Task = insertedResponse.ops[0];

    await startTask(task, ctx);
  } catch (e) {
    logger.error(e, { ctx });

    await ctx.reply(errorTemplate().text);
  }
}
