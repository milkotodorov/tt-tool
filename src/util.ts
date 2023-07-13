export type FileData = {
  fileName: string,
  fileExtension: string,
  fileFullName: string,
  filePath: string,
  fileFullPath: string
}

export function fileNamePathSplit(fileFullPath: string): FileData | null {
  if (fileFullPath == null)
    return null;

  let fileData: FileData = {
    fileName: '',
    fileExtension: '',
    fileFullName: '',
    filePath: '',
    fileFullPath: fileFullPath
  }

  // MacOS & Linux
  if (process.platform == 'darwin' || process.platform == 'linux') {
    fileData.fileFullName = fileFullPath.substring(fileFullPath.lastIndexOf('/') + 1, fileFullPath.length);
    fileData.filePath = fileFullPath.substring(0, fileFullPath.lastIndexOf('/') + 1);
  }
  // Windows
  if (process.platform == 'win32') {
    fileData.fileFullName = fileFullPath.substring(fileFullPath.lastIndexOf('\\') + 1, fileFullPath.length);
    fileData.filePath = fileFullPath.substring(0, fileFullPath.lastIndexOf('\\') + 1);
  }

  fileData.fileName = fileData.fileFullName.substring(0, fileData.fileFullName.lastIndexOf('.'));
  fileData.fileExtension = fileData.fileFullName.substring(fileData.fileFullName.lastIndexOf('.') + 1,
      fileData.fileFullName.length);

  return fileData;
}