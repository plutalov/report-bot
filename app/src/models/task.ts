export enum TaskState {
  pending,
  resolved,
}

export interface Task {
  chatId: number;
  exportId: number;
  state: TaskState;
}
