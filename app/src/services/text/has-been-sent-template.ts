import { Task, TaskState } from '../../models/task';
import { Markup } from 'telegraf';

export function hasBeenSentTemplate(task: Task, doNotIncludeButton: boolean = false): { text: string; markup: any } {
  const mainMenuKeyboard = Markup.inlineKeyboard([Markup.button.callback('Обновить статус', 'update_status')]);

  return {
    text: `Файл ${task.fileName} был добавлен в очередь для генерации отчета.\n\nТекущий статус: ${
      task.state === TaskState.queued || task.state === TaskState.pendingExport ? 'В ОЧЕРЕДИ' : 'ВЫПОЛНЕНО'
    }.`,
    markup: doNotIncludeButton ? undefined : mainMenuKeyboard,
  };
}
