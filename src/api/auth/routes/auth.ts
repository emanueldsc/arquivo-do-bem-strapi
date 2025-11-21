
export default {
    routes: [
        {
            method: 'POST',
            path: '/auth/register-professor',
            handler: 'auth.registerProfessor',
            config: {
                auth: false, // permitir sem login
            },
        }
    ]
}