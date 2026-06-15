(function () {
    'use strict';
    if (!AuthService.isAuthenticated()) { window.location.href = '/index.html'; return; }

    var $ = function(id) { return document.getElementById(id); };
    var pageLoader = $('pageLoader'), menuContent = $('menuContent');
    var starsContainer = $('starsContainer'), progressFill = $('progressFill');
    var progressFraction = $('progressFraction'), remainingText = $('remainingText');
    var parentLine = $('parentLine'), childLine = $('childLine');
    var TOTAL = 5, done = 0;

    function getProgressKey() {
        var children = [];
        try { children = JSON.parse(localStorage.getItem('profileChildren')||'[]'); } catch(e) {}
        var idx = parseInt(localStorage.getItem('activeChildIndex')||'0');
        if (children.length > idx) return 'mockProgress_' + children[idx].id;
        return 'mockProgress';
    }

    function loadProgress() { done = parseInt(localStorage.getItem(getProgressKey())) || 0; }

    function showContent() { pageLoader.classList.add('hidden'); menuContent.classList.add('visible'); }

    function loadData() {
        return new Promise(function(resolve) {
            var user = AuthService.getUser();
            var parentName = localStorage.getItem('parentName') || (user && user.parentName) || 'родитель';
            var childName = '';
            try {
                var children = JSON.parse(localStorage.getItem('profileChildren')||'[]');
                var idx = parseInt(localStorage.getItem('activeChildIndex')||'0');
                if (children.length > idx) childName = children[idx].name;
            } catch(e) {}
            resolve({ parentLine: parentName, childLine: childName || 'ребёнок' });
        });
    }

    function updateUI() {
        if (starsContainer) {
            starsContainer.innerHTML = '';
            for (var i = 1; i <= TOTAL; i++) {
                var img = document.createElement('img');
                img.src = i <= done ? 'image/icons/star-filled.png' : 'image/icons/star-empty.png';
                img.alt = i <= done ? 'Выполнено' : 'Не выполнено'; img.className = 'star-icon';
                starsContainer.appendChild(img);
            }
        }
        if (progressFill) progressFill.style.width = ((done/TOTAL)*100) + '%';
        if (progressFraction) progressFraction.textContent = done + '/' + TOTAL;
        if (remainingText) { var left = TOTAL - done; var msgs = {0:'🎉 Молодец!',1:'🔥 Осталось 1!',2:'✨ Осталось 2'}; remainingText.innerHTML = msgs[left] || '📝 Осталось ' + left; }
    }

    function go(page) { document.body.style.opacity='0'; document.body.style.transition='opacity 0.2s ease'; setTimeout(function(){location.href='/'+page;},200); }

    loadProgress();
    loadData().then(function(d) {
        if (parentLine) parentLine.textContent = d.parentLine;
        if (childLine) childLine.textContent = d.childLine;
        updateUI();
        if (typeof TimerService !== 'undefined') { var s = TimerService.getSettings(); if (s.autoStart && !TimerService.isRunning()) TimerService.start(); }
        showContent();
    });

    var profileBtn = $('profileBtn'), settingsBtn = $('settingsBtn'), playBtn = $('playBtn');
    if (profileBtn) profileBtn.addEventListener('click', function(){go('profile.html');});
    if (settingsBtn) settingsBtn.addEventListener('click', function(){go('settings.html');});
    if (playBtn) playBtn.addEventListener('click', function(){if(typeof TimerService!=='undefined'&&!TimerService.isRunning())TimerService.start();go('freeplay.html');});
    window.addEventListener('pageshow', function(){loadProgress();updateUI();if(typeof TimerService!=='undefined')TimerService.init();});
})();