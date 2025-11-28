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

// 2) Permissões para Student / Professor
async function ensureRolePermissions(strapi: Core.Strapi) {
  const roleQuery = strapi.db.query("plugin::users-permissions.role");

  const student = await roleQuery.findOne({ where: { name: "Student" } });
  const professor = await roleQuery.findOne({ where: { name: "Professor" } });

  if (!student || !professor) {
    strapi.log.warn(
      "⚠️ Roles Student ou Professor não encontradas ao configurar permissões."
    );
    return;
  }

  //
  // A) Permissões comuns (Student + Professor)
  //
  const actionsToEnableForBoth = [
    "plugin::users-permissions.user.me",
    "plugin::users-permissions.role.find",
    "api::doc.doc.find",
    "api::doc.doc.findOne",
    "api::semester.semester.find",
    "api::semester.semester.findOne",
  ];

  for (const action of actionsToEnableForBoth) {
    await enablePermissionForRole(strapi, student.id, action);
    await enablePermissionForRole(strapi, professor.id, action);
  }

  //
  // B) Professor: TODAS as permissões para
  //    institution, doc, project, publication, semester
  //
  const professorContentTypes = [
    "api::institution.institution",
    "api::doc.doc",
    "api::project.project",
    "api::publication.publication",
    "api::semester.semester",
  ];

  const contentActions = [
    "find",
    "findOne",
    "create",
    "update",
    "delete",
    "publish",
    "unpublish",
  ];

  for (const ct of professorContentTypes) {
    for (const action of contentActions) {
      await enablePermissionForRole(strapi, professor.id, `${ct}.${action}`);
    }
  }

  //
  // C) Professor: Media Library (upload + folders)
  //
  const mediaLibraryActions = [
    // arquivos
    "plugin::upload.content-api.upload",
    "plugin::upload.content-api.update",
    "plugin::upload.content-api.destroy",
    "plugin::upload.content-api.find",
    "plugin::upload.content-api.findOne",
    // pastas
    "plugin::upload.folder.create",
    "plugin::upload.folder.update",
    "plugin::upload.folder.delete",
    "plugin::upload.folder.find",
    "plugin::upload.folder.findOne",
  ];

  for (const action of mediaLibraryActions) {
    await enablePermissionForRole(strapi, professor.id, action);
  }

  strapi.log.info("✅ Permissões de Professor configuradas.");
}

// 3) Public pode acessar endpoints abertos (home, registro, etc.)
async function ensurePublicPermissions(strapi: Core.Strapi) {
  const roleQuery = strapi.db.query("plugin::users-permissions.role");
  const publicRole =
    (await roleQuery.findOne({ where: { type: "public" } })) ||
    (await roleQuery.findOne({ where: { name: "Public" } }));

  if (!publicRole) {
    strapi.log.warn("⚠️ Role Public não encontrada.");
    return;
  }

  const publicActions = [
    // custom-auth para registro
    "api::custom-auth.custom-auth.registerStudent",
    "api::custom-auth.custom-auth.registerProfessor",

    // Docs e semestres
    "api::doc.doc.find",
    "api::doc.doc.findOne",
    "api::semester.semester.find",
    "api::semester.semester.findOne",

    // 👇 NECESSÁRIO PARA HOME SEM LOGIN
    // Institutions
    "api::institution.institution.find",
    "api::institution.institution.findOne",

    // Projects
    "api::project.project.find",
    "api::project.project.findOne",

    // Media Library (somente leitura de arquivos)
    "plugin::upload.content-api.find",
    "plugin::upload.content-api.findOne",
  ];

  for (const action of publicActions) {
    await enablePermissionForRole(strapi, publicRole.id, action);
  }

  strapi.log.info(
    "ℹ️ Permissões públicas configuradas (Home / projetos / instituições / arquivos)."
  );
}
