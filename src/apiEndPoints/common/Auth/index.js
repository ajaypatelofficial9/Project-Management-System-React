const AuthEndpoints = {
    Login: (bodyData) => {
        return {
            url: "/signin",
            method: "POST",
            bodyData,
        };
    },
    SignUp: (bodyData) => {
        return {
            url: "/signup",
            method: "POST",
            bodyData,
        };
    },
    ProfileUpdate: (bodyData) => {
        return {
            url: "/user-update",
            method: "POST",
            bodyData,
        };
    },
    ResetPassword: (bodyData) => {
        return {
            url: "/reset-password",
            method: "POST",
            bodyData,
        };
    }
}

export default AuthEndpoints;