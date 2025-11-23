
export default {
    routes: [
        {
            method: 'POST',
            path: '/custom-auth/register-professor',
            handler: 'custom-auth.registerProfessor',
            config: {
                auth: false, // permitir sem login
            },
        },
        {
            method: "POST",
            path: "/custom-auth/register-student",
            handler: "custom-auth.registerStudent",
            config: {
                auth: false, // permite sem login
            },
        },
    ]
}