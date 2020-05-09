import { AuthRules } from "../express/auth";
// declare type Router = any;
const secure = AuthRules.Jwt.secure;
export var Api;
(function (Api) {
    function setBasicBread(options) {
        // the sharedInstance should be read only inside the express request
        const router = options.router;
        options.permissions = options.permissions || {
            public: "read",
            admin: "readAndWrite"
        };
        // Browse
        router.get("/", () => { }, () => { });
        router.get('/', secure(AuthRules.readableRoles(options.permissions)), async (req, res) => {
            const manager = options.managerType.sharedInstance;
            const page = Number(req.query["p"] || req.query["page"] || 1);
            const search1 = req.query["q"] || req.query["query"];
            const limit = req.query["l"] || req.query["limit"] || options.limit || 100;
            const result = await manager.find({
                page,
                search: search1 || undefined,
                limit: Number(limit) // options.limit || 100
            });
            res.send(result);
        });
        // Read
        router.get('/:id', secure(AuthRules.readableRoles(options.permissions)), async (req, res) => {
            const manager = options.managerType.sharedInstance;
            const result = await manager.findOneById(req.param("id"));
            res.send(result);
        });
        // remove
        router.delete("/:id", secure(AuthRules.writableRoles(options.permissions)), async (req, res) => {
            const manager = options.managerType.sharedInstance;
            const result = await manager.removeById(req.params.id);
            res.send(result);
        });
        // save
        router.post("/save", secure(AuthRules.writableRoles(options.permissions)), async (req, res) => {
            const manager = options.managerType.sharedInstance;
            const doc = req.body;
            const result = await manager.saveOne(doc);
            res.send(result);
        });
    }
    Api.setBasicBread = setBasicBread;
})(Api || (Api = {}));
export default Api;
//# sourceMappingURL=api-basic.js.map