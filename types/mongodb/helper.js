import { ObjectId } from "bson";
export var Helper;
(function (Helper) {
    function createId(id) {
        // new ObjectId("0000-0000-00").toHexString(),
        const str = id.toString().padStart(12, "0");
        return new ObjectId(str);
    }
    Helper.createId = createId;
    function normalizePage(query, limit = 100) {
        const newQuery = (() => {
            if (query) {
                query.limit = query.limit || limit;
                query.page = Number(query.page && query.page > 0 ? query.page : 1);
                return query;
            }
            else {
                return {
                    limit: limit,
                    page: 1,
                    skip: 0
                };
            }
        })();
        if (newQuery.skip !== undefined && newQuery.limit !== undefined &&
            newQuery.skip > -1 && newQuery.limit > -1) {
            newQuery.page = Math.floor((newQuery.skip / newQuery.limit)) + 1;
        }
        else if (newQuery.page !== undefined && newQuery.limit !== undefined) {
            newQuery.skip = Number(newQuery.limit) * Number(newQuery.page - 1);
        }
        return newQuery;
    }
    Helper.normalizePage = normalizePage;
    function getPages(limit, count) {
        const pages = [];
        for (let i = 1; i < Math.ceil(count / limit) + 1; i++) {
            pages.push(i);
        }
        return pages;
    }
    Helper.getPages = getPages;
    function getObjectId(id) {
        return (typeof id === "string" ? new ObjectId(id) : id);
    }
    Helper.getObjectId = getObjectId;
    function getStringId(id) {
        return (typeof id === "string" ? id : id.toHexString());
    }
    Helper.getStringId = getStringId;
    function removeIds___discontinued(documents) {
        return (Array.isArray(documents) ? documents : [documents]).map(item => {
            delete item._id;
            return item;
        });
    }
    Helper.removeIds___discontinued = removeIds___discontinued;
})(Helper || (Helper = {}));
export default Helper;
//# sourceMappingURL=helper.js.map