import type { Core } from "@strapi/strapi";
import { setupRolesAndPermissions } from "./bootstrap";

export default {
  /**
   * Função executada antes de a aplicação Node.js ser inicializada por completo.
   * Utilizada para registrar plugins ou modificar o comportamento base do Strapi.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * Função executada logo após a inicialização da aplicação, mas antes do servidor aceitar conexões.
   * Ideal para rodar scripts que preenchem o banco de dados e inicializam roles/permissões necessárias.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Configura todas as permissões iniciais do sistema separadas por módulo
    await setupRolesAndPermissions(strapi);
  },
};
