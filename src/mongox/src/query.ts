import { MongoClient, FilterQuery } from "mongodb";

export module Query {
  export interface QueryList<T> {
    skip?: number;
    limit?: number;
    page?: number;
    // pageSize?: number;
    sortBy?: string | string[] | { [field: string]: 1 | -1 };
    search?: string;
    query?: FilterQuery<T> | T;
  }
  export interface QueryListResult<T> extends QueryList<T> {
    error?: string;
    count: number;
    items: T[];
    pages: number[];
  }
  // query and Result single item ----
  export interface QueryDocument<T> {
    id?: MongoXType.Id;
    query?: FilterQuery<T>;
  }
  export interface QueryDocumentResult<T> extends QueryDocument<T> {
    error?: string;
    type: string;
    item?: T;
  }
  // updated
  export interface SaveDocumentResult<T> {
    error?: string;
    type: string;
    id?: MongoXType.Id;
    item?: T;
  }
  export interface SaveListResult<T> {
    error?: string;
    type: string;
    ids: MongoXType.Id[];
    items: T[];
  }
  // inserted
  function littleHack() {
    // ATTENTION: do NOT delete this function EVER
  }
}

export default Query;
