import type { Core } from "@strapi/strapi";
import { ensurePublicPermissions } from "./permissions/public";
import { ensureStudentAndProfessorPermissions } from "./permissions/student-professor";
import { ensureDefaultRoles } from "./roles/default";

/**
 * Função principal que orquestra a execução da criação de Roles (papéis)
 * e o vínculo das permissões assim que a aplicação sobe (fase de bootstrap).
 */
export async function setupRolesAndPermissions(strapi: Core.Strapi) {
  try {
    strapi.log.info("⏳ Iniciando a configuração de papéis e permissões...");

    // 1) Cria os papéis que ainda não existem
    await ensureDefaultRoles(strapi);

    // 2) Atribui as permissões do Aluno e Professor
    await ensureStudentAndProfessorPermissions(strapi);

    // 3) Atribui as permissões de rotas públicas
    await ensurePublicPermissions(strapi);

    strapi.log.info("🚀 Todas as roles e permissões foram inicializadas com sucesso!");
  } catch (error) {
    strapi.log.error("💥 Ocorreu um erro ao configurar roles e permissões: ", error);
  }
}
