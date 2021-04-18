import { Task, TaskState } from '../../models/task';

export function taskStatusTemplate(task: Task): { text: string } {
  return {
    text:
      task.state === TaskState.queued || task.state === TaskState.pendingExport
        ? 'В ОЧЕРЕДИ'
        : task.state === TaskState.resolved
        ? 'ВЫПОЛНЕНО'
        : 'ОШИБКА',
  };
}
