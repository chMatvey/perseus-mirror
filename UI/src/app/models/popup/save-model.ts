import { Observable } from 'rxjs';

export interface SaveModel {
  header: string,
  label: string,
  okButton: string,
  type: string,
  errorMessage: string,
  items: any[]
  existingNames: any[]
  save$?: (payload: string) => Observable<any>
}
