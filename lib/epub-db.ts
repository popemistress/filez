import Dexie, { Table } from 'dexie';

export interface Annotation {
  id: string;
  cfiRange: string;
  text: string;
  note?: string;
  color?: string;
  createdAt: number;
}

export interface EpubBookRecord {
  id: string;
  name: string;
  size: number;
  url: string;
  createdAt: number;
  updatedAt?: number;
  currentCfi?: string;
  percentage?: number;
  annotations: Annotation[];
  file?: Blob;
}

export class EpubDB extends Dexie {
  books!: Table<EpubBookRecord>;

  constructor() {
    super('FilezEpubDB');
    
    this.version(1).stores({
      books: 'id, name, url, createdAt, updatedAt, currentCfi, percentage',
    });
  }
}

export const epubDb = new EpubDB();
