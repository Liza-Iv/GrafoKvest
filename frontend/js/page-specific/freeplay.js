/**
 * Свободная игра — главный модуль.
 * Задания из БД, прогресс, озвучка, персонажи, офлайн-сохранение.
 */
(function () {
    'use strict';
    if (!AuthService.isAuthenticated()) { window.location.href = '/index.html'; return; }

    // ==================== DOM-ЭЛЕМЕНТЫ ====================
    const $ = (id) => document.getElementById(id);
    const pageLoader = $('pageLoader'), gameContent = $('gameContent'), errorBlock = $('errorBlock');
    const taskImage = $('taskImage'), taskTitle = $('taskTitle'), taskShort = $('taskShort');
    const actionButtons = $('actionButtons'), progressSection = $('progressSection');
    const starsContainer = $('starsContainer'), progressFill = $('progressFill');
    const progressFraction = $('progressFraction'), progressMessage = $('progressMessage');
    const hintBtn = $('hintBtn'), speakBtn = $('speakBtn'), speakIcon = $('speakIcon'), speakLabel = $('speakLabel');
    const instructionDialog = $('instructionDialog'), dialogTitle = $('dialogTitle'), dialogDifficulty = $('dialogDifficulty'), dialogTime = $('dialogTime');
    const dialogMaterials = $('dialogMaterials'), dialogHint = $('dialogHint'), dialogFullText = $('dialogFullText'), dialogDevelops = $('dialogDevelops');
    const characterWrapper = $('characterWrapper'), characterImage = $('characterImage'), characterSpeech = $('characterSpeech');

    const TOTAL = 5;
    let allTasks = [], currentTask = null, completed = 0, isSpeaking = false, completeCooldown = false;

    // ==================== АКТИВНЫЙ РЕБЁНОК ====================

    function getActiveChild() {
        try { var children = JSON.parse(localStorage.getItem('profileChildren')||'[]'), idx = parseInt(localStorage.getItem('activeChildIndex')||'0'); if (children.length > idx) return children[idx]; } catch(e) {} return null;
    }
    function getProgressKey() { var child = getActiveChild(); return child ? 'mockProgress_' + child.id : 'mockProgress'; }
    function getCompletedKey() { var child = getActiveChild(); return child ? 'completedTasks_' + child.id : 'completedTasks'; }

    function refreshActiveChild() {
        var child = getActiveChild();
        if (child) { completed = parseInt(localStorage.getItem(getProgressKey())) || 0; updateProgressUI(); }
    }

    // ==================== ЗАГРУЗКА ЗАДАНИЙ ====================

    async function fetchTasks() {
        try { const res = await fetch('/api/tasks'); if (!res.ok) throw new Error('HTTP '+res.status); const data = await res.json(); if (!Array.isArray(data)||data.length===0) throw new Error('Нет заданий'); allTasks = data; } catch(err) { allTasks = []; }
    }

    function loadProgress() { completed = parseInt(localStorage.getItem(getProgressKey())) || 0; }
    function saveProgress() { localStorage.setItem(getProgressKey(), completed); }

    // ==================== ОТРИСОВКА ====================

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
        if (progressFill) progressFill.style.width = ((completed/TOTAL)*100) + '%';
        if (progressFraction) progressFraction.textContent = completed + '/' + TOTAL;
        if (progressMessage) { var left = TOTAL - completed; var msgs = {0:'🎉 Молодец!',1:'🔥 Осталось 1!',2:'✨ Осталось 2'}; progressMessage.textContent = msgs[left] || '📝 Осталось ' + left; }
    }

    function getCompletedIds() { try { var raw = localStorage.getItem(getCompletedKey()); var arr = raw ? JSON.parse(raw) : []; return arr.map(function(t){return t.id;}); } catch(e) { return []; } }

    function getRandomTask() {
        if (!allTasks.length) return null;
        var completedIds = getCompletedIds();
        var others = allTasks.filter(function(t){ if(currentTask&&t.id===currentTask.id)return false; if(completedIds.indexOf(t.id)!==-1)return false; return true; });
        if (others.length === 0) { localStorage.removeItem(getCompletedKey()); return allTasks[Math.floor(Math.random()*allTasks.length)]; }
        return others[Math.floor(Math.random()*others.length)];
    }

    function renderTask(task) {
        if (!task) return; stopSpeech(); currentTask = task;
        if (taskImage) { taskImage.style.opacity='0'; setTimeout(function(){ taskImage.src = task.image || 'image/tasks/task_default.jpg'; taskImage.alt=task.title||''; taskImage.style.opacity='1'; },150); }
        if (taskTitle) taskTitle.textContent = task.title || '';
        if (taskShort) taskShort.textContent = task.shortText || '';
        if (dialogTitle) dialogTitle.textContent = task.title || '';
        if (dialogDifficulty) { var diffNumber=parseInt(task.difficulty)||1; var map={1:'Лёгкое',2:'Среднее',3:'Сложное'}; dialogDifficulty.textContent=map[diffNumber]||'—'; }
        if (dialogTime) dialogTime.textContent = task.timeMinutes ? '~'+task.timeMinutes+' мин' : '—';
        if (dialogMaterials) dialogMaterials.textContent = task.materials || '';
        if (dialogHint) dialogHint.textContent = task.hint || '';
        if (dialogFullText) dialogFullText.textContent = task.fullText || '';
        if (dialogDevelops) dialogDevelops.textContent = task.develops || '';
    }

    // ==================== ОЗВУЧКА ====================

    function stopSpeech() { if('speechSynthesis' in window) window.speechSynthesis.cancel(); isSpeaking=false; if(speakIcon)speakIcon.src='image/icons/speak.png'; if(speakLabel)speakLabel.textContent='Озвучить'; if(speakBtn)speakBtn.classList.remove('speaking'); }

    function toggleSpeech() {
        if(isSpeaking){stopSpeech();return;}
        if(!currentTask||!currentTask.fullText)return;
        if(!('speechSynthesis' in window))return;
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(currentTask.fullText);
        u.lang='ru-RU';u.rate=0.9;u.pitch=1.1;
        u.onstart=function(){isSpeaking=true;if(speakIcon)speakIcon.src='image/icons/stop.png';if(speakLabel)speakLabel.textContent='Стоп';if(speakBtn)speakBtn.classList.add('speaking');};
        u.onend=function(){stopSpeech();}; u.onerror=function(){stopSpeech();};
        window.speechSynthesis.speak(u);
    }

    // ==================== ПЕРСОНАЖ И ЗВЁЗДЫ ====================

    function showCharacter(task) {
        if (!task || !task.characterImage) return;
        if (characterWrapper && characterImage && characterSpeech) {
            characterImage.src = task.characterImage;
            var speeches = ['Отлично!','Молодец!','Здорово!','Так держать!','Умница!','Супер!','Замечательно!'];
            characterSpeech.textContent = speeches[Math.floor(Math.random() * speeches.length)];
            characterWrapper.style.display = '';
            setTimeout(function() { characterWrapper.style.display = 'none'; }, 2500);
        }
    }

    function spawnFallingStars() {
        for (var i = 0; i < 8; i++) {
            var star = document.createElement('img');
            star.src = 'image/icons/star-filled.png';
            star.className = 'falling-star';
            star.style.left = Math.random() * 90 + '%';
            star.style.animationDelay = Math.random() * 0.5 + 's';
            star.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
            star.style.width = (18 + Math.random() * 18) + 'px';
            star.style.height = star.style.width;
            document.body.appendChild(star);
            setTimeout(function() { star.remove(); }, 2500);
        }
    }

    // ==================== UI-СОСТОЯНИЯ ====================

    function showErrorState() { if(errorBlock)errorBlock.style.display=''; if(taskImage)taskImage.parentElement.style.display='none'; if(actionButtons)actionButtons.style.display='none'; if(progressSection)progressSection.style.display='none'; if(hintBtn)hintBtn.style.display='none'; if(taskTitle)taskTitle.textContent='Нет заданий'; if(taskShort)taskShort.textContent='Проверьте подключение'; }
    function showUI() { if(taskImage)taskImage.parentElement.style.display=''; if(actionButtons)actionButtons.style.display=''; if(progressSection)progressSection.style.display=''; if(hintBtn)hintBtn.style.display=''; }

    function go(page) { stopSpeech(); document.body.style.opacity='0';document.body.style.transition='opacity 0.2s ease'; setTimeout(function(){location.href='/'+page;},200); }

    // ==================== ИНИЦИАЛИЗАЦИЯ ====================

    async function init() {
        refreshActiveChild();
        loadProgress();
        await fetchTasks();
        if (!allTasks.length) { showErrorState(); pageLoader.classList.add('hidden'); gameContent.classList.add('visible'); return; }
        showUI(); var task = getRandomTask(); if (task) renderTask(task); updateProgressUI();
        if (typeof TimerService !== 'undefined') { var settings = TimerService.getSettings(); if (settings.autoStart && !TimerService.isRunning()) TimerService.start(); }
        pageLoader.classList.add('hidden'); gameContent.classList.add('visible');
    }

    // ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================

    var backBtn=$('backBtn'),profileBtn=$('profileBtn'),settingsBtn=$('settingsBtn'),randomBtn=$('randomBtn'),completeBtn=$('completeBtn'),closeDialogBtn=$('closeDialogBtn'),dialogGotItBtn=$('dialogGotItBtn'),retryBtn=$('retryBtn');

    if(backBtn)backBtn.addEventListener('click',function(){go('menu.html');});
    if(profileBtn)profileBtn.addEventListener('click',function(){go('profile.html');});
    if(settingsBtn)settingsBtn.addEventListener('click',function(){go('settings.html');});
    if(speakBtn)speakBtn.addEventListener('click',function(){toggleSpeech();});
    if(randomBtn)randomBtn.addEventListener('click',function(){var t=getRandomTask();if(t)renderTask(t);});

    // Кнопка «Выполнил»
    if(completeBtn)completeBtn.addEventListener('click',function(){
        if(completeCooldown||completed>=TOTAL)return;
        completeCooldown=true;
        var btnSpan=completeBtn.querySelector('span'),originalText=btnSpan?btnSpan.textContent:'Выполнил';
        completeBtn.disabled=true;if(btnSpan)btnSpan.textContent='✓';

        // Сохранить задание
        var completedTasks=[];try{var raw=localStorage.getItem(getCompletedKey());completedTasks=raw?JSON.parse(raw):[];}catch(e){}
        completedTasks.push({id:currentTask?currentTask.id:0,title:currentTask?currentTask.title:'Задание',difficulty:currentTask?currentTask.difficulty:'easy'});
        localStorage.setItem(getCompletedKey(),JSON.stringify(completedTasks));
        completed++;saveProgress();

        showCharacter(currentTask);
        spawnFallingStars();

        var magicStar=$('magicStar');if(magicStar){magicStar.classList.remove('fly');void magicStar.offsetWidth;magicStar.classList.add('fly');}
        updateProgressUI();

        // Сохранить в БД (или в офлайн-очередь)
        var child=getActiveChild();
        if(currentTask&&currentTask.id&&child&&child.id){
            var token = AuthService.getToken();
            var url = '/api/progress/'+currentTask.id+'?childId='+child.id;
            var opts = { method:'POST', headers:{'Authorization':'Bearer '+(token||'')} };
            fetch(url, opts).catch(function() {
                window.addToSyncQueue(url, opts);
            });
        }

        setTimeout(function(){
            var nextTask=getRandomTask();if(nextTask)renderTask(nextTask);
            completeCooldown=false;completeBtn.disabled=false;
            if(btnSpan)btnSpan.textContent=originalText;
            if(completed>=TOTAL){completeBtn.classList.add('reward');if(btnSpan)btnSpan.textContent='🎉 Награда!';}
        },1000);

        if(completed>=TOTAL){setTimeout(function(){completed=0;saveProgress();go('reward.html');},2500);}
    });

    if(hintBtn)hintBtn.addEventListener('click',function(){if(instructionDialog)instructionDialog.showModal();});
    if(closeDialogBtn)closeDialogBtn.addEventListener('click',function(){if(instructionDialog)instructionDialog.close();});
    if(dialogGotItBtn)dialogGotItBtn.addEventListener('click',function(){if(instructionDialog)instructionDialog.close();});
    if(instructionDialog)instructionDialog.addEventListener('click',function(e){if(e.target===instructionDialog)instructionDialog.close();});
    if(retryBtn)retryBtn.addEventListener('click',function(){if(errorBlock)errorBlock.style.display='none';init();});

    window.addEventListener('pageshow',function(){refreshActiveChild();if(typeof TimerService!=='undefined')TimerService.init();});

    init();
})();