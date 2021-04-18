import { Task, TaskState } from '../../models/task';
import { api } from '../axios';
import { logger } from '../logger';
import { exportRootFolder } from '../init-root-folders';
import { db } from '../mongo';
import { hasBeenSentTemplate } from '../templates/has-been-sent-template';
import { getEntityNameByExtension } from '../get-entity-name-by-extension';
import { Context } from 'telegraf';

export async function startTask(task: Task, ctx: Context) {
  try {
    const { data: exportData } = await api.post(
      `/api/rp/v1/${getEntityNameByExtension(task.fileExtension)}/File/${task.uploadedFileId}/Export`,
      {
        fileName: task.fileName,
        folderId: exportRootFolder,
        format: task.exportExtension ?? 'Pdf',
      },
    );

    logger.info(exportData, { action: 'export' });

    const tasksCollection = db.collection('tasks');

    await tasksCollection.updateOne(
      { _id: task._id },
      { $set: { exportId: exportData.id, state: TaskState.pendingExport } },
    );
  } catch (e) {
    logger.error(e);

    const tasksCollection = db.collection('tasks');

    await tasksCollection.updateOne({ _id: task._id }, { $set: { exportId: null, state: TaskState.failed } });
  } finally {
    const tasksCollection = db.collection('tasks');

    const resultTask = await tasksCollection.findOne({ _id: task._id });

    logger.debug({ resultTask });

    const { text, markup } = hasBeenSentTemplate(resultTask);

    await ctx.telegram.editMessageText(resultTask.chatId, resultTask.statusMessageId, undefined, text, markup);
  }
}
