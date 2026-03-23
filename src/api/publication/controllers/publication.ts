/**
 * publication controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::publication.publication', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    
    // Prevent ValidationError by stripping the restricted relation
    if (ctx.request.body?.data?.student_author) {
      delete ctx.request.body.data.student_author;
    }

    // Call standard Strapi core logic
    const response = await super.create(ctx);

    // Securely tie the publication to the authenticated user internally
    if (user && response?.data?.documentId) {
      await strapi.documents('api::publication.publication').update({
        documentId: response.data.documentId,
        data: {
          student_author: user.documentId || user.id,
        },
      });
    }

    return response;
  },

  async update(ctx) {
    // Prevent ValidationError on edit
    if (ctx.request.body?.data?.student_author) {
      delete ctx.request.body.data.student_author;
    }
    return super.update(ctx);
  }
}));
