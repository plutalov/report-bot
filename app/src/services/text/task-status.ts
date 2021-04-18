import { Task, TaskState } from '../../models/task';
import { Markup } from 'telegraf';

export function taskStatus(task: Task): { text: string } {
  return {
    text: task.state === TaskState.queued || task.state === TaskState.pendingExport ? 'В ОЧЕРЕДИ' : 'ВЫПОЛНЕНО',
  };
}
