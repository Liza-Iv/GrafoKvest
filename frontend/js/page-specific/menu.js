(function () {
    'use strict';

    if (!AuthService.isAuthenticated()) {
        window.location.href = '/index.html';
        return;
    }

    var $ = function(id) { return document.getElementById(id); };
    var pageLoader = $('pageLoader');
    var menuContent = $('menuContent');
    var starsContainer = $('starsContainer');
    var progressFill = $('progressFill');
    var progressFraction = $('progressFraction');
    var remainingText = $('remainingText');
    var userNameSpan = $('userNameSpan');
    var timerTextEl = document.querySelector('.timer-text');

    var TOTAL = 5;
    var done = 0;

    function showContent() {
        pageLoader.classList.add('hidden');
        menuContent.classList.add('visible');
    }

    async function loadData() {
        return new Promise(r => setTimeout(() => {
            const p = parseInt(localStorage.getItem(getProgressKey())) || 0;
            const user = AuthService.getUser();
            const name = (user && user.parentName) || (user && user.email ? user.email.split('@')[0] : 'родитель');
            r({ done: p, name: name });
        }, 700));
    }

    function updateUI() {
        if (starsContainer) {
            starsContainer.innerHTML = '';
            for (var i = 1; i <= TOTAL; i++) {
                var img = document.createElement('img');
                img.src = i <= done ? 'image/icons/star-filled.png' : 'image/icons/star-empty.png';
                img.alt = i <= done ? 'Выполнено' : 'Не выполнено';
                img.className = 'star-icon';
                starsContainer.appendChild(img);
            }
            starsContainer.setAttribute('aria-label', 'Прогресс: ' + done + ' из ' + TOTAL);
        }
        if (progressFill) {
            var pct = (done / TOTAL) * 100;
            progressFill.style.width = pct + '%';
            progressFill.parentElement.setAttribute('aria-valuenow', pct);
        }
        if (progressFraction) progressFraction.textContent = done + '/' + TOTAL;
        if (remainingText) {
            var left = TOTAL - done;
            var msgs = { 0:'🎉 Молодец! Все задания выполнены!', 1:'🔥 Почти готово! Осталось 1 задание!', 2:'✨ Ещё чуть-чуть! Осталось 2 задания' };
            remainingText.innerHTML = msgs[left] || '📝 Осталось ' + left + ' заданий';
        }
    }

    function go(page) {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.2s ease';
        setTimeout(function() { location.href = '/' + page; }, 200);
    }

     {
        done = d.done;
        if (userNameSpan) userNameSpan.textContent = d.name;
        updateUI();
        if (typeof TimerService !== 'undefined' && timerTextEl) {
            TimerService.init(timerTextEl);
            if (TimerService.getSettings().autoStart) TimerService.start();
        }
        showContent();
    });

    var profileBtn = $('profileBtn');
    var settingsBtn = $('settingsBtn');
    var playBtn = $('playBtn');

    if (profileBtn) profileBtn.addEventListener('click', function() { go('profile.html'); });
    if (settingsBtn) settingsBtn.addEventListener('click', function() { go('settings.html'); });
    if (playBtn) playBtn.addEventListener('click', function() {
        if (typeof TimerService !== 'undefined' && !TimerService.isRunning()) TimerService.start();
        go(done >= TOTAL ? 'reward.html' : 'freeplay.html');
    });

    window.addEventListener('pageshow', function() {
        if (typeof TimerService !== 'undefined' && timerTextEl) TimerService.init(timerTextEl);
    });
})();