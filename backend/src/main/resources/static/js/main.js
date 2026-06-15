/**
 * Главный модуль приложения.
 * Таймер, попап «Время вышло», быстрый выбор времени,
 * офлайн-очередь синхронизации, глобальные настройки стилей.
 */
(function() {
    'use strict';

    // ==================== ПОПАП «ВРЕМЯ ВЫШЛО» ====================

    /** Создать попап если его ещё нет */
    function ensureTimeoutDialog() {
        if (document.getElementById('timeoutDialog')) return;
        var dialog = document.createElement('dialog');
        dialog.id = 'timeoutDialog';
        dialog.className = 'timeout-dialog';
        dialog.innerHTML =
            '<img src="image/icons/timer-icon.png" alt="" class="timeout-dialog-icon">' +
            '<h3>Время вышло!</h3>' +
            '<p class="timeout-done" id="timeoutDoneText"></p>' +
            '<div class="timeout-tasks-list" id="timeoutTasksList"></div>' +
            '<p class="timeout-left" id="timeoutLeftText"></p>' +
            '<p class="timeout-info"></p>' +
            '<div class="timeout-buttons"></div>';
        document.body.appendChild(dialog);
    }

    /** Показать попап с заданиями */
    window.showTimeoutDialog = function(doneTasks, totalTime) {
        ensureTimeoutDialog();
        var dialog = document.getElementById('timeoutDialog');

        document.getElementById('timeoutDoneText').textContent =
            'Молодец! Выполнено заданий: ' + (doneTasks.length || 0);
        document.getElementById('timeoutLeftText').textContent =
            'Что не успел — можно доделать с родителями позже.';

        // Список заданий
        var tasksListEl = document.getElementById('timeoutTasksList');
        if (doneTasks.length > 0) {
            tasksListEl.innerHTML = doneTasks.map(function(t, i) {
                return '<div class="timeout-task-row">' + (i + 1) + '. ' + t + '</div>';
            }).join('');
        } else {
            tasksListEl.innerHTML = '';
        }

        // Информация о времени
        var infoEl = dialog.querySelector('.timeout-info');
        var minutes = Math.floor((totalTime || 300) / 60);
        infoEl.textContent = '⏱ ' + minutes + ' мин — рекомендовано СанПиН для детей 4-7 лет';

        // Кнопки
        var buttonsEl = dialog.querySelector('.timeout-buttons');
        buttonsEl.innerHTML =
            '<button class="timeout-btn timeout-btn-settings">⚙️ Выбрать время</button>' +
            '<button class="timeout-btn timeout-btn-logout">👋 Выйти</button>';

        buttonsEl.querySelector('.timeout-btn-settings').onclick = function() {
            dialog.close();
            window.location.href = '/settings.html';
        };
        buttonsEl.querySelector('.timeout-btn-logout').onclick = function() {
            dialog.close();
            if (typeof AuthService !== 'undefined') AuthService.logout();
        };

        dialog.showModal();
    };

    // ==================== ТАЙМЕР ====================

    /** Инициализация таймера с автостартом */
    function setupTimer() {
        if (typeof TimerService === 'undefined') return;

        var children = [];
        try { children = JSON.parse(localStorage.getItem('profileChildren') || '[]'); } catch(e) {}
        var idx = parseInt(localStorage.getItem('activeChildIndex') || '0');
        if (children.length > idx) TimerService.setChildId(children[idx].id);

        TimerService.onTimeUp(function(totalDuration) {
            var completed = [];
            try {
                var raw = localStorage.getItem(getActiveCompletedKey());
                if (raw) {
                    var tasks = JSON.parse(raw);
                    completed = tasks.slice(-5).map(function(t) { return t.title; });
                }
            } catch(e) {}
            window.showTimeoutDialog(completed, totalDuration);
        });

        TimerService.init();
        window.addEventListener('beforeunload', function() {
            if (typeof TimerService !== 'undefined') TimerService.saveState();
        });
    }

    /** Быстрый выбор времени по клику на таймер */
    function setupQuickTimer() {
        var timerEl = document.querySelector('.timer');
        if (!timerEl) return;

        timerEl.addEventListener('click', function(e) {
            e.stopPropagation();
            var existing = document.querySelector('.quick-timer-popup');
            if (existing) { existing.remove(); return; }

            var popup = document.createElement('div');
            popup.className = 'quick-timer-popup';

            [{label:'5 мин',val:5},{label:'7 мин',val:7},{label:'10 мин',val:10},{label:'15 мин',val:15},{label:'Без таймера',val:0}].forEach(function(t) {
                var btn = document.createElement('button');
                btn.className = 'quick-time-btn';
                btn.textContent = t.label;
                btn.onclick = function() {
                    if (t.val > 0) {
                        TimerService.setDuration(t.val * 60);
                        TimerService.start();
                        TimerService.saveSettings({ duration: t.val * 60, autoStart: true });
                    } else {
                        TimerService.stop();
                        TimerService.saveSettings({ duration: 0, autoStart: false });
                    }
                    popup.querySelectorAll('.quick-time-btn').forEach(function(b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                    setTimeout(function() { popup.remove(); }, 300);
                };
                popup.appendChild(btn);
            });

            timerEl.appendChild(popup);
            document.addEventListener('click', function closePopup() {
                if (popup.parentNode) popup.remove();
                document.removeEventListener('click', closePopup);
            });
        });
    }

    // ==================== ОФЛАЙН-СИНХРОНИЗАЦИЯ ====================

    /** Очередь запросов, ожидающих интернет */
    window.syncQueue = [];

    /** Добавить запрос в офлайн-очередь */
    window.addToSyncQueue = function(url, options) {
        window.syncQueue.push({ url: url, options: options, timestamp: Date.now() });
        localStorage.setItem('syncQueue', JSON.stringify(window.syncQueue));
    };

    /** Отправить накопленные запросы когда появился интернет */
    window.processSyncQueue = function() {
        var queue = [];
        try { queue = JSON.parse(localStorage.getItem('syncQueue') || '[]'); } catch(e) {}
        if (!queue.length) return;

        queue.forEach(function(item) {
            fetch(item.url, item.options).catch(function() { /* останется в очереди */ });
        });

        localStorage.removeItem('syncQueue');
        window.syncQueue = [];
    };

    // Слушаем появление интернета
    window.addEventListener('online', function() {
        window.processSyncQueue();
    });

    // При загрузке: загрузить очередь и сразу отправить если онлайн
    window.addEventListener('load', function() {
        try { window.syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]'); } catch(e) {}
        if (navigator.onLine) window.processSyncQueue();
    });

    // ==================== ГЛОБАЛЬНЫЕ НАСТРОЙКИ СТИЛЕЙ ====================

    /** Применить сохранённые настройки (контраст, крупный шрифт) */
    function applyGlobalSettings() {
        var children = [];
        try { children = JSON.parse(localStorage.getItem('profileChildren') || '[]'); } catch(e) {}
        var idx = parseInt(localStorage.getItem('activeChildIndex') || '0');
        var childId = (children.length > idx) ? children[idx].id : null;
        if (!childId) return;

        var key = 'settings_child_' + childId;
        try {
            var raw = localStorage.getItem(key);
            if (raw) {
                var s = JSON.parse(raw);
                document.body.classList.toggle('big-font', s.bigFont === true);
                document.body.classList.toggle('large-icons', s.iconStyle === 'large');
                document.body.classList.toggle('contrast-theme', s.colorTheme === 'contrast');
            }
        } catch(e) {}
    }

    /** Ключ выполненных заданий для активного ребёнка */
    function getActiveCompletedKey() {
        var children = [];
        try { children = JSON.parse(localStorage.getItem('profileChildren') || '[]'); } catch(e) {}
        var idx = parseInt(localStorage.getItem('activeChildIndex') || '0');
        if (children.length > idx) return 'completedTasks_' + children[idx].id;
        return 'completedTasks';
    }

    // ==================== ЗАПУСК ====================
    function init() {
        setupTimer();
        applyGlobalSettings();
        setupQuickTimer();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();