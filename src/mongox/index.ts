import helper from "./src/helper";
import manager from "./src/manager";
import query from "./src/query";
import api from "./express/api-basic";

export {
  ObjectId
} from "bson"
// import  from "./ttts";
// declare type MongoX = MongoX2;
export module MongoX {
  // export type SuperResult = MongoXExt.SuperResult;
  export const Query = query;
  export const Helper = helper;
  export const Manager = manager;
  export const Api = api;
}

export default MongoX;

