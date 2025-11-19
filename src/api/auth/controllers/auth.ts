import { Context } from 'koa';

export default {
    async registerProfessor(ctx: Context) {
        const { username, email, password } = ctx.request.body as {
            username: string;
            email: string;
            password: string;
        };

        if (!username || !email || !password) {
            return ctx.badRequest("username, email e password são obrigatórios");
        }

        // Buscar o role "Professor"
        const professorRole = await strapi.entityService.findMany(
            "plugin::users-permissions.role",
            {
                filters: { name: "Professor" },
                limit: 1,
            }
        );

        const role = professorRole?.[0];
        if (!role) {
            return ctx.badRequest("Role Professor não encontrado");
        }

        // Criar o usuário com o role Professor
        const user = await strapi.entityService.create(
            "plugin::users-permissions.user",
            {
                data: {
                    username,
                    email,
                    password,
                    confirmed: true,
                    role: role.id,
                },
            }
        );

        // Gerar o token JWT
        const jwt = await strapi
            .plugin("users-permissions")
            .service("jwt")
            .issue({ id: user.id });


        ctx.body = {
            jwt,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: role.name,
            },
        };

    }

};