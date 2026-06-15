(function () {
    'use strict';
    if (!AuthService.isAuthenticated()) { window.location.href = '/index.html'; return; }

    const $ = (id) => document.getElementById(id);
    const pageLoader = $('pageLoader'), rewardContent = $('rewardContent'), revealOverlay = $('revealOverlay');
    const tasksListContainer = $('tasksListContainer'), congratsText = $('congratsText');
    const menuBtn = $('menuBtn'), playMoreBtn = $('playMoreBtn'), profileBtn = $('profileBtn'), settingsBtn = $('settingsBtn');
    const confettiCanvas = $('confettiCanvas'), applauseAudio = $('applauseAudio');

    function getCompletedKey() { var children=[];try{children=JSON.parse(localStorage.getItem('profileChildren')||'[]');}catch(e){} var idx=parseInt(localStorage.getItem('activeChildIndex')||'0'); if(children.length>idx)return'completedTasks_'+children[idx].id; return'completedTasks'; }
    function loadCompletedTasks() { try{var raw=localStorage.getItem(getCompletedKey());return raw?JSON.parse(raw):[];}catch(e){return[];} }

    function startConfetti() { if(!confettiCanvas)return; var ctx=confettiCanvas.getContext('2d');confettiCanvas.width=window.innerWidth;confettiCanvas.height=window.innerHeight; var particles=[],colors=['#F5B041','#4CAF50','#FF6B6B','#5B9BD5','#FFD700','#FF7B7B','#9B7FD4'],frameCount=0,maxFrames=180; for(var i=0;i<80;i++){particles.push({x:Math.random()*confettiCanvas.width,y:-20-Math.random()*confettiCanvas.height,w:Math.random()*8+4,h:Math.random()*5+2,color:colors[Math.floor(Math.random()*colors.length)],vx:(Math.random()-0.5)*2,vy:Math.random()*3+2,rot:Math.random()*360,rotV:(Math.random()-0.5)*8});} function draw(){if(frameCount>=maxFrames){ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);return;}frameCount++;ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);for(var i=0;i<particles.length;i++){var p=particles[i];ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();p.x+=p.vx;p.y+=p.vy;p.rot+=p.rotV;if(p.y>confettiCanvas.height+20){p.y=-20;p.x=Math.random()*confettiCanvas.width;}}requestAnimationFrame(draw);} draw(); }
    function speakCongrats(text){if(!('speechSynthesis' in window))return;setTimeout(function(){var u=new SpeechSynthesisUtterance(text);u.lang='ru-RU';u.rate=0.85;u.pitch=1.15;window.speechSynthesis.speak(u);},1500);}
    function playApplause(){if(applauseAudio){applauseAudio.volume=0.35;applauseAudio.play().catch(function(){});}}

    function renderTasks(allTasks){ if(!tasksListContainer)return; var lastFive=allTasks.slice(-5); if(!lastFive.length){tasksListContainer.innerHTML='<p style="color:var(--text-muted);text-align:center;">Нет заданий</p>';return;} tasksListContainer.innerHTML=''; lastFive.forEach(function(task){var row=document.createElement('div');row.className='task-row';var labels={easy:'🟢 Лёгкое',medium:'🟡 Среднее',hard:'🔴 Сложное'};row.innerHTML='<img src="image/icons/check.png" alt="✓" class="task-check"><span class="task-name">'+(task.title||'Задание')+'</span><span class="task-badge '+(task.difficulty||'easy')+'">'+(labels[task.difficulty]||'Лёгкое')+'</span>';tasksListContainer.appendChild(row);}); }

    function go(page){document.body.style.opacity='0';document.body.style.transition='opacity 0.2s ease';setTimeout(function(){location.href='/'+page;},200);}

    function init(){ var allTasks=loadCompletedTasks(); if(!allTasks.length){go('menu.html');return;} renderTasks(allTasks); if(congratsText)congratsText.textContent='Ты выполнил 5 заданий и получаешь награду! Ты большой молодец!'; setTimeout(function(){ revealOverlay.classList.add('hidden');rewardContent.style.display='';rewardContent.style.opacity='0';rewardContent.style.transition='opacity 0.5s ease'; setTimeout(function(){rewardContent.style.opacity='1';},50); startConfetti();playApplause();if(congratsText)speakCongrats(congratsText.textContent); },1800); }

    if(menuBtn)menuBtn.addEventListener('click',function(){go('menu.html');});
    if(playMoreBtn)playMoreBtn.addEventListener('click',function(){go('freeplay.html');});
    if(profileBtn)profileBtn.addEventListener('click',function(){go('profile.html');});
    if(settingsBtn)settingsBtn.addEventListener('click',function(){go('settings.html');});
    init();
})();