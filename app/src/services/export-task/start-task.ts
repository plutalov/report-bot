import { Task, TaskState } from '../../models/task';
import { api, axios } from '../axios';
import { logger } from '../logger';
import { exportRootFolder, templateRootFolder } from '../init-root-folders';
import { db } from '../mongo';
import { bot } from '../bot';
import { Markup } from 'telegraf';
import { hasBeenSentTemplate } from '../text/has-been-sent-template';

export async function startTask(task: Task) {
  const response = await axios.get<Buffer>(task.fileUrl.toString(), {
    responseType: 'arraybuffer',
  });

  const { data } = await api.post(
    `/api/rp/v1/Templates/Folder/${templateRootFolder}/File`,
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
    `/api/rp/v1/Templates/File/${data.id}/Export`,
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

  const { text, markup } = hasBeenSentTemplate(task);

  const res = await bot.telegram.sendMessage(task.chatId, text, markup);

  await tasksCollection.updateOne(
    { _id: task._id },
    { $set: { exportId: exportData.id, state: TaskState.pendingExport, statusMessageId: res.message_id } },
  );
}
