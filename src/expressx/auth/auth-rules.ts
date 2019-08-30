import { Response, Request, NextFunction } from "@expressx";
import { default as expressJwt, RequestHandler, GetTokenCallback } from "express-jwt";
import { AuthHelper } from "../../helper/node/auth-helper";
import jwt from "jsonwebtoken";
import { RequestHandlerParams } from "express-serve-static-core";


/**
 * public = permission to access even without login
 * loggedIn = permission to access areas just with with some identification
 * profile = permission to access your own profile (ex.: my profile)
 * organization = permission to access organization or company area by "organizationId"
 * admin = permission to access admin panels and administration modules
 * superAdmin = permission for everything
 */

export module AuthRules {
  export type Role = "public" | "loggedIn" | "profile" | "organization" | "admin" | "superAdmin";
  export type Permission = "read" | "write" | "readAndWrite";
  export type RolesPermissions = {
    // [role: string]: Permission | undefined;
    public?: Permission;
    loggedIn?: Permission;
    profile?: Permission;
    organization?: Permission;
    admin?: Permission;
    superAdmin?: Permission;
  }

  export function readableRoles(rolesPermissions: RolesPermissions) {
    const roles: Role[] = [];
    for (const role in rolesPermissions) {
      if (rolesPermissions.hasOwnProperty(role)) {
        const permission: Permission | undefined = (rolesPermissions as { [role: string]: Permission })[role];
        if (permission === "readAndWrite" || permission === "read") {
          roles.push(role as Role);
        }
      }
    }
    return roles;
  }

  export function writableRoles(rolesPermissions: RolesPermissions) {
    const roles: Role[] = [];
    for (const role in rolesPermissions) {
      if (rolesPermissions.hasOwnProperty(role)) {
        const permission: Permission | undefined = (rolesPermissions as { [role: string]: Permission })[role];
        if (permission === "readAndWrite" || permission === "write") {
          roles.push(role as Role);
        }
      }
    }
    return roles;
  }

  export function readAndWritableRoles(rolesPermissions: RolesPermissions) {
    const roles: Role[] = [];
    for (const role in rolesPermissions) {
      if (rolesPermissions.hasOwnProperty(role)) {
        const permission: Permission | undefined = (rolesPermissions as { [role: string]: Permission })[role];
        if (permission === "readAndWrite") {
          roles.push(role as Role);
        }
      }
    }
    return roles;
  }

  export module Jwt {
    export type Payload = {
      [key: string]: string | number | undefined | string[] | number[];
      sub: string;
      email?: string;
      phone?: string;
      fistName: string;
      lastName?: string;
      roles: string[];
    };
    export function sign(payload: Payload): string {
      return jwt.sign(payload, AuthHelper.getJwtSecret(), { expiresIn: "365 days" });
    }
    // TODO: create logic for permission by userId and organizationId
    // export function secure(roles: role[] | role, organizationId?: string): RequestHandlerParams;
    export function secure(roles: Role[] | Role = [], organizationId?: string): RequestHandlerParams {
      if (typeof roles === "string") {
        roles = [roles];
      }
      if (roles.length > 0 && roles[0] === "public") {
        return (req: Request, res: Response, next: NextFunction) => {
          next();
        }
      }
      return [
        expressJwt({ secret: AuthHelper.getJwtSecret() }),
        (req: Request, res: Response, next: NextFunction) => {
          let authorized = false;
          if (req.user && roles.indexOf("loggedIn") > -1) {
            authorized = true;
          } else if (req.user) {
            for (let i = 0; !authorized && i < roles.length; i++) {
              const role = roles[i];
              authorized = req.user.roles.includes(role);
            }
          }
          // send back
          if (!authorized) {
            res.status(401).json({ error: "Unauthorized" });
          } else {
            next();
          }
        }
      ];
    }
  }
}

export default AuthRules;
