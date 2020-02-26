import { IDocument } from 'app/shared/model/document.model';

export interface ICar {
  id?: number;
  model?: string;
  document?: IDocument;
}

export class Car implements ICar {
  constructor(public id?: number, public model?: string, public document?: IDocument) {}
}
