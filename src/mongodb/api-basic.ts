import type { Request, Response, readableRoles, writableRoles, RolesPermissions } from "../express/main";
import type { Router } from "express";
import { AuthRules } from "../express/auth";
import { Manager } from "./manager";
// declare type Router = any;
const secure = AuthRules.Jwt.secure;
export module Api {
  export type Options<T> = {
    router: Router;
    permissions?: RolesPermissions;
    managerType: { sharedInstance: Manager<T> };
    limit?: number;
  }
  export function setBasicBread<T>(options: Options<T>) {
    // the sharedInstance should be read only inside the express request
    const router: Router = options.router;
    options.permissions = options.permissions || {
      public: "read",
      admin: "readAndWrite"
    }
    // Browse
    router.get("/", () => { }, () => { })
    router.get('/',
      secure(AuthRules.readableRoles(options.permissions)),
      async (req: Request, res: Response) => {
        const manager = options.managerType.sharedInstance;
        const page: number = Number(req.query["p"] || req.query["page"] || 1);
        const search1: string | undefined = req.query["q"] as string || req.query["query"] as string;
        const limit: string | number = req.query["l"] as string || req.query["limit"] as string || options.limit || 100;
        const result = await manager.find({
          page,
          search: search1 || undefined,
          limit: Number(limit) // options.limit || 100
        });
        res.send(result);
      });
    // Read
    router.get('/:id',
      secure(AuthRules.readableRoles(options.permissions)),
      async (req: Request, res: Response) => {
        const manager = options.managerType.sharedInstance;
        const result = await manager.findOneById(req.param("id"));

        res.send(result);
      });
    // remove
    router.delete("/:id",
      secure(AuthRules.writableRoles(options.permissions)),
      async (req: Request, res: Response) => {
        const manager = options.managerType.sharedInstance;
        const result = await manager.removeById(req.params.id);
        res.send(result);
      });
    // save
    router.post("/save",
      secure(AuthRules.writableRoles(options.permissions)),
      async (req: Request, res: Response) => {
        const manager = options.managerType.sharedInstance;
        const doc = req.body as T;
        const result = await manager.saveOne(doc);
        res.send(result);
      });
  }
}
export default Api;
