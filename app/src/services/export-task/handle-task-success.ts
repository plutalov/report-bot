import { Task, TaskState } from '../../models/task';
import { api } from '../axios';
import { logger } from '../logger';
import { bot } from '../bot';
import { db } from '../mongo';
import { hasBeenSentTemplate } from '../text/has-been-sent-template';
import mongo from 'mongodb';

export async function handleTaskSuccess(task: Task, data: any) {
  const { data: resultData } = await api.get(`/download/e/${task.exportId}`, { responseType: 'stream' });

  await bot.telegram.sendDocument(task.chatId, {
    source: resultData,
    filename: data.name,
  });

  const tasksCollection = db.collection('tasks');

  await tasksCollection.updateOne({ _id: task._id }, { $set: { state: TaskState.resolved } });

  try {
    const updatedTask: Task = await tasksCollection.findOne({ _id: new mongo.ObjectId(task._id) });
    const { text, markup } = hasBeenSentTemplate(updatedTask, true);

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
