import { Task, TaskState } from '../../models/task';
import { api } from '../axios';
import { logger } from '../logger';
import { bot } from '../bot';
import { db } from '../mongo';

export async function handleTaskSuccess(task: Task, data: any) {
  const { data: resultData } = await api.get(`/download/e/${task.exportId}`, { responseType: 'stream' });

  await bot.telegram.sendDocument(task.chatId, {
    source: resultData,
    filename: data.name,
  });

  const tasksCollection = db.collection('tasks');

  await tasksCollection.updateOne({ _id: task._id }, { $set: { state: TaskState.resolved } });

  logger.info(`The task ${task._id} has been resolved`);
}
