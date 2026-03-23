import type { Core } from "@strapi/strapi";

/**
 * Cria os papéis (Roles) padrão do sistema ("Student" e "Professor") se eles ainda não existirem no banco de dados.
 */
export async function ensureDefaultRoles(strapi: Core.Strapi) {
  const roleQuery = strapi.db.query("plugin::users-permissions.role");

  const roles = [
    {
      name: "Student",
      description:
        "Usuário aluno que pode criar publicações e acessar documentos do projeto.",
      type: "student",
    },
    {
      name: "Professor",
      description:
        "Usuário professor responsável por criar instituições, projetos e moderar publicações.",
      type: "professor",
    },
  ];

  for (const role of roles) {
    const exists = await roleQuery.findOne({ where: { name: role.name } });

    if (!exists) {
      await roleQuery.create({ data: role });
      strapi.log.info(`✅ Role criada: ${role.name}`);
    } else {
      strapi.log.info(`ℹ️ Role já existe: ${role.name}`);
    }
  }
}
