import type { Core } from "@strapi/strapi";
import { enablePermissionForRole } from "../utils";

/**
 * Configura as permissões para o público geral (visitantes não logados).
 * Define métodos de leitura públicos e rotas de registro aberto.
 */
export async function ensurePublicPermissions(strapi: Core.Strapi) {
  const roleQuery = strapi.db.query("plugin::users-permissions.role");
  const publicRole =
    (await roleQuery.findOne({ where: { type: "public" } })) ||
    (await roleQuery.findOne({ where: { name: "Public" } }));

  if (!publicRole) {
    strapi.log.warn("⚠️ Role Public não encontrada.");
    return;
  }

  // Content-types que o público pode LER (Acesso livre)
  const publicReadableContentTypes = [
    "api::institution.institution",
    "api::project.project",
    "api::semester.semester",
    "api::doc.doc",
  ];

  for (const ct of publicReadableContentTypes) {
    await enablePermissionForRole(strapi, publicRole.id, `${ct}.find`);
    await enablePermissionForRole(strapi, publicRole.id, `${ct}.findOne`);
  }

  // Endpoints customizados de registro (criação de conta)
  const publicCustomAuthActions = [
    "api::custom-auth.custom-auth.registerStudent",
    "api::custom-auth.custom-auth.registerProfessor",
  ];

  for (const action of publicCustomAuthActions) {
    await enablePermissionForRole(strapi, publicRole.id, action);
  }

  // Media Library (somente leitura de imagens/arquivos pela API para visitantes)
  const publicUploadReadActions = [
    "plugin::upload.content-api.find", // GET /api/upload/files
    "plugin::upload.content-api.findOne", // GET /api/upload/files/:id
  ];

  for (const action of publicUploadReadActions) {
    await enablePermissionForRole(strapi, publicRole.id, action);
  }

  strapi.log.info(
    "ℹ️ Permissões públicas configuradas (Home / projetos / instituições / semestres / docs / arquivos)."
  );
}
