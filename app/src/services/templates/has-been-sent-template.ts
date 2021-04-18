import { Task, TaskState } from '../../models/task';
import { Markup } from 'telegraf';
import { taskStatusTemplate } from './task-status-template';

export function hasBeenSentTemplate(task: Task): { text: string; markup: any } {
  const mainMenuKeyboard = Markup.inlineKeyboard([Markup.button.callback('Обновить статус', 'update_status')]);

  return {
    text: `Файл ${task.fileName} был добавлен в очередь для генерации отчета.\n\nТекущий статус: ${
      taskStatusTemplate(task).text
    }.`,
    markup: task.state === TaskState.queued || task.state === TaskState.pendingExport ? mainMenuKeyboard : undefined,
  };
}
