import type { Core } from "@strapi/strapi";
import { enablePermissionForRole } from "../utils";

/**
 * Configura as permissões específicas e compartilhadas dos papéis "Student" e "Professor".
 */
export async function ensureStudentAndProfessorPermissions(strapi: Core.Strapi) {
  const roleQuery = strapi.db.query("plugin::users-permissions.role");

  const student = await roleQuery.findOne({ where: { name: "Student" } });
  const professor = await roleQuery.findOne({ where: { name: "Professor" } });

  if (!student || !professor) {
    strapi.log.warn(
      "⚠️ Roles Student ou Professor não encontradas ao configurar permissões."
    );
    return;
  }

  // A) Permissões comuns (Student + Professor)
  const actionsToEnableForBoth = [
    "plugin::users-permissions.user.me",
    "plugin::users-permissions.user.update",
    "plugin::users-permissions.role.find",
    "api::doc.doc.find",
    "api::doc.doc.findOne",
    "api::semester.semester.find",
    "api::semester.semester.findOne",
    "api::institution.institution.find",
    "api::institution.institution.findOne",
    "api::project.project.find",
    "api::project.project.findOne",
    "api::publication.publication.create",
    "api::publication.publication.update",
    "api::publication.publication.delete",
    "api::publication.publication.find",
    "api::publication.publication.findOne",
    "plugin::upload.content-api.upload",
    "plugin::upload.content-api.find",
    "plugin::upload.content-api.findOne",
  ];

  for (const action of actionsToEnableForBoth) {
    await enablePermissionForRole(strapi, student.id, action);
    await enablePermissionForRole(strapi, professor.id, action);
  }

  // B) Professor: TODAS as permissões de manipulação de conteúdo
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

  // C) Professor: Media Library (upload + folders)
  const mediaLibraryActions = [
    "plugin::upload.content-api.upload",
    "plugin::upload.content-api.update",
    "plugin::upload.content-api.destroy",
    "plugin::upload.content-api.find",
    "plugin::upload.content-api.findOne",
    "plugin::upload.folder.create",
    "plugin::upload.folder.update",
    "plugin::upload.folder.delete",
    "plugin::upload.folder.find",
    "plugin::upload.folder.findOne",
  ];

  for (const action of mediaLibraryActions) {
    await enablePermissionForRole(strapi, professor.id, action);
  }

  strapi.log.info("✅ Permissões de Professor e Student configuradas.");
}
