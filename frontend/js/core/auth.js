const AuthService = {
    TOKEN_KEY: 'authToken',
    USER_KEY: 'userData',

    async login(email, password) {
        try {
            const data = await api.login(email, password);
            this.setSession(data.token, data.user);
            return data.user;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    async register(userData) {
        try {
            const data = await api.register(userData);
            // ✅ Сохраняем данные пользователя при регистрации
            this.setSession(
                'mock-jwt-token-' + Date.now(),
                {
                    parentName: userData.parentName,
                    email: userData.email,
                    role: userData.role || 'parent',
                }
            );
            return data;
        } catch (error) {
            console.error('Register failed:', error);
            throw error;
        }
    },

    setSession(token, user) {
        localStorage.setItem(this.TOKEN_KEY, token);
        if (user) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
    },

    isAuthenticated() {
        return !!localStorage.getItem(this.TOKEN_KEY);
    },

    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    getUser() {
        const raw = localStorage.getItem(this.USER_KEY);
        return raw ? JSON.parse(raw) : null;
    },

    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        window.location.href = '/index.html';
    },
};