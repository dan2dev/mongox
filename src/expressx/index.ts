// export { default as express } from "express";
import { default as express, Application } from "express";
import { relative, resolve } from "path";
import { AuthRules } from "./auth/auth-rules"
import compression from "compression";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import multer from "multer";

import { EnvHelper } from "./helper/env-helper";

const paths: string[] = ["development"];
if (process.env.NODE_ENV === "production" || process.env.mode === "productions") {
  paths.push("production");
}
paths.forEach(path => {
  EnvHelper.config({
    path: `_${path}.env`
  });
});

// this is mostly for type fixing
export {
  Application,
  CookieOptions,
  Errback,
  ErrorRequestHandler,
  Express,
  Handler,
  IRoute,
  IRouter,
  IRouterHandler,
  IRouterMatcher,
  MediaType,
  NextFunction,
  // Request,
  RequestHandler,
  RequestParamHandler,

  // Response,
  Router,
  RouterOptions,
  Send,
  application,
  json,
  raw,
  request,
  response,
  static,
  text,
  urlencoded,
} from "express";
// const app: Application = express();
// app.use(express.json());
// app.use(compression());

export {
  // AuthRules,
  compression,
  express,
  bodyParser,
  cookieParser,
  multer,
  // app,
};

// AuthRules
export const secure = AuthRules.Jwt.secure;
// export const setJwtSecret = Auth.Jwt.setJwtSecret;
// export const Password = Auth.Password;
export const jwtSign = AuthRules.Jwt.sign;
// export const jwt = AuthRules.Jwt;
export type Role = AuthRules.Role;
export type Permission = AuthRules.Permission;
export type RolesPermissions = AuthRules.RolesPermissions;
export const readableRoles = AuthRules.readableRoles;
export const writableRoles = AuthRules.writableRoles;
export const readAndWritableRoles = AuthRules.readAndWritableRoles;

export type Response = import("express").Response;
export type Request = import("express").Request & { user: ExpressXType.JwtPayload };
