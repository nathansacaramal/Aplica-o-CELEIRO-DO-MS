export const UserRoles = ["Admin"] as const;
export type UserRole = (typeof UserRoles)[number];
export enum UserRoleEnumLiteral {
  Admin = "Admin",
}
export const UserRoleEnum = {
  Admin: "Admin",
} as const satisfies Record<string, UserRole>;
