import Query from "./query";
import { ObjectId } from "bson";
import { MongoX } from '../types/mongox';

export namespace Helper {
  export function createId(id: number): ObjectId {
    // new ObjectId("0000-0000-00").toHexString(),
    const str = id.toString().padStart(12, "0");
    return new ObjectId(str);
  }
  export function normalizePage<T>(query?: Query.QueryList<T>, limit: number = 100): Query.QueryList<T> {
    const newQuery = (() => {
      if (query) {
        query.limit = query.limit || limit;
        query.page = Number(query.page && query.page > 0 ? query.page : 1);
        return query;
      } else {
        return {
          limit: limit,
          page: 1,
          skip: 0
        } as Query.QueryList<T>;
      }
    })() as Query.QueryList<T>;
    if (newQuery.skip !== undefined && newQuery.limit !== undefined &&
      newQuery.skip > -1 && newQuery.limit > -1
    ) {
      newQuery.page = Math.floor((newQuery.skip / newQuery.limit)) + 1;
    } else if (newQuery.page !== undefined && newQuery.limit !== undefined) {
      newQuery.skip = Number(newQuery.limit) * Number(newQuery.page - 1);
    }
    return newQuery;
  }
  export function getPages(limit: number, count: number): number[] {
    const pages: number[] = [];
    for (let i = 1; i < Math.ceil(count / limit) + 1; i++) {
      pages.push(i);
    }
    return pages;
  }
  export function getObjectId(id: string | ObjectId): ObjectId {
    return (typeof id === "string" ? new ObjectId(id) : id);
  }
  export function getStringId(id: string | ObjectId): string {
    return (typeof id === "string" ? id : id.toHexString());
  }


  export function removeIds___discontinued<T extends MongoX.Document>(documents: T | T[]) {
    return (Array.isArray(documents) ? documents : [documents]).map(item => {
      delete item._id;
      return item;
    });
  }
}
export default Helper;

