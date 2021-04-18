import { Task, TaskState } from '../../models/task';
import { api, axios } from '../axios';
import { logger } from '../logger';
import { exportRootFolder, templateRootFolder } from '../init-root-folders';
import { db } from '../mongo';
import { bot } from '../bot';
import { hasBeenSentTemplate } from '../templates/has-been-sent-template';
import { getEntityNameByExtension } from '../get-entity-name-by-extension';
import { Context } from 'telegraf';

export async function startTask(task: Task, ctx: Context) {
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

    const { data: exportData } = await api.post(
      `/api/rp/v1/${getEntityNameByExtension(task.fileExtension)}/File/${data.id}/Export`,
      {
        fileName: task.fileName,
        folderId: exportRootFolder,
        format: 'Pdf',
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json-patch+json',
        },
      },
    );

    logger.info(exportData, { action: 'export' });

    const tasksCollection = db.collection('tasks');

    await tasksCollection.updateOne(
      { _id: task._id },
      { $set: { exportId: exportData.id, state: TaskState.pendingExport } },
    );
  } catch (e) {
    logger.error(e, { ctx });

    const tasksCollection = db.collection('tasks');

    await tasksCollection.updateOne({ _id: task._id }, { $set: { exportId: null, state: TaskState.failed } });
  } finally {
    const tasksCollection = db.collection('tasks');

    const resultTask = await tasksCollection.findOne({ _id: task._id });

    const { text, markup } = hasBeenSentTemplate(resultTask);

    const res = await bot.telegram.sendMessage(resultTask.chatId, text, markup);

    await tasksCollection.updateOne({ _id: resultTask._id }, { $set: { statusMessageId: res.message_id } });
  }
}
