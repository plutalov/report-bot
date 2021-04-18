export function getEntityNameByExtension(ext: string) {
  if (ext.toLowerCase() === 'frx') {
    return 'Templates';
  } else if (ext.toLowerCase() === 'fpx') {
    return 'Reports';
  }

  throw new Error(`The extension ${ext.toLowerCase()} is invalid`);
}
