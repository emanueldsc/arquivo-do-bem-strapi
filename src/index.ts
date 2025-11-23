import type { Core } from "@strapi/strapi";

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureDefaultRoles(strapi);
    await ensureRolePermissions(strapi);
    await ensurePublicPermissions(strapi);
  },
};

// 1) Cria roles Student e Professor se não existirem
async function ensureDefaultRoles(strapi: Core.Strapi) {
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

// helpers de upsert
async function enablePermissionForRole(
  strapi: Core.Strapi,
  roleId: number,
  action: string
) {
  const permQuery = strapi.db.query(
    "plugin::users-permissions.permission"
  );

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

// 2) Student/Professor com me + role.find
async function ensureRolePermissions(strapi: Core.Strapi) {
  const roleQuery = strapi.db.query("plugin::users-permissions.role");

  const student = await roleQuery.findOne({ where: { name: "Student" } });
  const professor = await roleQuery.findOne({ where: { name: "Professor" } });

  if (!student || !professor) return;

  const actionsToEnable = [
    "plugin::users-permissions.user.me",
    "plugin::users-permissions.role.find",
  ];

  for (const action of actionsToEnable) {
    await enablePermissionForRole(strapi, student.id, action);
    await enablePermissionForRole(strapi, professor.id, action);
  }
}

// 3) Public pode acessar registerStudent/registerProfessor (custom-auth)
async function ensurePublicPermissions(strapi: Core.Strapi) {
  const roleQuery = strapi.db.query("plugin::users-permissions.role");
  const publicRole =
    (await roleQuery.findOne({ where: { type: "public" } })) ||
    (await roleQuery.findOne({ where: { name: "Public" } }));

  if (!publicRole) {
    strapi.log.warn("⚠️ Role Public não encontrada.");
    return;
  }

  /**
   * UIDs de actions para Content API custom:
   * formato: api::<api-name>.<controller-name>.<action>
   *
   * No seu caso:
   * api::custom-auth.custom-auth.registerStudent
   * api::custom-auth.custom-auth.registerProfessor
   */
  const publicActions = [
    "api::custom-auth.custom-auth.registerStudent",
    "api::custom-auth.custom-auth.registerProfessor",
  ];

  for (const action of publicActions) {
    await enablePermissionForRole(strapi, publicRole.id, action);
  }

  // log útil pra conferir UIDs reais do Strapi
  strapi.log.info(
    "ℹ️ Se alguma permissão não for encontrada, confira o UID real em Settings > Roles."
  );
}
