import { Context } from 'telegraf';
import { db } from '../mongo';
import { Task, TaskState } from '../../models/task';
import { startTask } from './start-task';
import { logger } from '../logger';
import { errorTemplate } from '../templates/error-template';
import { requestFormat } from './request-format';
import { api, axios } from '../axios';
import { getEntityNameByExtension } from '../get-entity-name-by-extension';
import { templateRootFolder } from '../init-root-folders';

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

    try {
      const response = await axios.get<Buffer>(task.fileUrl.toString(), {
        responseType: 'arraybuffer',
      });

      const { data } = await api.post(
        `/api/rp/v1/${getEntityNameByExtension(task.fileExtension)}/Folder/${templateRootFolder}/File`,
        {
          name: task.fileName,
          content: response.data.toString('base64'),
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json-patch+json',
          },
        },
      );

      logger.info(data, { action: 'upload file' });

      await tasksCollection.updateOne(
        { _id: task._id },
        { $set: { state: TaskState.formatPending, uploadedFileId: data.id } },
      );
    } catch (e) {
      logger.error(e);

      await tasksCollection.updateOne({ _id: task._id }, { $set: { state: TaskState.failed } });
    }

    const resultTask: Task = await tasksCollection.findOne({ _id: task._id });

    await requestFormat(resultTask);
  } catch (e) {
    logger.error(e, { ctx });

    await ctx.reply(errorTemplate().text);
  }
}
