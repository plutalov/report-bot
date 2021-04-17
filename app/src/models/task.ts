export enum TaskState {
  queued,
  pendingExport,
  resolved,
}

export interface Task {
  _id: string;
  chatId: number;
  fileUrl: string;
  fileName: string;
  exportId: number | null;
  state: TaskState;
}
