import { Task, TaskState } from '../../models/task';
import { api } from '../axios';
import { logger } from '../logger';
import { bot } from '../bot';
import { db } from '../mongo';
import { hasBeenSentTemplate } from '../templates/has-been-sent-template';
import mongo from 'mongodb';
import { IExportData } from '../../models/api';

export async function handleTask(task: Task) {
  const { data }: { data: IExportData } = await api.get(`/api/rp/v1/Exports/File/${task.exportId}`);

  if (data.status === 'Success') {
    const { data: resultData } = await api.get(`/download/e/${task.exportId}`, { responseType: 'stream' });

    await bot.telegram.sendDocument(task.chatId, {
      source: resultData,
      filename: data.name,
    });

    const tasksCollection = db.collection('tasks');

    await tasksCollection.updateOne({ _id: task._id }, { $set: { state: TaskState.resolved } });

    try {
      const updatedTask: Task = await tasksCollection.findOne({ _id: new mongo.ObjectId(task._id) });
      const { text, markup } = hasBeenSentTemplate(updatedTask);

      await bot.telegram.editMessageText(
        updatedTask.chatId,
        updatedTask.statusMessageId as number,
        undefined,
        text,
        markup,
      );
    } catch (e) {
      logger.error(e);
    }

    logger.info(`The task ${task._id} has been resolved`);
  }
}
