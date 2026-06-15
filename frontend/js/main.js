// frontend/js/main.js (временно для отладки)
class AuthModule {
  constructor() {
    this.dialog = document.getElementById('authDialog');
    this.startBtn = document.getElementById('startBtn');
    this.errorEl = document.getElementById('authError');
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.forms = document.querySelectorAll('.auth-form');

    this.init();
  }

  init() {
    console.log('🚀 AuthModule инициализирован');

    // Проверяем, что API доступен
    if (!window.api) {
      console.error('❌ API не загружен!');
      return;
    }

    console.log('✅ API доступен');

    this.startBtn.addEventListener('click', () => {
      console.log('🟢 Кнопка нажата');
      this.dialog.showModal();
    });

    this.dialog.querySelector('.auth-close').addEventListener('click', () => {
      this.dialog.close();
    });

    this.dialog.addEventListener('click', (e) => {
      if (e.target === this.dialog) this.dialog.close();
    });

    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    this.forms.forEach(form => {
      form.addEventListener('submit', (e) => this.handleSubmit(e, form));
    });
  }

  switchTab(tab) {
    console.log('🔄 Переключение на:', tab);

    this.tabBtns.forEach(b => {
      const isActive = b.dataset.tab === tab;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive);
    });

    this.forms.forEach(f => {
      f.classList.toggle('active', f.dataset.form === tab);
    });

    this.errorEl.textContent = '';
    this.errorEl.classList.remove('visible');
  }

  async handleSubmit(e, form) {
    e.preventDefault();

    console.log('📤 Отправка формы:', form.dataset.form);

    const formData = Object.fromEntries(new FormData(form));
    console.log('📦 Данные:', formData);

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
      submitBtn.textContent = 'ОБРАБОТКА...';
      submitBtn.disabled = true;

      if (form.dataset.form === 'login') {
        const response = await window.api.login(formData.email, formData.password);
        console.log('✅ Вход успешен:', response);

        // Сохраняем токен
        localStorage.setItem('accessToken', response.accessToken);

        // Показываем успех
        this.showError('✅ Вход выполнен!', 'success');

        // Редирект через 1 секунду
        setTimeout(() => {
          window.location.href = '/menu.html';
        }, 1000);

      } else {
        const response = await window.api.register(formData);
        console.log('✅ Регистрация успешна:', response);

        localStorage.setItem('accessToken', response.accessToken);
        this.showError('✅ Регистрация успешна!', 'success');

        setTimeout(() => {
          window.location.href = '/menu.html';
        }, 1000);
      }

    } catch (error) {
      console.error('❌ Ошибка:', error);
      this.showError(error.message);
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  showError(message, type = 'error') {
    this.errorEl.textContent = message;
    this.errorEl.classList.add('visible');
    this.errorEl.style.color = type === 'success' ? '#2ECC71' : '#E74C3C';
  }
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM загружен');
  window.authModule = new AuthModule();
});

/* ============================================
   GLOBAL: PRELOADER (для всех страниц)
   ============================================ */
.page-loader {
    position: fixed;
    inset: 0;
    background: var(--bg-main);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transition: opacity 0.35s ease, visibility 0.35s ease;
}
.page-loader.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(12px, 2vw, 20px);
}
.loader-logo {
    width: clamp(90px, 12vw, 130px);
    height: auto;
    animation: loaderPulse 2s ease-in-out infinite;
}
@keyframes loaderPulse {
    0%, 100% { opacity: 0.35; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.04); }
}
.loader-spinner {
    width: clamp(32px, 4vw, 44px);
    height: clamp(32px, 4vw, 44px);
    border: 3px solid var(--border-light);
    border-top-color: var(--accent-orange);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loader-text {
    font-family: 'Nunito', sans-serif;
    font-size: clamp(13px, 1.5vw, 15px);
    color: var(--text-muted);
    font-weight: 600;
}