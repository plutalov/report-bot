import { Task, TaskState } from '../../models/task';
import { Markup } from 'telegraf';
import { taskStatusTemplate } from './task-status-template';
import availableExportExtensions from '../../config/available-export-extensions.json';

export function hasBeenSentTemplate(task: Task): { text: string; markup: any } {
  if (task.state === TaskState.formatPending) {
    const mainMenuKeyboard = Markup.inlineKeyboard(
      availableExportExtensions.map((format) => Markup.button.callback(format, `set_format_${format.toLowerCase()}`)),
    );

    return {
      text: `Файл ${task.fileName} был добавлен в очередь для генерации отчета.\n\nПожалуйста, выберите формат выходного файла.`,
      markup: mainMenuKeyboard,
    };
  } else {
    const mainMenuKeyboard = Markup.inlineKeyboard([Markup.button.callback('Обновить статус', 'update_status')]);

    return {
      text: `Файл ${task.fileName} был добавлен в очередь для генерации отчета.\n\nТекущий статус: ${
        taskStatusTemplate(task).text
      }.`,
      markup: task.state === TaskState.queued || task.state === TaskState.pendingExport ? mainMenuKeyboard : undefined,
    };
  }
}
