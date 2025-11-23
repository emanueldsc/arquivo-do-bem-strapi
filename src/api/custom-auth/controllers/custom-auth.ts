import { Context } from 'koa';

export default {
    async registerProfessor(ctx: Context) {
        const { username, email, password } = ctx.request.body;

        if (!username || !email || !password) {
            return ctx.badRequest("username, email e password são obrigatórios");
        }

        // 1) Buscar o role "Professor"
        const professorRole = await strapi.db
            .query("plugin::users-permissions.role")
            .findOne({
                where: { name: "Professor" },
            });

        if (!professorRole) {
            return ctx.badRequest('Role "Professor" não encontrada');
        }

        // 2) Verificar se email já existe
        const existingUser = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
                where: { email: email.toLowerCase() },
            });

        if (existingUser) {
            return ctx.badRequest("Já existe um usuário com esse email");
        }

        // 3) Criar o usuário com o service CORRETO (hasheia senha!)
        const user = await strapi
            .plugin("users-permissions")
            .service("user")
            .add({
                username,
                email: email.toLowerCase(),
                password,
                role: professorRole.id,
                confirmed: true,
                provider: "local",
            });

        // 4) Gerar JWT (opcional)
        const jwt = strapi
            .plugin("users-permissions")
            .service("jwt")
            .issue({ id: user.id });

        // 5) Resposta idêntica ao Student
        ctx.body = {
            message: "Usuário professor registrado com sucesso",
            user: {
                username: user.username,
                email: user.email,
                role: professorRole.name,
            },
        };
    }
    ,

    async registerStudent(ctx: Context) {
        const { username, email, password } = ctx.request.body as {
            username: string;
            email: string;
            password: string;
        };

        if (!username || !email || !password) {
            return ctx.badRequest("username, email e password são obrigatórios");
        }

        // 1) Buscar a role "Student"
        const studentRole = await strapi.db
            .query("plugin::users-permissions.role")
            .findOne({
                where: { name: "Student" }, // troque se sua role tiver outro nome
            });

        if (!studentRole) {
            return ctx.badRequest('Role "Student" não encontrada. Crie a role antes.');
        }

        // 2) Verificar se já existe usuário com o email
        const existingUser = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
                where: { email: email.toLowerCase() },
            });

        if (existingUser) {
            return ctx.badRequest("Já existe um usuário com esse email");
        }

        // 3) Criar o usuário usando o service do users-permissions
        const user = await strapi
            .plugin("users-permissions")
            .service("user")
            .add({
                username,
                email: email.toLowerCase(),
                password,
                role: studentRole.id,
                confirmed: true, // opcional: já confirma email
                provider: "local",
            });

        // 4) Gerar JWT
        const jwt = strapi
            .plugin("users-permissions")
            .service("jwt")
            .issue({ id: user.id });

        // 5) Resposta
        ctx.body = {
            message: "Usuário estudante registrado com sucesso",
            user: {
                username: user.username,
                email: user.email,
                role: studentRole.name,
            },
        };
    },

};