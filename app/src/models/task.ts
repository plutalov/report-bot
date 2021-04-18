export enum TaskState {
  queued,
  pendingExport,
  resolved,
  failed,
}

export interface Task {
  _id: string;
  chatId: number;
  fileUrl: string;
  fileExtension: string;
  fileName: string;
  exportId: number | null;
  statusMessageId: number | null;
  state: TaskState;
}
