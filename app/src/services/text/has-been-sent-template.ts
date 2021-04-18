import { Task } from '../../models/task';
import { Markup } from 'telegraf';
import { taskStatus } from './task-status';

export function hasBeenSentTemplate(task: Task, doNotIncludeButton: boolean = false): { text: string; markup: any } {
  const mainMenuKeyboard = Markup.inlineKeyboard([Markup.button.callback('Обновить статус', 'update_status')]);

  return {
    text: `Файл ${task.fileName} был добавлен в очередь для генерации отчета.\n\nТекущий статус: ${
      taskStatus(task).text
    }.`,
    markup: doNotIncludeButton ? undefined : mainMenuKeyboard,
  };
}
