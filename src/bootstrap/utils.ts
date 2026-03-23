import type { Core } from "@strapi/strapi";

/**
 * Utilitário responsável por habilitar uma ação/permissão específica para uma determinada "Role" (Papel).
 * Ele checa se a permissão já existe e a atualiza, ou cria uma nova caso não exista.
 */
export async function enablePermissionForRole(
  strapi: Core.Strapi,
  roleId: number,
  action: string
) {
  const permQuery = strapi.db.query("plugin::users-permissions.permission");

  const existing = await permQuery.findOne({
    where: { role: roleId, action },
  });

  if (!existing) {
    await permQuery.create({
      data: { role: roleId, action, enabled: true },
    });
    strapi.log.info(`✅ Permissão criada: ${action} (role ${roleId})`);
  } else if (!existing.enabled) {
    await permQuery.update({
      where: { id: existing.id },
      data: { enabled: true },
    });
    strapi.log.info(`🔓 Permissão ativada: ${action} (role ${roleId})`);
  }
}
