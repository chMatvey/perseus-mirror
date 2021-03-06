import { Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';

export async function base64ToBlob(base64: string): Promise<Blob> {
  const response = await fetch(base64);
  return await response.blob();
}

export async function base64ToFile(base64: string, fileName: string): Promise<File> {
  const blob = await base64ToBlob(base64) as File;
  return new File([blob], fileName);
}

export function base64ToFileAsObservable(base64: string, fileName: string): Observable<File> {
  return fromPromise(base64ToFile(base64, fileName));
}

export enum MediaType {
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  JSON = 'application/json'
}

export function getBase64Header(mediaType: string): string {
  return `data:${mediaType};base64,`;
}

export const fileToBase64 = file => new Promise<{fileName: string, base64: string}>((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve({
    fileName: file.name,
    base64: reader.result as string
  });
  reader.onerror = error => reject(error);
});

export function fileToBase64AsObservable(file: File): Observable<{fileName: string, base64: string}> {
  return fromPromise(fileToBase64(file));
}

