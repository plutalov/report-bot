export enum TaskState {
  pending,
  resolved,
}

export interface Task {
  _id: string;
  chatId: number;
  exportId: number;
  state: TaskState;
}
