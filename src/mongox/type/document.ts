declare module MongoXType {
  export type Id = import("bson").ObjectId | string;
  export interface Document {
    // [key: string]: any;
    _id?: Id;
  }
}
