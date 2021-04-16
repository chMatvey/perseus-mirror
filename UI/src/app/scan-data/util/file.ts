export function blobToFile(blob: Blob, name: string): File {
  const file: any = blob
  file.lastModifiedDate = new Date()
  file.name = name

  return file as File
}
