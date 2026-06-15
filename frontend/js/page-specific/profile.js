(function () {
    'use strict';
    if (!AuthService.isAuthenticated()) { window.location.href = '/index.html'; return; }

    const $ = (id) => document.getElementById(id);
    const pageLoader = $('pageLoader'), profileContent = $('profileContent'), parentNameSpan = $('parentNameSpan');
    const childrenList = $('childrenList'), familyMembersList = $('familyMembersList'), statsSection = $('statsSection');
    const todayBar = $('todayBar'), todayText = $('todayText'), weekBar = $('weekBar'), weekText = $('weekText');
    const addChildDialog = $('addChildDialog'), editNameDialog = $('editNameDialog'), addParentDialog = $('addParentDialog'), familyAnimation = $('familyAnimation');

    let profileData = null, activeChildIndex = parseInt(localStorage.getItem('activeChildIndex') || '0'), editingTarget = null;
    // ✅ СЮДА — анимация звёздного неба
    function showStarsSky() {
        var sky = document.createElement('div');
        sky.className = 'stars-sky';
        document.body.appendChild(sky);
        for (var i = 0; i < 30; i++) {
            var star = document.createElement('div');
            star.className = 'sky-star';
            star.style.left = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 1.2 + 's';
            star.style.animationDuration = (1 + Math.random() * 2) + 's';
            sky.appendChild(star);
        }
        setTimeout(function() { sky.remove(); }, 3000);
    }

    // ✅ Обработчик клика
    if (totalStarsEl) {
        totalStarsEl.addEventListener('click', showStarsSky);
        totalStarsEl.style.cursor = 'pointer';
    }
    function getAgeWord(age) { if(!age)return'';if(age%10===1&&age!==11)return'год';if([2,3,4].indexOf(age%10)!==-1&&[12,13,14].indexOf(age)===-1)return'года';return'лет'; }

    function getLocalProfile() { var user=AuthService.getUser();var savedChildren=[];try{savedChildren=JSON.parse(localStorage.getItem('profileChildren')||'[]');}catch(e){} if(!savedChildren.length&&user&&user.childName){savedChildren=[{id:Date.now(),name:user.childName,age:null,totalStars:0,todayProgress:0,totalTasks:5,weekProgress:0}];localStorage.setItem('profileChildren',JSON.stringify(savedChildren));} return {parentName:localStorage.getItem('parentName')||(user&&user.parentName)||'родитель',parentEmail:(user&&user.email)||'',children:savedChildren,familyMembers:[]}; }

    async function loadProfile() {
        try {
            var token = AuthService.getToken();
            const res = await fetch('/api/profile', {
                headers: { 'Authorization': 'Bearer ' + (token || '') }
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            profileData = await res.json();
            if (profileData.children) {
                localStorage.setItem('profileChildren', JSON.stringify(profileData.children));
            }
        } catch(err) {
            profileData = getLocalProfile();
        }
        var user = AuthService.getUser();
        if (user && user.parentName && profileData) {
            profileData.parentName = user.parentName;
        }
    }

    async function loadAllProgress() {
        if (!profileData || !profileData.children) return;
        for (let i = 0; i < profileData.children.length; i++) {
            var child = profileData.children[i];
            try {
                var token = AuthService.getToken();
                const res = await fetch('/api/progress/' + child.id, {
                    headers: { 'Authorization': 'Bearer ' + (token || '') }
                });
                if (res.ok) {
                    var prog = await res.json();
                    child.todayProgress = prog.todayCount || 0;
                    child.weekProgress = prog.weekCount || 0;
                    child.totalStars = prog.totalCount || 0;
                }
            } catch(e) {
                // ✅ БД недоступна — взять из localStorage
                var completedKey = 'completedTasks_' + child.id;
                try {
                    var raw = localStorage.getItem(completedKey);
                    var tasks = raw ? JSON.parse(raw) : [];
                    child.totalStars = tasks.length;
                    child.todayProgress = tasks.length;
                    child.weekProgress = tasks.length;
                } catch(e2) {}
            }
        }
    }


    function renderParent() { if(parentNameSpan&&profileData)parentNameSpan.textContent=profileData.parentName||'родитель'; }

    function renderFamilyMembers() { if(!familyMembersList)return; var members=(profileData&&profileData.familyMembers)?profileData.familyMembers:[]; familyMembersList.innerHTML=''; if(!members.length){familyMembersList.innerHTML='<p style="color:var(--text-muted);font-size:13px;">Добавьте второго родителя</p>';return;} var icons={father:'👨',mother:'👩',grandma:'👵',grandpa:'👴'}; members.forEach(function(m,i){var card=document.createElement('div');card.className='family-member-card';card.style.animation='fadeInUp 0.4s ease forwards';card.style.animationDelay=(i*0.08)+'s';card.innerHTML='<span class="role-icon">'+(icons[m.role]||'👤')+'</span> '+m.name;familyMembersList.appendChild(card);}); }

    function renderChildren() { if(!childrenList||!profileData)return; var children=profileData.children||[]; childrenList.innerHTML=''; if(!children.length){childrenList.innerHTML='<div style="text-align:center;padding:32px;"><p style="color:var(--text-muted);">Добавьте первого ребёнка!</p></div>';return;} children.forEach(function(child,index){var isActive=index===activeChildIndex;var card=document.createElement('div');card.className='child-card'+(isActive?' active':'');card.setAttribute('data-index',index);card.style.animation='fadeInUp 0.4s ease forwards';card.innerHTML='<div class="child-card-avatar">'+(child.name?child.name.charAt(0).toUpperCase():'?')+'</div><div class="child-card-info"><div class="child-card-name-row"><span class="child-card-name">'+(child.name||'Без имени')+'</span><button class="edit-child-name-btn" data-index="'+index+'" aria-label="Редактировать"><img src="image/icons/edit.png" alt="" width="14" height="14"></button></div><div class="child-card-details'+(isActive?' visible':'')+'">'+(child.age?'<div class="child-card-age">'+child.age+' '+getAgeWord(child.age)+'</div>':'')+'<div class="child-card-stars"><img src="image/icons/star-filled.png" alt=""> '+(child.totalStars||0)+'</div><div class="child-card-today">Сегодня: '+(child.todayProgress||0)+'/'+(child.totalTasks||5)+'</div></div></div><div class="child-card-select">'+(isActive?'✓':'→')+'</div>';card.addEventListener('click',function(e){if(e.target.closest('.edit-child-name-btn'))return;if(activeChildIndex!==index){activeChildIndex=index;localStorage.setItem('activeChildIndex',index);renderChildren();renderStats();}});childrenList.appendChild(card);}); document.querySelectorAll('.edit-child-name-btn').forEach(function(btn){btn.addEventListener('click',function(e){e.stopPropagation();var idx=parseInt(btn.getAttribute('data-index'));editingTarget=idx;$('editDialogTitle').textContent='Редактировать данные ребёнка';$('editNameInput').value=profileData.children[idx].name||'';$('editAgeInput').value=profileData.children[idx].age||'';$('editAgeGroup').style.display='';editNameDialog.showModal();});}); }

    function renderStats() {
        if (!profileData || !statsSection) return;
        var children = profileData.children || [], child = children[activeChildIndex];
        if (!child) { statsSection.style.display = 'none'; return; }
        statsSection.style.display = '';

        // Сегодня — цель 5 (свободная игра)
        var todayCount = child.todayProgress || 0;
        var todayTarget = 5;
        var todayPct = Math.min((todayCount / todayTarget) * 100, 100);
        if (todayBar) todayBar.style.width = todayPct + '%';
        if (todayText) todayText.textContent = todayCount + '/' + todayTarget + ' заданий сегодня';

        // За неделю — цель 5×7 = 35 (если каждый день по 5)
        var weekCount = child.weekProgress || 0;
        var weekTarget = 35;
        var weekPct = Math.min((weekCount / weekTarget) * 100, 100);
        if (weekBar) weekBar.style.width = weekPct + '%';
        if (weekText) weekText.textContent = weekCount + '/' + weekTarget + ' заданий за неделю';

        // Всего звёзд
        if (totalStarsEl) totalStarsEl.textContent = '⭐ ' + (child.totalStars || 0);
    }

    function go(page){document.body.style.opacity='0';document.body.style.transition='opacity 0.2s ease';setTimeout(function(){location.href='/'+page;},200);}

    $('editParentNameBtn').addEventListener('click',function(){editingTarget='parent';$('editDialogTitle').textContent='Редактировать имя';$('editNameInput').value=profileData?profileData.parentName||'':'';$('editAgeGroup').style.display='none';editNameDialog.showModal();});
    $('saveEditBtn').addEventListener('click', function() {
        var newName = $('editNameInput').value.trim();
        if (!newName) { $('editNameError').textContent = 'Введите имя'; return; }

        if (editingTarget === 'parent') {
            profileData.parentName = newName;
            localStorage.setItem('parentName', newName);
            var user = AuthService.getUser();
            if (user) { user.parentName = newName; AuthService.setSession(AuthService.getToken(), user); }

            var token = AuthService.getToken();
            fetch('/api/profile/update-name', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (token || '')
                },
                body: JSON.stringify({ fullName: newName })
            }).catch(function() {});
            renderParent();
        }
        editNameDialog.close();
    });
    $('closeEditDialog').addEventListener('click',function(){editNameDialog.close();});
    $('cancelEditBtn').addEventListener('click',function(){editNameDialog.close();});
    $('addParentBtn').addEventListener('click',function(){$('secondParentName').value='';addParentDialog.showModal();});
    $('saveParentBtn').addEventListener('click',async function(){var name=$('secondParentName').value.trim();if(!name){$('secondParentError').textContent='Введите имя';return;}try{await fetch('/api/profile/family',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name,role:$('secondParentRole').value})});await loadProfile();}catch(e){}addParentDialog.close();renderFamilyMembers();familyAnimation.style.display='';setTimeout(function(){familyAnimation.style.display='none';},3000);});
    $('closeAddParentDialog').addEventListener('click',function(){addParentDialog.close();});
    $('cancelAddParentBtn').addEventListener('click',function(){addParentDialog.close();});
    $('addChildBtn').addEventListener('click',function(){addChildDialog.showModal();});
    $('closeAddChildDialog').addEventListener('click',function(){addChildDialog.close();});
    $('cancelAddChildBtn').addEventListener('click',function(){addChildDialog.close();});

    $('saveChildBtn').addEventListener('click', async function() {
        var name = $('childName').value.trim();
        var age = $('childAge').value ? parseInt($('childAge').value) : null;
        if (!name) { $('childNameError').textContent = 'Введите имя'; return; }
        try {
            var token = AuthService.getToken();
            await fetch('/api/profile/child', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (token || '')
                },
                body: JSON.stringify({ name: name, age: age })
            });
            await loadProfile();
            await loadAllProgress();
        } catch(e) { /* fallback */ }
        addChildDialog.close();
        activeChildIndex = profileData.children.length - 1;
        localStorage.setItem('activeChildIndex', activeChildIndex);
        renderChildren();
        renderStats();
    });
    $('settingsBtn').addEventListener('click',function(){go('settings.html');});
    $('goToMenuBtn').addEventListener('click',function(){go('menu.html');});
    $('goToSettingsBtn').addEventListener('click',function(){go('settings.html');});
    $('logoutBtn').addEventListener('click',function(){AuthService.logout();});

    async function init() {
        await loadProfile();
        await loadAllProgress();
        renderParent();
        renderFamilyMembers();
        renderChildren();
        renderStats();
        pageLoader.classList.add('hidden');
        profileContent.classList.add('visible');
    }
    init();
})();