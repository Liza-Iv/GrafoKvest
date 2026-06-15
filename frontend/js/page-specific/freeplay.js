/**
 * Свободная игра — с волшебной анимацией звезды.
 */
(function () {
    'use strict';

    if (!AuthService.isAuthenticated()) {
        window.location.href = '/index.html';
        return;
    }

    const $ = (id) => document.getElementById(id);

    const pageLoader = $('pageLoader');
    const gameContent = $('gameContent');
    const errorBlock = $('errorBlock');
    const taskImage = $('taskImage');
    const taskTitle = $('taskTitle');
    const taskShort = $('taskShort');
    const actionButtons = $('actionButtons');
    const progressSection = $('progressSection');
    const starsContainer = $('starsContainer');
    const progressFill = $('progressFill');
    const progressFraction = $('progressFraction');
    const progressMessage = $('progressMessage');
    const hintBtn = $('hintBtn');
    const speakBtn = $('speakBtn');
    const speakIcon = $('speakIcon');
    const speakLabel = $('speakLabel');
    const completeBtn = $('completeBtn');
    const instructionDialog = $('instructionDialog');
    const dialogTitle = $('dialogTitle');
    const dialogDifficulty = $('dialogDifficulty');
    const dialogTime = $('dialogTime');
    const dialogMaterials = $('dialogMaterials');
    const dialogHint = $('dialogHint');
    const dialogFullText = $('dialogFullText');
    const dialogDevelops = $('dialogDevelops');
    const timerTextEl = document.querySelector('.timer-text');

    const TOTAL = 5;
    let allTasks = [];
    let currentTask = null;
    let completed = 0;
    let isSpeaking = false;

    // ==================== ЗАГРУЗКА ИЗ БД ====================
    async function fetchTasks() {
        try {
            const res = await fetch('/api/tasks');
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) throw new Error('Нет заданий');
            allTasks = data;
        } catch (err) {
            console.error('Ошибка загрузки:', err.message);
            allTasks = [];
        }
    }

    // ==================== ПРОГРЕСС ====================
    function loadProgress() {
        const saved = localStorage.getItem('freeplayProgress');
        completed = saved ? parseInt(saved) : 0;
        if (completed >= TOTAL) completed = 0;
    }
    function saveProgress() { localStorage.setItem('freeplayProgress', completed); }

    function updateProgressUI() {
        if (!starsContainer) return;
        starsContainer.innerHTML = '';
        for (let i = 1; i <= TOTAL; i++) {
            const img = document.createElement('img');
            img.src = i <= completed ? 'image/icons/star-filled.png' : 'image/icons/star-empty.png';
            img.alt = i <= completed ? 'Выполнено' : 'Не выполнено';
            img.className = 'star-icon' + (i === completed && completed > 0 ? ' filled' : '');
            starsContainer.appendChild(img);
        }
        if (progressFill) progressFill.style.width = ((completed / TOTAL) * 100) + '%';
        if (progressFraction) progressFraction.textContent = `${completed}/${TOTAL}`;
        if (progressMessage) {
            const left = TOTAL - completed;
            const msgs = {0:'🎉 Молодец! Все задания выполнены!',1:'🔥 Осталось 1 задание!',2:'✨ Осталось 2 задания'};
            progressMessage.textContent = msgs[left] || `📝 Осталось ${left} заданий`;
        }
    }

    // ==================== ВОЛШЕБНАЯ АНИМАЦИЯ ЗВЕЗДЫ ====================
    function playMagicStar(fromEl, toEl) {
        if (!fromEl || !toEl) return;

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        const dx = toRect.left + toRect.width / 2 - fromRect.left - fromRect.width / 2;
        const dy = toRect.top + toRect.height / 2 - fromRect.top - fromRect.height / 2;

        const star = document.createElement('img');
        star.src = 'image/icons/star-filled.png';
        star.alt = '';
        star.className = 'magic-star';
        star.style.cssText = `
            position: fixed;
            left: ${fromRect.left + fromRect.width / 2 - 30}px;
            top: ${fromRect.top + fromRect.height / 2 - 30}px;
            width: 60px; height: 60px;
            z-index: 200; pointer-events: none;
            --dx: ${dx}px; --dy: ${dy}px;
        `;

        document.body.appendChild(star);

        star.addEventListener('animationend', () => star.remove());
    }

    // ==================== ОТОБРАЖЕНИЕ ====================
    function getRandomTask() {
        if (!allTasks.length) return null;
        const others = allTasks.filter(t => !currentTask || t.id !== currentTask.id);
        return others.length ? others[Math.floor(Math.random() * others.length)] : allTasks[0];
    }

    function renderTask(task) {
        if (!task) return;
        stopSpeech();
        currentTask = task;
        if (taskImage) {
            taskImage.style.opacity = '0';
            setTimeout(() => {
                taskImage.src = task.image || 'image/tasks/task_default.jpg';
                taskImage.alt = task.title || '';
                taskImage.style.opacity = '1';
            }, 150);
        }
        if (taskTitle) taskTitle.textContent = task.title || '';
        if (taskShort) taskShort.textContent = task.shortText || '';
        if (dialogTitle) dialogTitle.textContent = task.title || '';
        if (dialogDifficulty) {
            const map = {easy:'Лёгкое',medium:'Среднее',hard:'Сложное'};
            dialogDifficulty.textContent = map[task.difficulty] || task.difficulty || '—';
        }
        if (dialogTime) dialogTime.textContent = task.timeMinutes ? '~' + task.timeMinutes + ' мин' : '—';
        if (dialogMaterials) dialogMaterials.textContent = task.materials || '';
        if (dialogHint) dialogHint.textContent = task.hint || '';
        if (dialogFullText) dialogFullText.textContent = task.fullText || '';
        if (dialogDevelops) dialogDevelops.textContent = task.develops || '';
    }

    // ==================== ОЗВУЧКА ====================
    function stopSpeech() {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        isSpeaking = false;
        if (speakIcon) speakIcon.src = 'image/icons/speak.png';
        if (speakLabel) speakLabel.textContent = 'Озвучить';
        if (speakBtn) speakBtn.classList.remove('speaking');
    }

    function toggleSpeech() {
        if (isSpeaking) { stopSpeech(); return; }
        if (!currentTask?.fullText) return;
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(currentTask.fullText);
        u.lang = 'ru-RU'; u.rate = 0.9; u.pitch = 1.1;
        u.onstart = () => {
            isSpeaking = true;
            if (speakIcon) speakIcon.src = 'image/icons/stop.png';
            if (speakLabel) speakLabel.textContent = 'Стоп';
            if (speakBtn) speakBtn.classList.add('speaking');
        };
        u.onend = () => stopSpeech();
        u.onerror = () => stopSpeech();
        window.speechSynthesis.speak(u);
    }

    // ==================== НАВИГАЦИЯ ====================
    function go(page) {
        stopSpeech();
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.2s ease';
        setTimeout(() => location.href = '/' + page, 200);
    }

    // ==================== UI ====================
    function showErrorState() {
        if (errorBlock) errorBlock.style.display = '';
        if (taskImage) taskImage.parentElement.style.display = 'none';
        if (actionButtons) actionButtons.style.display = 'none';
        if (progressSection) progressSection.style.display = 'none';
        if (hintBtn) hintBtn.style.display = 'none';
        if (taskTitle) taskTitle.textContent = 'Нет заданий';
        if (taskShort) taskShort.textContent = 'Проверьте подключение к серверу';
    }

    function showUI() {
        if (taskImage) taskImage.parentElement.style.display = '';
        if (actionButtons) actionButtons.style.display = '';
        if (progressSection) progressSection.style.display = '';
        if (hintBtn) hintBtn.style.display = '';
    }

    // ==================== ИНИТ ====================
    async function init() {
        loadProgress();
        await fetchTasks();
        if (!allTasks.length) {
            showErrorState();
            pageLoader.classList.add('hidden');
            gameContent.classList.add('visible');
            return;
        }
        showUI();
        const task = getRandomTask();
        if (task) renderTask(task);
        updateProgressUI();
        if (typeof TimerService !== 'undefined' && timerTextEl) {
            TimerService.init(timerTextEl);
            if (TimerService.getSettings().autoStart) TimerService.start();
        }
        pageLoader.classList.add('hidden');
        gameContent.classList.add('visible');
    }

    // ==================== ОБРАБОТЧИКИ ====================
    $('backBtn')?.addEventListener('click', () => go('menu.html'));
    $('profileBtn')?.addEventListener('click', () => go('profile.html'));
    $('settingsBtn')?.addEventListener('click', () => go('settings.html'));
    $('speakBtn')?.addEventListener('click', toggleSpeech);
    $('randomBtn')?.addEventListener('click', () => {
        const t = getRandomTask();
        if (t) renderTask(t);
    });
    $('completeBtn')?.addEventListener('click', () => {
        if (completed >= TOTAL) return;
        completed++;
        saveProgress();
        updateProgressUI();

        // 🎆 ВОЛШЕБНАЯ АНИМАЦИЯ
        playMagicStar(completeBtn, progressFill);

        if (completed >= TOTAL) {
            completed = 0; saveProgress();
            setTimeout(() => go('reward.html'), 1000);
        }
    });
    $('hintBtn')?.addEventListener('click', () => instructionDialog?.showModal());
    $('closeDialogBtn')?.addEventListener('click', () => instructionDialog?.close());
    $('dialogGotItBtn')?.addEventListener('click', () => instructionDialog?.close());
    instructionDialog?.addEventListener('click', (e) => {
        if (e.target === instructionDialog) instructionDialog.close();
    });
    $('retryBtn')?.addEventListener('click', () => {
        if (errorBlock) errorBlock.style.display = 'none';
        init();
    });

    window.addEventListener('pageshow', () => {
        if (typeof TimerService !== 'undefined' && timerTextEl) TimerService.init(timerTextEl);
    });

    init();
})();