/**
 * Логика страницы приветствия (index.html).
 */
(function () {
    'use strict';

    // ==================== DOM-ЭЛЕМЕНТЫ ====================
    const authDialog = document.getElementById('authDialog');
    const startBtn = document.getElementById('startBtn');
    const settingsBtn = document.getElementById('globalSettingsBtn');
    const closeDialogBtn = document.getElementById('closeDialogBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const tabBtns = document.querySelectorAll('.tab-btn');

    [loginTab, registerTab].forEach(tab => {
        tab.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    });

    // ==================== ПЕРЕХОДЫ ====================
    function navigateTo(page) {
        document.body.style.transition = 'opacity 0.2s ease';
        document.body.style.opacity = '0';
        setTimeout(() => { window.location.href = page; }, 200);
    }

    startBtn.addEventListener('click', () => {
        AuthService.isAuthenticated() ? navigateTo('menu.html') : openAuthDialog();
    });
    settingsBtn.addEventListener('click', () => navigateTo('settings.html'));

    // ==================== ДИАЛОГ ====================
    function openAuthDialog() {
        clearAllErrors();
        loginForm.reset();
        registerForm.reset();
        switchTab('login');
        authDialog.showModal();
        setTimeout(() => document.getElementById('loginEmail').focus(), 350);
    }

    function closeAuthDialog() {
        authDialog.close();
        startBtn.focus();
    }

    closeDialogBtn.addEventListener('click', closeAuthDialog);
    authDialog.addEventListener('cancel', (e) => { e.preventDefault(); closeAuthDialog(); });

    // ==================== ТАБЫ ====================
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
    });

    function switchTab(tabName) {
        const isLogin = tabName === 'login';
        tabBtns.forEach(b => {
            const active = b.getAttribute('data-tab') === tabName;
            b.classList.toggle('active', active);
            b.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        const showTab = isLogin ? loginTab : registerTab;
        const hideTab = isLogin ? registerTab : loginTab;
        if (hideTab.classList.contains('active')) {
            hideTab.style.opacity = '0';
            hideTab.style.transform = 'translateY(8px)';
        }
        setTimeout(() => {
            hideTab.classList.remove('active');
            showTab.classList.add('active');
            showTab.style.opacity = '1';
            showTab.style.transform = 'translateY(0)';
            const firstInput = showTab.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 150);
        clearAllErrors();
    }

    // ==================== РОЛИ ====================
    const roleBtns = document.querySelectorAll('.role-btn');
    const childNameGroup = document.getElementById('childNameGroup');
    const regChildNameInput = document.getElementById('regChildName');
    let selectedRole = 'parent';

    roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedRole = btn.getAttribute('data-role');
            roleBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            if (selectedRole === 'parent') {
                childNameGroup.style.display = 'flex';
                regChildNameInput.setAttribute('required', '');
            } else {
                childNameGroup.style.display = 'none';
                regChildNameInput.removeAttribute('required');
                clearError('regChildName');
            }
        });
    });

    // ==================== ПОКАЗ ПАРОЛЯ ====================
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            btn.textContent = isPassword ? '🙈' : '👁';
            btn.setAttribute('aria-label', isPassword ? 'Скрыть пароль' : 'Показать пароль');
        });
    });

    // ==================== ВАЛИДАЦИЯ ====================
    const ERROR_IDS = [
        'loginEmail', 'loginPassword',
        'regParentName', 'regEmail', 'regPassword',
        'regConfirmPassword', 'regChildName',
    ];

    function showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorEl = document.getElementById(inputId + 'Error');
        if (input) {
            input.classList.add('input-error');
            input.style.animation = 'none';
            input.offsetHeight;
            input.style.animation = 'shake 0.4s ease';
        }
        if (errorEl) errorEl.textContent = message;
    }

    function clearError(inputId) {
        const input = document.getElementById(inputId);
        const errorEl = document.getElementById(inputId + 'Error');
        if (input) input.classList.remove('input-error');
        if (errorEl) errorEl.textContent = '';
    }

    function clearAllErrors() { ERROR_IDS.forEach(clearError); }

    document.querySelectorAll('.input-group input').forEach(input => {
        input.addEventListener('input', () => clearError(input.id));
    });

    // ==================== ВХОД ====================
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        if (!validateLoginFields(email, password)) return;
        await performLogin(email, password);
    });

    async function performLogin(email, password) {
        const btn = document.getElementById('loginBtn');
        setLoading(btn, true, 'Входим...');
        try {
            await AuthService.login(email, password);
            authDialog.close();
            navigateTo('menu.html');
        } catch (err) {
            showError('loginEmail', err.name === 'ApiError' ? err.message : 'Ошибка соединения');
        } finally {
            setLoading(btn, false, 'Войти');
        }
    }

    function validateLoginFields(email, password) {
        let valid = true;
        if (!email) { showError('loginEmail', 'Введите email'); valid = false; }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('loginEmail', 'Некорректный email'); valid = false; }
        if (!password) { showError('loginPassword', 'Введите пароль'); valid = false; }
        return valid;
    }

    // ==================== РЕГИСТРАЦИЯ ====================
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors();
        const data = {
            parentName: document.getElementById('regParentName').value.trim(),
            email: document.getElementById('regEmail').value.trim(),
            password: document.getElementById('regPassword').value,
            confirmPassword: document.getElementById('regConfirmPassword').value,
            childName: document.getElementById('regChildName').value.trim(),
            role: selectedRole,
        };
        if (!validateRegisterFields(data)) return;
        await performRegister(data);
    });

    async function performRegister(data) {
        const btn = document.getElementById('registerBtn');
        setLoading(btn, true, 'Регистрируем...');
        try {
            // ✅ Вызываем AuthService.register — он сохранит userData
            await AuthService.register(data);
            // ✅ Показываем toast об успехе
            showToast('Регистрация успешна! Теперь войдите.', 'success');
            // ✅ Переключаем на вкладку входа
            switchTab('login');
            document.getElementById('loginEmail').value = data.email;
            document.getElementById('loginPassword').value = '';
            setTimeout(() => document.getElementById('loginPassword').focus(), 400);
        } catch (err) {
            showError('regEmail', err.name === 'ApiError' ? err.message : 'Ошибка соединения');
        } finally {
            setLoading(btn, false, 'Зарегистрироваться');
        }
    }

    function validateRegisterFields(d) {
        let valid = true;
        if (!d.parentName) { showError('regParentName', 'Введите имя'); valid = false; }
        else if (d.parentName.length < 2) { showError('regParentName', 'Слишком короткое'); valid = false; }
        if (!d.email) { showError('regEmail', 'Введите email'); valid = false; }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) { showError('regEmail', 'Некорректный email'); valid = false; }
        if (!d.password) { showError('regPassword', 'Введите пароль'); valid = false; }
        else if (d.password.length < 6) { showError('regPassword', 'Минимум 6 символов'); valid = false; }
        if (!d.confirmPassword) { showError('regConfirmPassword', 'Подтвердите пароль'); valid = false; }
        else if (d.password !== d.confirmPassword) { showError('regConfirmPassword', 'Пароли не совпадают'); valid = false; }
        if (d.role === 'parent' && !d.childName) { showError('regChildName', 'Введите имя ребёнка'); valid = false; }
        return valid;
    }

    // ==================== УТИЛИТЫ ====================
    function setLoading(btn, isLoading, text) {
        btn.disabled = isLoading;
        btn.textContent = text;
        btn.style.cursor = isLoading ? 'wait' : 'pointer';
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        const bg = type === 'success' ? 'var(--accent-green)' :
                   type === 'error' ? 'var(--error-red)' : 'var(--accent-blue)';
        Object.assign(toast.style, {
            position: 'fixed', bottom: '24px', left: '50%',
            transform: 'translateX(-50%) translateY(8px)',
            background: bg, color: 'white',
            padding: '14px 24px', borderRadius: 'var(--radius-lg)',
            fontSize: '16px', fontWeight: '600',
            fontFamily: "'Nunito', sans-serif",
            boxShadow: 'var(--shadow-md)',  zIndex: '9999',
            opacity: '0', transition: 'opacity 0.3s ease, transform 0.3s ease',
        });
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(-4px)';
        });
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(8px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ==================== GOOGLE ====================
    document.getElementById('googleLoginBtn').addEventListener('click', () => {
        showToast('Вход через Google — после подключения бэкенда');
    });
    document.getElementById('googleRegisterBtn').addEventListener('click', () => {
        showToast('Регистрация через Google — после подключения бэкенда');
    });
})();