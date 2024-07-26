document.addEventListener("DOMContentLoaded", function() {
    var body = document.body;
    var menuTrigger = body.querySelector('.menu-trigger');
    var logoutButton = body.querySelector('.logout');

    if (menuTrigger) {
        menuTrigger.addEventListener('click', function() {
            body.classList.toggle('menu-active');
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        window.location.href = '/';  // 로그아웃 후 메인 페이지로 리다이렉트
                    } else {
                        alert('로그아웃에 실패했습니다. 다시 시도해 주세요.');
                    }
                })
                .catch(error => {
                    console.error('로그아웃 중 오류 발생:', error);
                    alert('로그아웃 중 오류가 발생했습니다. 다시 시도해 주세요.');
                });
        });
    }
});
