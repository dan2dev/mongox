import type { RolesPermissions } from "../express/main";
import type { Router } from "express";
import { Manager } from "./manager";
export declare module Api {
    type Options<T> = {
        router: Router;
        permissions?: RolesPermissions;
        managerType: {
            sharedInstance: Manager<T>;
        };
        limit?: number;
    };
    function setBasicBread<T>(options: Options<T>): void;
}
export default Api;
