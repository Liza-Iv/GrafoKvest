const TimerService = {
    STORAGE_PREFIX: 'timerSettings_',
    STATE_PREFIX: 'timerState_',
    DEFAULT_DURATION: 5 * 60,

    _remaining: 0,
    _interval: null,
    _running: false,
    _onTimeUpCallback: null,
    _currentChildId: null,
    _totalDuration: 0,

    setChildId: function(childId) {
        if (this._currentChildId === childId) return;
        if (this._currentChildId) this.saveState();
        this._currentChildId = childId;
        this._restoreState();
        if (!this._running) {
            var state = this._loadState();
            if (state && state.remaining > 0) this._remaining = state.remaining;
            else { var saved = this.getSettings(); this._remaining = saved.duration || this.DEFAULT_DURATION; }
        }
        this._renderAll();
        if (this._running && !this._interval) this._startInterval();
        else if (!this._running) this.stop();
    },

    _getStorageKey: function() { return this.STORAGE_PREFIX + (this._currentChildId || '0'); },
    _getStateKey: function() { return this.STATE_PREFIX + (this._currentChildId || '0'); },

    init: function() {
        this._restoreState();
        if (!this._running) {
            var state = this._loadState();
            if (state && state.remaining > 0) this._remaining = state.remaining;
            else { var saved = this.getSettings(); this._remaining = saved.duration || this.DEFAULT_DURATION; }
        }
        this._renderAll();
        if (this._running && !this._interval) this._startInterval();
    },

    getSettings: function() {
        try { var raw = localStorage.getItem(this._getStorageKey()); return raw ? JSON.parse(raw) : { duration: this.DEFAULT_DURATION, autoStart: false }; }
        catch(e) { return { duration: this.DEFAULT_DURATION, autoStart: false }; }
    },

    saveSettings: function(s) { localStorage.setItem(this._getStorageKey(), JSON.stringify(s)); },

    saveState: function() {
        if (!this._currentChildId) return;
        localStorage.setItem(this._getStateKey(), JSON.stringify({ remaining: this._remaining, running: this._running, timestamp: Date.now() }));
    },

    _restoreState: function() {
        var state = this._loadState();
        if (!state) return;
        if (state.running && state.timestamp) {
            var elapsed = Math.floor((Date.now() - state.timestamp) / 1000);
            this._remaining = Math.max(0, state.remaining - elapsed);
            this._running = this._remaining > 0;
        } else { this._remaining = state.remaining; this._running = false; }
    },

    _loadState: function() {
        try { var raw = localStorage.getItem(this._getStateKey()); return raw ? JSON.parse(raw) : null; }
        catch(e) { return null; }
    },

    start: function() {
        if (this._running) return;
        if (this._remaining <= 0) this._remaining = this.getSettings().duration || this.DEFAULT_DURATION;
        this._totalDuration = this._remaining;
        this._running = true; this._renderAll(); this._startInterval(); this.saveState();
    },

    _startInterval: function() {
        var self = this; if (this._interval) clearInterval(this._interval);
        this._interval = setInterval(function() {
            self._remaining--; self._renderAll(); self.saveState();
            if (self._remaining <= 0) {
                self.stop();
                if (self._onTimeUpCallback) self._onTimeUpCallback(self._totalDuration || self.DEFAULT_DURATION);
            }
        }, 1000);
    },

    stop: function() { this._running = false; if (this._interval) { clearInterval(this._interval); this._interval = null; } this._renderAll(); this.saveState(); },

    reset: function() { this.stop(); this._remaining = this.getSettings().duration || this.DEFAULT_DURATION; this._renderAll(); this.saveState(); },

    setDuration: function(seconds) { this.stop(); this._remaining = seconds; this.saveSettings({ duration: seconds, autoStart: this.getSettings().autoStart }); this._renderAll(); this.saveState(); },

    isRunning: function() { return this._running; },
    onTimeUp: function(callback) { this._onTimeUpCallback = callback; },

    _renderAll: function() {
        var displays = document.querySelectorAll('.timer-text');
        var m = Math.floor(this._remaining / 60), s = this._remaining % 60;
        var text = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
        displays.forEach(function(el) { el.textContent = text; });
        var timers = document.querySelectorAll('.timer');
        if (this._running && this._remaining <= 60 && this._remaining > 0) timers.forEach(function(el) { el.classList.add('warning'); });
        else timers.forEach(function(el) { el.classList.remove('warning'); });
    }
};