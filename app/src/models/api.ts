export interface IData {
  reportInfo: {
    author: null | string;
    created: string;
    creatorVersion: string;
    description: null | string;
    modified: string;
    name: null | string;
    picture: null | string;
    previewPictureRatio: number;
    saveMode: string;
    savePreviewPicture: boolean;
    tag: null | string;
    version: null | string;
  };
  name: string;
  parentId: string;
  tags: null | string;
  icon: null | string;
  type: string;
  size: number;
  subscriptionId: string;
  status: string;
  id: string;
  createdTime: string;
  creatorUserId: string;
  editedTime: string;
  editorUserId: string;
}

export interface IExportData {
  format: string;
  reportId: string;
  name: string;
  parentId: string;
  tags: null | string;
  icon: null | string;
  type: string;
  size: number;
  subscriptionId: string;
  status: string;
  id: string;
  createdTime: string;
  creatorUserId: string;
  editedTime: string;
  editorUserId: string;
}
