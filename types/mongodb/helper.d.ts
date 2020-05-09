import Query from "./query";
import { ObjectId } from "bson";
import { MongoX } from '../types/mongox';
export declare namespace Helper {
    function createId(id: number): ObjectId;
    function normalizePage<T>(query?: Query.QueryList<T>, limit?: number): Query.QueryList<T>;
    function getPages(limit: number, count: number): number[];
    function getObjectId(id: string | ObjectId): ObjectId;
    function getStringId(id: string | ObjectId): string;
    function removeIds___discontinued<T extends MongoX.Document>(documents: T | T[]): T[];
}
export default Helper;
