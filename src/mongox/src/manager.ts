import { Collection, Db, MongoClient, FilterQuery, ObjectId, UpdateQuery } from "mongodb";
import { Query } from "./query";
import { Setup } from "./setup";
import { Helper } from "./helper";
import { ValidationHelper } from "../../validation/validation-helper";

// import { ValidationHelper } from "@validation/validation-helper";

// internal
interface MongoPoolSetup {
  uri: string;
  dbName: string
  db: Db;
  client: MongoClient;
}
interface MongoPool {
  [collection: string]: MongoPoolSetup;
}
interface SingletonPool<T extends MongoXType.Document | MongoXType.Document> {
  [name: string]: Manager<T>;
}
// type StringKeysOf<T> = Extract<keyof T, string>;
// export abstract class Manager<T extends MongoXType.Document | MongoXType.Document> {
export abstract class Manager<T extends MongoXType.Document> {
  private static _mongoPool: MongoPool = {};
  private static _singletonPool: SingletonPool<any> = {};
  protected collectionName: string;
  public limit: number = 200;
  public static async setup(mongoSetup: Setup.MongoSetup): Promise<boolean> {
    for (const prop in (mongoSetup as Setup.MongoSetup)) {
      if (mongoSetup.hasOwnProperty(prop)) {
        const client = await MongoClient.connect(mongoSetup[prop].uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("mongodb connected");
        this._mongoPool[prop] = <MongoPoolSetup>{
          uri: mongoSetup[prop].uri,
          dbName: mongoSetup[prop].database,
          client: client,
        };
        this._mongoPool[prop].db = this._mongoPool[prop].client.db(this._mongoPool[prop].dbName);
      }
    }
    return true;
  }
  protected constructor() { }
  private instantiatedCalled: boolean = false;
  public abstract instantiated?(): void;
  protected static getManager<T>(name: string, managerClass: any): T {
    if (this._singletonPool[name] === undefined) {
      this._singletonPool[name] = new managerClass() as Manager<any>;
      const ma = this._singletonPool[name];
      ma.collectionName = (managerClass as Manager<any>).collectionName;
      if (ma.instantiated !== undefined) {
        ma.instantiated();
      }
    }
    return this._singletonPool[name] as unknown as T;
  }
  public get collection() {
    return this.getCollection<T>(this.collectionName);
  }
  public getCollection(): Collection<T>;
  public getCollection<T>(name?: string): Collection<T>;
  public getCollection(name?: string): Collection<T> {
    const collectionName: string = name || this.collectionName;
    const setupKey: string = Manager._mongoPool[collectionName] === undefined ? "default" : collectionName;
    const mongoPoolSetup: MongoPoolSetup = Manager._mongoPool[setupKey];
    return mongoPoolSetup.db.collection<T>(collectionName);
  }
  // // helpers --------------------
  // private getObjectId(id: string | ObjectId): ObjectId {
  //   return (typeof id === "string" ? new ObjectId(id) : id);
  // }
  // private getStringId(id: string | ObjectId): string {
  //   return (typeof id === "string" ? id : id.toHexString());
  // }
  // find --------------------------
  public async find(query?: Query.QueryList<T>): Promise<Query.QueryListResult<T>> {
    let q = Helper.normalizePage(query);

    const limit: number = q && q.limit || 100;
    const skip: number = q && q.skip || 0;
    const isPipelineArray: boolean = q && q.query && Array.isArray(q.query) || false;
    const isSimpleQuery: boolean = !isPipelineArray && q && q.query !== undefined || false;
    const pipeline: any[] = isPipelineArray ? q!.query as any[] : [];
    const containsSearchText: boolean = q && q.search !== undefined || false;
    if (containsSearchText) {
      pipeline.push({ $match: { $text: { $search: q!.search } } });
    }
    if (isSimpleQuery) {
      pipeline.push({ $match: q!.query });
    }
    // query
    const pipelineCount = pipeline.concat({ $count: "count" });
    const queryCount = this.collection.aggregate(pipelineCount);
    const queryItems = this.collection.aggregate(pipeline).skip(skip).limit(limit);
    //
    const items = await queryItems.toArray();
    let count: number = 0;
    const counterResult = await queryCount.toArray() as unknown as { count: number }[];
    if (counterResult.length > 0) {
      count = counterResult[0].count; // this should be countDocuments
    }
    const result: Query.QueryListResult<T> = Object.assign(q || {}, <Query.QueryListResult<T>>{
      // error: "false",
      skip,
      limit,
      items,
      count,
      pages: Helper.getPages(limit, count)
    });
    return result;
  }
  // find --------------------------
  public async findOne(query: Query.QueryDocument<T>): Promise<Query.QueryDocumentResult<T>> {
    const mergedQuery = Object.assign({}, query.query, query.id ? { _id: query.id } : {});
    const item = await this.collection.findOne(mergedQuery);
    if (item !== undefined && item !== null) {
      return {
        // error: false,
        id: item._id,
        // query: mergedQuery,
        item,
        type: this.collectionName
      }
    } else {
      return {
        // query: mergedQuery,
        error: "Not found.",
        type: this.collectionName
      }
    }
  }
  public async findOneById(id: string | ObjectId | undefined): Promise<Query.QueryDocumentResult<T>> {
    if (id === undefined) {
      return {
        error: "Not found!",
        type: this.collectionName
      };
    } else {
      return this.findOne({ id: Helper.getObjectId(id) });
    }
  }
  // insert / update --------------------------
  // treatment
  // public async treatment<TIntro>(doc: TIntro): T {
  //   return doc;
  // }
  // insert
  public async insertOne(doc: T): Promise<string> {
    doc._id = typeof doc._id === "string" ? new ObjectId(doc._id) : doc._id;
    var r = await this.collection.insertOne(doc);
    doc._id = r.insertedId.toHexString();
    return doc._id;
  }
  public async insertMany(docs: T[]): Promise<string[]> {
    var r = await this.collection.insertMany(docs);
    return []
  }
  // update
  public async updateById(id: MongoXType.Id, set: UpdateQuery<T>): Promise<number> {
    const realId: ObjectId = (typeof id === "string" ? new ObjectId(id) : id);
    set.$set!._id = realId;
    var r = await this.updateOne({
      _id: realId
    } as any, set);
    return r;
  }
  public async updateOne(query: FilterQuery<T> | T, update: UpdateQuery<T>): Promise<number> {
    var r = await this.collection.updateOne(query, update);
    return r.modifiedCount;
  }
  public async updateMany(query: FilterQuery<T> | T, doc: T): Promise<number> {
    var r = await this.collection.updateMany(query, {
      $set: doc
    });
    return r.modifiedCount;
  }
  // save -----------------
  public async saveOne(doc: T): Promise<string> {
    if (ValidationHelper.isEmpty(doc._id)) {
      const r: string = await this.insertOne(doc);
      return r;
    } else {
      const searchItem = await this.findOneById(doc._id);
      if (searchItem.item === undefined) {
        const r = await this.insertOne(doc);
        return r;
      } else {
        const c = await this.updateById(doc._id!, { $set: doc });
        return Helper.getStringId(doc._id!);
      }
    }
  }
  // remove --------------------------
  public async removeEverythingEverythingEverything() {
    const r = await this.collection.remove({});
    return r;
  }
  public async remove(doc: T) {
    if (doc._id !== undefined) {
      return await this.removeById(doc._id);
    }
    return true;
  }
  public async removeById(id: MongoXType.Id) {
    const realId: ObjectId = (typeof id === "string" ? new ObjectId(id) : id);
    const r = await this.collection.remove({ _id: realId });
    return r;
  }
}
export module Manager {

}
export default Manager;
