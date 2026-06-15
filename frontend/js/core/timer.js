/**
 * Сервис таймера.
 * Время по умолчанию — 5 минут. Настройки — в settings.js.
 */
const TimerService = {
    STORAGE_KEY: 'timerSettings',
    DEFAULT_DURATION: 5 * 60,

    _remaining: 0,
    _interval: null,
    _display: null,
    _running: false,

    /** Привязать к DOM-элементу */
    init(displayEl) {
        this._display = typeof displayEl === 'string'
            ? document.querySelector(displayEl)
            : displayEl;
        if (!this._display) return;
        const s = this.getSettings();
        this._remaining = s.duration || this.DEFAULT_DURATION;
        this._render();
    },

    getSettings() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : { duration: this.DEFAULT_DURATION };
        } catch { return { duration: this.DEFAULT_DURATION }; }
    },

    saveSettings(s) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(s));
    },

    start() {
        if (this._running) return;
        if (this._remaining <= 0) {
            this._remaining = this.getSettings().duration || this.DEFAULT_DURATION;
        }
        this._running = true;
        this._render();
        this._interval = setInterval(() => {
            this._remaining--;
            this._render();
            if (this._remaining <= 0) {
                this.stop();
                if (typeof showToast === 'function') {
                    showToast('Время занятия вышло!', 'info');
                }
            }
        }, 1000);
    },

    stop() {
        this._running = false;
        clearInterval(this._interval);
        this._interval = null;
    },

    reset() {
        this.stop();
        this._remaining = this.getSettings().duration || this.DEFAULT_DURATION;
        this._render();
    },

    setDuration(seconds) {
        this.stop();
        this._remaining = seconds;
        this.saveSettings({ duration: seconds, autoStart: this.getSettings().autoStart });
        this._render();
    },

    isRunning() { return this._running; },

    _render() {
        if (!this._display) return;
        const m = Math.floor(this._remaining / 60);
        const s = this._remaining % 60;
        this._display.textContent =
            `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },
};