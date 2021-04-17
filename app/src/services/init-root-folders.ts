import { api } from './axios';

export let templateRootFolder: string;
export let reportRootFolder: string;
export let exportRootFolder: string;

export async function initRootFolders() {
  const [
    {
      data: { id: templateFolderId },
    },
    {
      data: { id: reportFolderId },
    },
    {
      data: { id: exportFolderId },
    },
  ] = await Promise.all([
    api.get('/api/rp/v1/Templates/Root'),
    api.get('/api/rp/v1/Reports/Root'),
    api.get('/api/rp/v1/Exports/Root'),
  ]);

  templateRootFolder = templateFolderId;
  reportRootFolder = reportFolderId;
  exportRootFolder = exportFolderId;
}
