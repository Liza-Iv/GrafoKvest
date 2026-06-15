const AuthService = {
    TOKEN_KEY: 'authToken',
    USER_KEY: 'userData',

    login: function(email, password) {
        var self = this;
        return fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        })
        .then(function(res) {
            if (!res.ok) {
                return res.json().then(function(err) {
                    throw new Error(err.error || 'Неверный email или пароль');
                });
            }
            return res.json();
        })
        .then(function(data) {
            self.setSession(data.token, data.user);

            // ✅ Загрузить детей из БД
            return fetch('/api/profile', {
                headers: { 'Authorization': 'Bearer ' + data.token }
            })
            .then(function(res) { return res.json(); })
            .then(function(profile) {
                if (profile.children && profile.children.length > 0) {
                    localStorage.setItem('profileChildren', JSON.stringify(profile.children));
                    localStorage.setItem('activeChildIndex', '0');
                    localStorage.setItem('parentName', profile.parentName || data.user.parentName);
                }
                return data.user;
            });
        });
    },

    register: function(userData) {
        var self = this;
        return fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                parentName: userData.parentName,
                email: userData.email,
                password: userData.password,
                role: userData.role || 'parent',
                childName: userData.childName || null
            })
        })
        .then(function(res) {
            if (!res.ok) {
                return res.json().then(function(err) {
                    throw new Error(err.error || 'Ошибка регистрации');
                });
            }
            return res.json();
        })
        .then(function(data) {
            self.setSession('mock-jwt-token-' + Date.now(), {
                parentName: userData.parentName,
                email: userData.email,
                role: userData.role || 'parent',
                childName: userData.childName || null
            });
            return data;
        });
    },

    setSession: function(token, user) {
        localStorage.setItem(this.TOKEN_KEY, token);
        if (user) localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    },

    isAuthenticated: function() {
        return !!localStorage.getItem(this.TOKEN_KEY);
    },

    getToken: function() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    getUser: function() {
        try {
            var raw = localStorage.getItem(this.USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch(e) { return null; }
    },

    logout: function() {
        if (typeof TimerService !== 'undefined') {
            TimerService.stop();
            TimerService.saveState();
        }
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        window.location.href = '/index.html';
    }
};