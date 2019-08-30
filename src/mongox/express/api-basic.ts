import { Router, Request, Response, secure, readableRoles, writableRoles, RolesPermissions } from "../../expressx";
import { Manager } from "../src/manager";

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
    router.get('/browse',
      secure(readableRoles(options.permissions)),
      async (req: Request, res: Response) => {
        const manager = options.managerType.sharedInstance;
        const page: number = req.query["p"] || 1;
        const search1: string | undefined = req.query["q"]
        const result = await manager.find({
          page,
          search: search1 || undefined,
          limit: options.limit || 100
        })
        res.send(result);
      });

    // Read
    router.get('/:id',
      secure(readableRoles(options.permissions)),
      async (req: Request, res: Response) => {
        const manager = options.managerType.sharedInstance;
        const result = await manager.findOneById(req.param("id"));
        res.send(result);
      });

    // remove
    router.delete("/:id",
      secure(writableRoles(options.permissions)),
      async (req: Request, res: Response) => {
        const manager = options.managerType.sharedInstance;
        const result = await manager.removeById(req.params.id);
        res.send(result);
      });

    // save
    router.post("/save",
      secure(writableRoles(options.permissions)),
      async (req: Request, res: Response) => {
        const manager = options.managerType.sharedInstance;
        const doc = req.body as T;
        const result = await manager.saveOne(doc);
        res.send(result);
      });

  }
}
export default Api;

