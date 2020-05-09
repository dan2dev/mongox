import { AuthHelper, AuthRules, JwtPayload } from "./auth";
import { default as express, Response as ExpressResponse } from "express";
import type { Router } from "express";
import { getSessionId, sessionMiddleware } from "./session";
import compression from "compression";
import bodyParser, { raw, text, json, Options, OptionsJson, OptionsText, OptionsUrlencoded, urlencoded } from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

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
      RequestHandler,
      RequestParamHandler,
      RouterOptions,
      Send,
} from "express";
export {
      raw,
      text,
      json,
      Options,
      OptionsJson,
      OptionsText,
      OptionsUrlencoded,
      urlencoded
}
export type {
      Router
}
export {
      // AuthRules,
      compression,
      express,
      bodyParser,
      cookieParser,
}
export {
      sessionMiddleware,
      getSessionId,
      cors
}

// AuthRules
export const secure = AuthRules.Jwt.secure;
export const jwtSign = AuthRules.Jwt.sign;
export type Role = AuthRules.Role;
export type Permission = AuthRules.Permission;
export type RolesPermissions = AuthRules.RolesPermissions;
export const readableRoles = AuthRules.readableRoles;
export const writableRoles = AuthRules.writableRoles;
export const readAndWritableRoles = AuthRules.readAndWritableRoles;

export type Response = import("express").Response;
export type NextFunction = import("express").NextFunction;
type RequestExpress<TParams> = import("express").Request<TParams>;
export type Request<TParams = any, TBody = any> = RequestExpress<TParams> & {
      user: JwtPayload,
      body: TBody
}
