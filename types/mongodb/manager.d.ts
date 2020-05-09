import { default as mongodb, Collection, FilterQuery, UpdateQuery } from "mongodb";
import { Query } from "./query";
import { MongoX } from "../types/mongox";
import { Setup } from "./setup";
export interface Manager<T extends MongoX.Document> {
    instantiated?(): void;
}
export declare abstract class Manager<T extends MongoX.Document> {
    private static _mongoPool;
    private static _singletonPool;
    protected collectionName: string;
    limit: number;
    static setup(mongoSetup: Setup.MongoSetup): Promise<boolean>;
    protected constructor();
    private instantiatedCalled;
    protected static getManager<T>(name: string, managerClass: any): T;
    get collection(): mongodb.Collection<T>;
    getCollection(): Collection<T>;
    getCollection<T>(name?: string): Collection<T>;
    getReferenceId(_id: MongoX.Id | string): MongoX.ReferenceId;
    find(query?: Query.QueryList<T>): Promise<Query.QueryListResult<T>>;
    find<TOutput>(query?: Query.QueryList<T>): Promise<Query.QueryListResult<TOutput>>;
    findOne(query: Query.QueryDocument<T>): Promise<Query.QueryDocumentResult<T>>;
    findOne<TOutput>(query: Query.QueryDocument<T>): Promise<Query.QueryDocumentResult<TOutput>>;
    findOneById(id: string | mongodb.ObjectId | undefined): Promise<Query.QueryDocumentResult<T>>;
    insertOne(doc: T): Promise<string | undefined>;
    insertMany(docs: T[]): Promise<number>;
    updateById(id: MongoX.Id, set: UpdateQuery<T>): Promise<number>;
    updateOne(query: FilterQuery<T> | T, update: UpdateQuery<T>): Promise<number>;
    updateMany(query: FilterQuery<T> | T, doc: T): Promise<number>;
    saveOne(doc: T): Promise<string | undefined>;
    removeEverythingEverythingEverything(): Promise<void | mongodb.WriteOpResult>;
    remove(doc: T): Promise<true | mongodb.WriteOpResult | undefined>;
    removeById(id: MongoX.Id): Promise<import("mongodb").WriteOpResult | undefined>;
}
export declare module Manager {
}
export default Manager;
