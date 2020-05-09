import { MongoClient, FilterQuery } from "mongodb";
import { MongoX } from '../types/mongox';

export module Query {
  export type QueryList<T> = MongoX.QueryList<T>;
  export type QueryListResult<T> = MongoX.QueryListResult<T>;
  export type QueryDocument<T> = MongoX.QueryDocument<T>;
  export type QueryDocumentResult<T> = MongoX.QueryDocumentResult<T>;
  export type SaveDocumentResult<T> = MongoX.SaveDocumentResult<T>;
  export type SaveListResult<T> = MongoX.SaveListResult<T>;
}
export default Query;
