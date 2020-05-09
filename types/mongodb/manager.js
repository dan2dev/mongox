import { default as mongodb } from "mongodb";
import { Helper } from "./helper";
import chalk from 'chalk';
export class Manager {
    constructor() {
        this.limit = 200;
        this.instantiatedCalled = false;
    }
    static async setup(mongoSetup) {
        let success = true;
        for (const prop in mongoSetup) {
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
                    this._mongoPool[prop] = {
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
    // public abstract instantiated?(): void;
    static getManager(name, managerClass) {
        if (this._singletonPool[name] === undefined) {
            this._singletonPool[name] = new managerClass();
            const ma = this._singletonPool[name];
            ma.collectionName = managerClass.collectionName;
            if (ma.instantiated !== undefined) {
                ma.instantiated();
            }
        }
        return this._singletonPool[name];
    }
    get collection() {
        return this.getCollection(this.collectionName);
    }
    getCollection(name) {
        const collectionName = name || this.collectionName;
        const setupKey = Manager._mongoPool[collectionName] === undefined ? "default" : collectionName;
        const mongoPoolSetup = Manager._mongoPool[setupKey];
        return mongoPoolSetup.db.collection(collectionName);
    }
    getReferenceId(_id) {
        return {
            _id,
            collectionName: this.collectionName
        };
    }
    async find(query) {
        let q = Helper.normalizePage(query);
        const limit = q && q.limit || 100;
        const skip = q && q.skip || 0;
        const isPipelineArray = q && q.query && Array.isArray(q.query) || false;
        const isSimpleQuery = !isPipelineArray && q && q.query !== undefined || false;
        const pipeline = isPipelineArray ? q.query : [];
        const containsSearchText = q && q.search !== undefined || false;
        if (containsSearchText) {
            pipeline.unshift({ $match: { $text: { $search: q.search } } });
        }
        if (isSimpleQuery) {
            pipeline.unshift({ $match: q.query });
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
        let count = 0;
        const counterResult = await queryCount.toArray().catch((e) => {
            console.log(chalk.red(`MongoX: Fail to count items in 'find'.`));
            console.log(chalk.gray(e));
        });
        if (counterResult.length > 0) {
            count = counterResult[0].count; // this should be countDocuments
        }
        const result = Object.assign(q || {}, {
            // error: "false",
            skip,
            limit,
            items,
            count,
            pages: Helper.getPages(limit, count)
        });
        return result;
    }
    async findOne(query) {
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
            };
        }
        else {
            return {
                // query: mergedQuery,
                error: "Not found.",
                type: this.collectionName
            };
        }
    }
    async findOneById(id) {
        if (id === undefined) {
            return {
                error: "Not found!",
                type: this.collectionName
            };
        }
        else {
            return this.findOne({ id: Helper.getObjectId(id) });
        }
    }
    // insert / update --------------------------
    // treatment
    // public async treatment<TIntro>(doc: TIntro): T {
    //   return doc;
    // }
    // insert
    async insertOne(doc) {
        doc._id = typeof doc._id === "string" ? new mongodb.ObjectId(doc._id) : doc._id;
        var r = await this.collection.insertOne(doc).catch((error) => {
            console.log(chalk.red(`MongoX: Fail to insertOne: (${doc._id} )`));
            console.log(chalk.gray(error));
        });
        if (r && r.insertedId) {
            doc._id = r.insertedId.toHexString();
            return doc._id;
        }
        else {
            return undefined;
        }
    }
    async insertMany(docs) {
        var r = await this.collection.insertMany(docs).catch((error) => {
            console.log(chalk.red(`MongoX: Fail to insertMany, (${docs.length} docs)`));
            console.log(chalk.gray(error));
        });
        console.log(r && r.insertedIds);
        return 0;
    }
    // update
    async updateById(id, set) {
        // const realId: ObjectId = Helper.getObjectId(id);// (typeof id === "string" ? new ObjectId(id) : id);
        const realId = (typeof id === "string" ? new mongodb.ObjectId(id) : id);
        // set.$set!._id = realId;
        // console.log("---id", id, set.$set!._id)
        // delete (set.$set! as any)._id; // = realId;
        var r = await this.updateOne({
            _id: realId
        }, set).catch((error) => {
            console.log(chalk.red(`MongoX: Fail to updateById: ${id.toString()}`));
            console.log(chalk.gray(`${JSON.stringify(set)}`));
        });
        return r || 0;
    }
    async updateOne(query, update) {
        var r = await this.collection.updateOne(query, update).catch(error => {
            console.log(chalk.red(`MongoX: Fail to updateOne.`));
            console.log(chalk.gray(`${JSON.stringify(query)}`));
        });
        return r && r.modifiedCount || 0;
    }
    async updateMany(query, doc) {
        var r = await this.collection.updateMany(query, {
            $set: doc
        }).catch(error => {
            console.log(chalk.red(`MongoX: Fail to updateMany.`));
            console.log(chalk.gray(`${JSON.stringify(query)}`));
        });
        return r && r.modifiedCount || 0;
    }
    // save -----------------
    async saveOne(doc) {
        if (doc._id === "" || doc._id === undefined || doc._id === null) {
            const r = await this.insertOne(doc);
            return r;
        }
        else {
            const searchItem = await this.findOneById(doc._id);
            if (searchItem.item === undefined) {
                const r = await this.insertOne(doc);
                return r;
            }
            else {
                const c = await this.updateById(doc._id, { $set: doc });
                return Helper.getStringId(doc._id);
            }
        }
    }
    // remove --------------------------
    async removeEverythingEverythingEverything() {
        const r = await this.collection.remove({}).catch(error => {
            console.log(chalk.red(`MongoX: Fail to removeEverythingEverythingEverything.`));
        });
        return r;
    }
    async remove(doc) {
        if (doc._id !== undefined) {
            return await this.removeById(doc._id);
        }
        return true;
    }
    async removeById(id) {
        const realId = (typeof id === "string" ? new mongodb.ObjectId(id) : id);
        const r = await this.collection.remove({ _id: realId }).catch(error => {
            console.log(chalk.red(`MongoX: Fail to removeById.`));
        });
        return r || undefined;
    }
}
Manager._mongoPool = {};
Manager._singletonPool = {};
export default Manager;
//# sourceMappingURL=manager.js.map