export enum TaskState {
  queued,
  formatPending,
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
  uploadedFileId: string;
  exportId: number | null;
  exportExtension: string | null;
  statusMessageId: number | null;
  state: TaskState;
}
