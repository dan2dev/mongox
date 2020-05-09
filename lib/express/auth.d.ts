export declare type JwtPayload = {
    sub: string;
    iat: number;
    email: string;
    username: string;
    userId: string;
    roles: string[];
    name: string;
    organizationIds: string[];
};
export declare module AuthHelper {
    function getJwtSecret(): string;
    function setJwtSecret(secret: string): void;
    module Password {
        function validate(password: string, hash: string): boolean;
        function generateHash(password: string): string;
    }
}
export declare module AuthRules {
    type Role = "public" | "loggedIn" | "profile" | "organization" | "admin" | "superAdmin";
    type Permission = "read" | "write" | "readAndWrite";
    type RolesPermissions = {
        public?: Permission;
        loggedIn?: Permission;
        profile?: Permission;
        organization?: Permission;
        admin?: Permission;
        superAdmin?: Permission;
    };
    function readableRoles(rolesPermissions: RolesPermissions): Role[];
    function writableRoles(rolesPermissions: RolesPermissions): Role[];
    function readAndWritableRoles(rolesPermissions: RolesPermissions): Role[];
    module Jwt {
        type Payload = {
            [key: string]: string | number | undefined | string[] | number[];
            sub: string;
            email?: string;
            phone?: string;
            fistName: string;
            lastName?: string;
            roles: string[];
        };
        function sign(payload: Payload): string;
        function secure(roles?: Role[] | Role, organizationId?: string): any[] | ((req: any, res: any, next: any) => void);
    }
}
export default AuthRules;
