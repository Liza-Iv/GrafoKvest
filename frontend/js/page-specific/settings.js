(function () {
    'use strict';
    if (!AuthService.isAuthenticated()) { window.location.href = '/index.html'; return; }

    const $ = (id) => document.getElementById(id);
    const pageLoader = $('pageLoader'), settingsContent = $('settingsContent'), childSelect = $('childSelect'), toast = $('toast');
    let profileData = null, activeChildId = null, allChildren = [];

    const DEFAULTS = { voiceEnabled:true, soundEnabled:true, speechRate:'normal', iconStyle:'regular', bigFont:false, colorTheme:'standard', hintsEnabled:true, timerEnabled:false, timerDuration:5 };

    async function loadProfile() {
        try {
            var token = AuthService.getToken();
            const res = await fetch('/api/profile', {
                headers: { 'Authorization': 'Bearer ' + (token || '') }
            });
            if (!res.ok) {
                console.warn('Профиль не загружен:', res.status);
                allChildren = [];
                return;
            }
            profileData = await res.json();
            allChildren = profileData.children || [];
        } catch(err) {
            console.warn('Ошибка загрузки профиля:', err.message);
            allChildren = [];
        }
    }

    function renderChildSelect() {
        if (!childSelect) return;
        childSelect.innerHTML = '';
        if (!allChildren.length) {
            childSelect.innerHTML = '<option value="">Нет детей</option>';
            return;
        }
        allChildren.forEach(function(child) {
            var opt = document.createElement('option');
            opt.value = child.id;
            opt.textContent = child.name || 'Без имени';
            childSelect.appendChild(opt);
        });
        if (allChildren.length > 0 && !activeChildId) {
            activeChildId = allChildren[0].id;
            childSelect.value = activeChildId;
        }
    }

    function getSettingsKey() { return 'settings_child_' + activeChildId; }

    function loadSettingsFromLocal() {
        try {
            var raw = localStorage.getItem(getSettingsKey());
            return raw ? JSON.parse(raw) : Object.assign({}, DEFAULTS);
        } catch(e) { return Object.assign({}, DEFAULTS); }
    }

    function saveSettingsToLocal(s) {
        localStorage.setItem(getSettingsKey(), JSON.stringify(s));
    }

    async function loadSettingsFromAPI() {
        if (!activeChildId) return;
        try {
            var token = AuthService.getToken();
            const res = await fetch('/api/settings/' + activeChildId, {
                headers: { 'Authorization': 'Bearer ' + (token || '') }
            });
            if (res.ok) {
                var data = await res.json();
                saveSettingsToLocal(data);
                applySettings(data, true);
            }
        } catch(err) {}
    }

    function applySettings(s, skipTimer) {
        setToggle('voiceEnabled', s.voiceEnabled);
        setToggle('soundEnabled', s.soundEnabled);
        setToggle('bigFont', s.bigFont);
        setToggle('hintsEnabled', s.hintsEnabled);
        setToggle('timerEnabled', s.timerEnabled);
        setActiveOption('speechRate', s.speechRate);
        setActiveOption('iconStyle', s.iconStyle);
        setActiveOption('colorTheme', s.colorTheme);
        setActiveOption('timerDuration', s.timerDuration);

        document.body.classList.toggle('big-font', s.bigFont);
        document.body.classList.toggle('large-icons', s.iconStyle === 'large');
        document.body.classList.toggle('contrast-theme', s.colorTheme === 'contrast');

        if (!skipTimer && typeof TimerService !== 'undefined') {
            if (activeChildId) TimerService.setChildId(activeChildId);
            var cur = TimerService.getSettings();
            var newDur = s.timerDuration * 60;
            if (cur.duration !== newDur) {
                TimerService.saveSettings({ duration: newDur, autoStart: s.timerEnabled });
                TimerService.setDuration(newDur);
            }
            if (s.timerEnabled && !TimerService.isRunning()) TimerService.start();
            else if (!s.timerEnabled && TimerService.isRunning()) TimerService.stop();
        }
    }

    function setToggle(id, value) { var el = $(id); if (el) el.checked = value; }

    function setActiveOption(group, value) {
        document.querySelectorAll('.option-buttons[data-key="' + group + '"] .option-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.getAttribute('data-value') == value);
        });
    }

    function getSettings() {
        var voiceEl = $('voiceEnabled'), soundEl = $('soundEnabled'), bigFontEl = $('bigFont');
        var hintsEl = $('hintsEnabled'), timerEl = $('timerEnabled');
        return {
            voiceEnabled: voiceEl ? voiceEl.checked : true,
            soundEnabled: soundEl ? soundEl.checked : true,
            speechRate: getActiveOption('speechRate') || 'normal',
            iconStyle: getActiveOption('iconStyle') || 'regular',
            bigFont: bigFontEl ? bigFontEl.checked : false,
            colorTheme: getActiveOption('colorTheme') || 'standard',
            hintsEnabled: hintsEl ? hintsEl.checked : true,
            timerEnabled: timerEl ? timerEl.checked : false,
            timerDuration: parseInt(getActiveOption('timerDuration')) || 5
        };
    }

    function getActiveOption(group) {
        var active = document.querySelector('.option-buttons[data-key="' + group + '"] .option-btn.active');
        return active ? active.getAttribute('data-value') : null;
    }

    async function saveSettings() {
        var s = getSettings();
        saveSettingsToLocal(s);
        applySettings(s, false);

        if (!activeChildId) { showToast('Нет активного ребёнка', true); return; }

        try {
            var token = AuthService.getToken();
            const res = await fetch('/api/settings/' + activeChildId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (token || '')
                },
                body: JSON.stringify(s)
            });
            if (res.ok) showToast('Настройки сохранены');
            else showToast('Ошибка сохранения', true);
        } catch(err) {
            showToast('Сервер не отвечает. Сохранено локально.', true);
        }
    }

    function resetSettings() {
        applySettings(DEFAULTS, false);
        saveSettingsToLocal(DEFAULTS);
        showToast('Настройки сброшены');
    }

    function showToast(msg, isErr) {
        if (!toast) return;
        toast.textContent = msg;
        toast.className = 'toast' + (isErr ? ' error' : '') + ' show';
        setTimeout(function() { toast.classList.remove('show'); }, 2500);
    }

    function goBack() { window.history.back(); }

    $('backBtn').addEventListener('click', goBack);
    $('saveBtn').addEventListener('click', saveSettings);
    $('resetBtn').addEventListener('click', resetSettings);

    childSelect.addEventListener('change', function() {
        activeChildId = this.value ? parseInt(this.value) : null;
        if (!activeChildId) return;
        applySettings(loadSettingsFromLocal(), true);
        loadSettingsFromAPI();
    });

    document.querySelectorAll('.option-buttons').forEach(function(group) {
        group.addEventListener('click', function(e) {
            if (e.target.classList.contains('option-btn')) {
                group.querySelectorAll('.option-btn').forEach(function(b) { b.classList.remove('active'); });
                e.target.classList.add('active');
            }
        });
    });

    async function init() {
        await loadProfile();
        renderChildSelect();
        if (activeChildId) {
            applySettings(loadSettingsFromLocal(), true);
            loadSettingsFromAPI();
        }
        pageLoader.classList.add('hidden');
        settingsContent.classList.add('visible');
    }

    init();
})();