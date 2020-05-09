import { MongoX } from '../types/mongox';
export declare module Query {
    type QueryList<T> = MongoX.QueryList<T>;
    type QueryListResult<T> = MongoX.QueryListResult<T>;
    type QueryDocument<T> = MongoX.QueryDocument<T>;
    type QueryDocumentResult<T> = MongoX.QueryDocumentResult<T>;
    type SaveDocumentResult<T> = MongoX.SaveDocumentResult<T>;
    type SaveListResult<T> = MongoX.SaveListResult<T>;
}
export default Query;
