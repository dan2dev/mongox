import { default as expressJwt } from "express-jwt";
import jwt from "jsonwebtoken";
/**
 * public = permission to access even without login
 * loggedIn = permission to access areas just with with some identification
 * profile = permission to access your own profile (ex.: my profile)
 * organization = permission to access organization or company area by "organizationId"
 * admin = permission to access admin panels and administration modules
 * superAdmin = permission for everything
 */
import crypto from "crypto";
export var AuthHelper;
(function (AuthHelper) {
    function getJwtSecret() {
        return process.env.JWT_SECRET || "RqTLy4RYhe2CFvBWuz58";
    }
    AuthHelper.getJwtSecret = getJwtSecret;
    function setJwtSecret(secret) {
        this._secret = secret;
    }
    AuthHelper.setJwtSecret = setJwtSecret;
    let Password;
    (function (Password) {
        const salt = process.env.PASSWORD_SALT || "JJYnZy8HPJeKgNmCUF2i";
        function validate(password, hash) {
            const newHash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
            return newHash === hash;
        }
        Password.validate = validate;
        function generateHash(password) {
            return crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
        }
        Password.generateHash = generateHash;
    })(Password = AuthHelper.Password || (AuthHelper.Password = {}));
})(AuthHelper || (AuthHelper = {}));
export var AuthRules;
(function (AuthRules) {
    function readableRoles(rolesPermissions) {
        const roles = [];
        for (const role in rolesPermissions) {
            if (rolesPermissions.hasOwnProperty(role)) {
                const permission = rolesPermissions[role];
                if (permission === "readAndWrite" || permission === "read") {
                    roles.push(role);
                }
            }
        }
        return roles;
    }
    AuthRules.readableRoles = readableRoles;
    function writableRoles(rolesPermissions) {
        const roles = [];
        for (const role in rolesPermissions) {
            if (rolesPermissions.hasOwnProperty(role)) {
                const permission = rolesPermissions[role];
                if (permission === "readAndWrite" || permission === "write") {
                    roles.push(role);
                }
            }
        }
        return roles;
    }
    AuthRules.writableRoles = writableRoles;
    function readAndWritableRoles(rolesPermissions) {
        const roles = [];
        for (const role in rolesPermissions) {
            if (rolesPermissions.hasOwnProperty(role)) {
                const permission = rolesPermissions[role];
                if (permission === "readAndWrite") {
                    roles.push(role);
                }
            }
        }
        return roles;
    }
    AuthRules.readAndWritableRoles = readAndWritableRoles;
    let Jwt;
    (function (Jwt) {
        function sign(payload) {
            return jwt.sign(payload, AuthHelper.getJwtSecret(), { expiresIn: "365 days" });
        }
        Jwt.sign = sign;
        // TODO: create logic for permission by userId and organizationId
        // export function secure(roles: role[] | role, organizationId?: string): RequestHandlerParams;
        function secure(roles = [], organizationId) {
            if (typeof roles === "string") {
                roles = [roles];
            }
            if (roles.length > 0 && roles[0] === "public") {
                return (req, res, next) => {
                    next();
                };
            }
            return [
                expressJwt({ secret: AuthHelper.getJwtSecret() }),
                (req, res, next) => {
                    let authorized = false;
                    if (req.user && roles.indexOf("loggedIn") > -1) {
                        authorized = true;
                    }
                    else if (req.user) {
                        for (let i = 0; !authorized && i < roles.length; i++) {
                            const role = roles[i];
                            authorized = req.user.roles.includes(role);
                        }
                    }
                    // send back
                    if (!authorized) {
                        res.status(401).json({ error: "Unauthorized" });
                    }
                    else {
                        next();
                    }
                }
            ];
        }
        Jwt.secure = secure;
    })(Jwt = AuthRules.Jwt || (AuthRules.Jwt = {}));
})(AuthRules || (AuthRules = {}));
export default AuthRules;
//# sourceMappingURL=auth.js.map