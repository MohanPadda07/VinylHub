export type AppRole = "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";

const moderatorRoles: AppRole[] = ["MODERATOR", "ADMIN", "SUPER_ADMIN"];
const adminRoles: AppRole[] = ["ADMIN", "SUPER_ADMIN"];

export function canModerate(role: AppRole) {
  return moderatorRoles.includes(role);
}

export function canManageCatalog(role: AppRole) {
  return adminRoles.includes(role);
}

export function canEditOwnedResource(currentUserId: string, ownerId: string) {
  return currentUserId === ownerId;
}
