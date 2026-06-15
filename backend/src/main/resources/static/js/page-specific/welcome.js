(function () {
    'use strict';
    const authDialog = document.getElementById('authDialog'), startBtn = document.getElementById('startBtn'), settingsBtn = document.getElementById('globalSettingsBtn');
    const closeDialogBtn = document.getElementById('closeDialogBtn'), loginForm = document.getElementById('loginForm'), registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab'), registerTab = document.getElementById('registerTab'), tabBtns = document.querySelectorAll('.tab-btn');
    [loginTab, registerTab].forEach(function(tab) { tab.style.transition = 'opacity 0.2s ease, transform 0.2s ease'; });

    function navigateTo(page) { document.body.style.transition='opacity 0.2s ease'; document.body.style.opacity='0'; setTimeout(function(){window.location.href=page;},200); }
    startBtn.addEventListener('click', function() { AuthService.isAuthenticated() ? navigateTo('/menu.html') : openAuthDialog(); });
    settingsBtn.addEventListener('click', function() { navigateTo('/settings.html'); });

    function openAuthDialog() { clearAllErrors(); loginForm.reset(); registerForm.reset(); switchTab('login'); authDialog.showModal(); setTimeout(function(){document.getElementById('loginEmail').focus();},350); }
    function closeAuthDialog() { authDialog.close(); startBtn.focus(); }
    closeDialogBtn.addEventListener('click', closeAuthDialog);
    authDialog.addEventListener('cancel', function(e) { e.preventDefault(); closeAuthDialog(); });
    tabBtns.forEach(function(btn) { btn.addEventListener('click', function() { switchTab(btn.getAttribute('data-tab')); }); });

    function switchTab(tabName) { var isLogin=tabName==='login'; tabBtns.forEach(function(b){var active=b.getAttribute('data-tab')===tabName;b.classList.toggle('active',active);b.setAttribute('aria-selected',active?'true':'false');}); var showTab=isLogin?loginTab:registerTab,hideTab=isLogin?registerTab:loginTab; if(hideTab.classList.contains('active')){hideTab.style.opacity='0';hideTab.style.transform='translateY(8px)';} setTimeout(function(){hideTab.classList.remove('active');showTab.classList.add('active');showTab.style.opacity='1';showTab.style.transform='translateY(0)';var firstInput=showTab.querySelector('input');if(firstInput)firstInput.focus();},150); clearAllErrors(); }

    var roleBtns=document.querySelectorAll('.role-btn'),childNameGroup=document.getElementById('childNameGroup'),regChildNameInput=document.getElementById('regChildName'),selectedRole='parent';
    roleBtns.forEach(function(btn){btn.addEventListener('click',function(){selectedRole=btn.getAttribute('data-role');roleBtns.forEach(function(b){b.classList.remove('active');b.setAttribute('aria-pressed','false');});btn.classList.add('active');btn.setAttribute('aria-pressed','true');if(selectedRole==='parent'){childNameGroup.style.display='flex';regChildNameInput.setAttribute('required','');}else{childNameGroup.style.display='none';regChildNameInput.removeAttribute('required');clearError('regChildName');}});});
    document.querySelectorAll('.toggle-password').forEach(function(btn){btn.addEventListener('click',function(){var targetId=btn.getAttribute('data-target'),input=document.getElementById(targetId);if(!input)return;var isPassword=input.type==='password';input.type=isPassword?'text':'password';btn.textContent=isPassword?'🙈':'👁';});});

    var ERROR_IDS=['loginEmail','loginPassword','regParentName','regEmail','regPassword','regConfirmPassword','regChildName'];
    function showError(inputId,message){var input=document.getElementById(inputId),errorEl=document.getElementById(inputId+'Error');if(input){input.classList.add('input-error');input.style.animation='none';input.offsetHeight;input.style.animation='shake 0.4s ease';}if(errorEl)errorEl.textContent=message;}
    function clearError(inputId){var input=document.getElementById(inputId),errorEl=document.getElementById(inputId+'Error');if(input)input.classList.remove('input-error');if(errorEl)errorEl.textContent='';}
    function clearAllErrors(){ERROR_IDS.forEach(clearError);}
    document.querySelectorAll('.input-group input').forEach(function(input){input.addEventListener('input',function(){clearError(input.id);});});

    loginForm.addEventListener('submit',function(e){e.preventDefault();clearAllErrors();var email=document.getElementById('loginEmail').value.trim(),password=document.getElementById('loginPassword').value;if(!validateLoginFields(email,password))return;performLogin(email,password);});
    function performLogin(email,password){var btn=document.getElementById('loginBtn');setLoading(btn,true,'Входим...');AuthService.login(email,password).then(function(){authDialog.close();navigateTo('/menu.html');}).catch(function(err){showError('loginEmail',err.message||'Ошибка соединения');}).finally(function(){setLoading(btn,false,'Войти');});}
    function validateLoginFields(email,password){var valid=true;if(!email){showError('loginEmail','Введите email');valid=false;}else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){showError('loginEmail','Некорректный email');valid=false;}if(!password){showError('loginPassword','Введите пароль');valid=false;}return valid;}

    registerForm.addEventListener('submit',function(e){e.preventDefault();clearAllErrors();var data={parentName:document.getElementById('regParentName').value.trim(),email:document.getElementById('regEmail').value.trim(),password:document.getElementById('regPassword').value,confirmPassword:document.getElementById('regConfirmPassword').value,childName:document.getElementById('regChildName').value.trim(),role:selectedRole};if(!validateRegisterFields(data))return;performRegister(data);});

    function performRegister(data) {
        var btn = document.getElementById('registerBtn');
        setLoading(btn, true, 'Регистрируем...');

        AuthService.register(data)
            .then(function() {
                authDialog.close();  // ✅ сначала закрыть попап
                // ✅ потом показать уведомление
                setTimeout(function() {
                    showToast('✅ Регистрация успешна! Теперь войдите.', 'success');
                }, 400);  // задержка после анимации закрытия попапа

                switchTab('login');
                document.getElementById('loginEmail').value = data.email;
                document.getElementById('loginPassword').value = '';
            })
            .catch(function(err) {
                showToast('❌ ' + (err.message || 'Ошибка регистрации'), 'error');
            })
            .finally(function() {
                setLoading(btn, false, 'Зарегистрироваться');
            });
    }

    function validateRegisterFields(d){var valid=true;if(!d.parentName){showError('regParentName','Введите имя');valid=false;}else if(d.parentName.length<2){showError('regParentName','Слишком короткое');valid=false;}if(!d.email){showError('regEmail','Введите email');valid=false;}else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)){showError('regEmail','Некорректный email');valid=false;}if(!d.password){showError('regPassword','Введите пароль');valid=false;}else if(d.password.length<6){showError('regPassword','Минимум 6 символов');valid=false;}if(!d.confirmPassword){showError('regConfirmPassword','Подтвердите пароль');valid=false;}else if(d.password!==d.confirmPassword){showError('regConfirmPassword','Пароли не совпадают');valid=false;}if(d.role==='parent'&&!d.childName){showError('regChildName','Введите имя ребёнка');valid=false;}return valid;}

    function setLoading(btn,isLoading,text){btn.disabled=isLoading;btn.textContent=text;btn.style.cursor=isLoading?'wait':'pointer';}

    function showToast(message, type) {
        type = type || 'info';
        var toast = document.createElement('div');
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');

        var bg = type === 'success' ? 'var(--accent-green)' :
                 type === 'error' ? 'var(--error-red)' : 'var(--accent-blue)';

        Object.assign(toast.style, {
            position: 'fixed',
            top: '24px',           // ✅ сверху, а не снизу
            left: '50%',
            transform: 'translateX(-50%) translateY(-20px)',
            background: bg,
            color: 'white',
            padding: '16px 28px',   // ✅ крупнее
            borderRadius: 'var(--radius-lg)',
            fontSize: '18px',       // ✅ крупнее
            fontWeight: '700',
            fontFamily: "'Nunito', sans-serif",
            boxShadow: 'var(--shadow-lg)',
            zIndex: '99999',        // ✅ выше попапа
            opacity: '0',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            pointerEvents: 'none'
        });

        document.body.appendChild(toast);

        requestAnimationFrame(function() {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        // ✅ Держится 4 секунды (дольше)
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(function() { toast.remove(); }, 400);
        }, 4000);
    }

    document.getElementById('forgotPasswordBtn').addEventListener('click',function(){showToast('Восстановление пароля будет доступно после подключения почтового сервера');});
    document.getElementById('googleLoginBtn').addEventListener('click',function(){showToast('Вход через Google — после подключения бэкенда');});
    document.getElementById('googleRegisterBtn').addEventListener('click',function(){showToast('Регистрация через Google — после подключения бэкенда');});
})();