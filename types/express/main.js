import { AuthRules } from "./auth";
import { default as express } from "express";
import { getSessionId, sessionMiddleware } from "./session";
import compression from "compression";
import bodyParser, { raw, text, json, urlencoded } from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
export { raw, text, json, urlencoded };
export { 
// AuthRules,
compression, express, bodyParser, cookieParser, };
export { sessionMiddleware, getSessionId, cors };
// AuthRules
export const secure = AuthRules.Jwt.secure;
export const jwtSign = AuthRules.Jwt.sign;
export const readableRoles = AuthRules.readableRoles;
export const writableRoles = AuthRules.writableRoles;
export const readAndWritableRoles = AuthRules.readAndWritableRoles;
//# sourceMappingURL=main.js.map