import { default as mongodb, Collection, Db, FilterQuery, UpdateQuery } from "mongodb";
import { Query } from "./query";
import { MongoX } from "../types/mongox";
import { Setup } from "./setup";
import { Helper } from "./helper";
import chalk from 'chalk';

// internal
interface MongoPoolSetup {
  uri: string;
  dbName: string
  db: Db;
  client: mongodb.MongoClient;
}
interface MongoPool {
  [collection: string]: MongoPoolSetup;
}
interface SingletonPool<T extends MongoX.Document | MongoX.Document> {
  [name: string]: Manager<T>;
}
// type StringKeysOf<T> = Extract<keyof T, string>;
// export abstract class Manager<T extends MongoX.Document | MongoX.Document> {
export interface Manager<T extends MongoX.Document> {
  instantiated?(): void;
}
export abstract class Manager<T extends MongoX.Document> {
  private static _mongoPool: MongoPool = {};
  private static _singletonPool: SingletonPool<any> = {};
  protected collectionName: string;
  public limit: number = 200;
  public static async setup(mongoSetup: Setup.MongoSetup): Promise<boolean> {
    let success = true;
    for (const prop in (mongoSetup as Setup.MongoSetup)) {
      if (mongoSetup.hasOwnProperty(prop)) {
        console.log(chalk.blueBright('-----------------------------------------------------'));
        console.log(chalk.blueBright('Connecting with MongoBD'));
        // console.log("- uri:\t\t ", chalk.blue(mongoSetup[prop].uri));
        // console.log("- database:\t ", chalk.blue(mongoSetup[prop].database));

        const client = await mongodb.MongoClient.connect(mongoSetup[prop].uri, { useNewUrlParser: true, useUnifiedTopology: true, })
          .catch((error) => {
            console.log(chalk.red('Fail to connect with MongoDB'));
            console.log("\t- database:\t ", chalk.red(mongoSetup[prop].database));
            success = false;
          });
        if (success) {
          this._mongoPool[prop] = <MongoPoolSetup>{
            uri: mongoSetup[prop].uri,
            dbName: mongoSetup[prop].database,
            client: client,
          };
          console.log(chalk.green('MongoDB connected'));
          console.log("- database:\t ", chalk.green(mongoSetup[prop].database));
          this._mongoPool[prop].db = this._mongoPool[prop].client.db(this._mongoPool[prop].dbName);
        }
      }
    }
    return success;
  }
  protected constructor() { }
  private instantiatedCalled: boolean = false;
  // public abstract instantiated?(): void;
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
  public getReferenceId(_id: MongoX.Id | string): MongoX.ReferenceId {
    return {
      _id,
      collectionName: this.collectionName
    };
  }
  // // helpers --------------------
  // private getObjectId(id: string | ObjectId): ObjectId {
  //   return (typeof id === "string" ? new ObjectId(id) : id);
  // }
  // private getStringId(id: string | ObjectId): string {
  //   return (typeof id === "string" ? id : id.toHexString());
  // }
  // find --------------------------
  public async find(query?: Query.QueryList<T>): Promise<Query.QueryListResult<T>>;
  public async find<TOutput>(query?: Query.QueryList<T>): Promise<Query.QueryListResult<TOutput>>;
  public async find<TOutput>(query?: Query.QueryList<T>): Promise<Query.QueryListResult<T | TOutput>> {
    let q = Helper.normalizePage(query);

    const limit: number = q && q.limit || 100;
    const skip: number = q && q.skip || 0;
    const isPipelineArray: boolean = q && q.query && Array.isArray(q.query) || false;
    const isSimpleQuery: boolean = !isPipelineArray && q && q.query !== undefined || false;
    const pipeline: any[] = isPipelineArray ? q!.query as any[] : [];
    const containsSearchText: boolean = q && q.search !== undefined || false;
    if (containsSearchText) {
      pipeline.unshift({ $match: { $text: { $search: q!.search } } });
    }
    if (isSimpleQuery) {
      pipeline.unshift({ $match: q!.query });
    }
    // query
    const pipelineCount = pipeline.concat({ $count: "count" });
    const queryCount = this.collection.aggregate(pipelineCount);
    const queryItems = this.collection.aggregate(pipeline).skip(skip).limit(limit);
    //
    const items = await queryItems.toArray().catch((e) => {
      console.log(chalk.red(`MongoX: Fail to query items in 'find'`));
      console.log(chalk.gray(e));
    });
    let count: number = 0;
    const counterResult = await queryCount.toArray().catch((e) => {
      console.log(chalk.red(`MongoX: Fail to count items in 'find'.`));
      console.log(chalk.gray(e));
    }) as unknown as { count: number }[];
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
  public async findOne(query: Query.QueryDocument<T>): Promise<Query.QueryDocumentResult<T>>;
  public async findOne<TOutput>(query: Query.QueryDocument<T>): Promise<Query.QueryDocumentResult<TOutput>>;
  public async findOne<TOutput extends MongoX.Document>(query: Query.QueryDocument<T>): Promise<Query.QueryDocumentResult<T | TOutput>> {
    const mergedQuery = Object.assign({}, query.query, query.id ? { _id: query.id } : {});
    const item = await this.collection.findOne(mergedQuery).catch((error => {
      console.log(chalk.red(`MongoX: Fail to findOne.`));
      console.log(chalk.gray(error));
    }));
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
  public async findOneById(id: string | mongodb.ObjectId | undefined): Promise<Query.QueryDocumentResult<T>> {
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
  public async insertOne(doc: T): Promise<string | undefined> {
    doc._id = typeof doc._id === "string" ? new mongodb.ObjectId(doc._id) : doc._id;
    var r = await this.collection.insertOne(doc as any).catch((error) => {
      console.log(chalk.red(`MongoX: Fail to insertOne: (${doc._id} )`));
      console.log(chalk.gray(error));
    });
    if (r && r.insertedId) {
      doc._id = r.insertedId.toHexString();
      return doc._id;
    } else {
      return undefined;
    }
  }
  public async insertMany(docs: T[]): Promise<number> {
    var r = await this.collection.insertMany(docs as any[]).catch((error) => {
      console.log(chalk.red(`MongoX: Fail to insertMany, (${docs.length} docs)`));
      console.log(chalk.gray(error));
    });
    console.log(r && r.insertedIds);
    return 0;
  }
  // update
  public async updateById(id: MongoX.Id, set: UpdateQuery<T>): Promise<number> {
    // const realId: ObjectId = Helper.getObjectId(id);// (typeof id === "string" ? new ObjectId(id) : id);
    const realId: mongodb.ObjectId = (typeof id === "string" ? new mongodb.ObjectId(id) : id);
    // set.$set!._id = realId;
    // console.log("---id", id, set.$set!._id)
    // delete (set.$set! as any)._id; // = realId;
    var r = await this.updateOne({
      _id: realId
    } as any, set).catch((error) => {
      console.log(chalk.red(`MongoX: Fail to updateById: ${id.toString()}`));
      console.log(chalk.gray(`${JSON.stringify(set)}`));
    });
    return r || 0;
  }
  public async updateOne(query: FilterQuery<T> | T, update: UpdateQuery<T>): Promise<number> {
    var r = await this.collection.updateOne(query, update).catch(error => {
      console.log(chalk.red(`MongoX: Fail to updateOne.`));
      console.log(chalk.gray(`${JSON.stringify(query)}`));
    });
    return r && r.modifiedCount || 0;
  }
  public async updateMany(query: FilterQuery<T> | T, doc: T): Promise<number> {
    var r = await this.collection.updateMany(query, {
      $set: doc
    }).catch(error => {
      console.log(chalk.red(`MongoX: Fail to updateMany.`));
      console.log(chalk.gray(`${JSON.stringify(query)}`));
    });
    return r && r.modifiedCount || 0;
  }
  // save -----------------
  public async saveOne(doc: T): Promise<string | undefined> {
    if (doc._id === "" || doc._id === undefined || doc._id === null) {
      const r: string | undefined = await this.insertOne(doc);
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
    const r = await this.collection.remove({}).catch(error => {
      console.log(chalk.red(`MongoX: Fail to removeEverythingEverythingEverything.`));
    });
    return r;
  }
  public async remove(doc: T) {
    if (doc._id !== undefined) {
      return await this.removeById(doc._id);
    }
    return true;
  }
  public async removeById(id: MongoX.Id): Promise<import("mongodb").WriteOpResult | undefined> {
    const realId: mongodb.ObjectId = (typeof id === "string" ? new mongodb.ObjectId(id) : id);
    const r = await this.collection.remove({ _id: realId }).catch(error => {
      console.log(chalk.red(`MongoX: Fail to removeById.`));
    });
    return r || undefined;
  }
}
export module Manager {

}
export default Manager;
