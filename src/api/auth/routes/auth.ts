
export default {
    routes: [
        {
            method: 'POST',
            path: '/auth/register-professor',
            handler: 'auth.registerProfessor',
            config: {
                auth: false, // permitir sem login
            },
        },
        {
            method: "POST",
            path: "/auth/register-student",
            handler: "auth.registerStudent",
            config: {
                auth: false, // permite sem login
            },
        },
    ]
}