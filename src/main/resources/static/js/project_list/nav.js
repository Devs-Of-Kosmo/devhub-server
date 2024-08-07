document.addEventListener("DOMContentLoaded", function() {
    var body = document.body;
    var menuTrigger = body.querySelector('.menu-trigger');
    var accessToken = localStorage.getItem('accessToken');
    var userEmail = null;

    if (menuTrigger) {
        menuTrigger.addEventListener('click', function() {
            body.classList.toggle('menu-active');
        });
    }

    // 모달 열기 함수
    function openModal(modalId) {
        document.getElementById(modalId).style.display = "flex";
    }

    // 모달 닫기 함수
    window.closeModal = function(modalId) { // window 객체에 함수 할당
        document.getElementById(modalId).style.display = "none";
    }

    // 모달 열기 이벤트
    document.getElementById('send-message').addEventListener('click', function() {
        openModal('sendMessageModal');
    });

    document.getElementById('open-messages').addEventListener('click', function() {
        openModal('messageModal');
    });

    // 모달 닫기 이벤트
    document.querySelectorAll('.close').forEach(function(element) {
        element.addEventListener('click', function() {
            window.closeModal(this.getAttribute('data-close'));
        });
    });

    // 모달 외부 클릭 시 닫기
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            window.closeModal(event.target.id);
        }
    };

    function updateMessageLinksVisibility() {
        if (userEmail != null) {
            $('#send-message').show();
            $('#open-messages').show();
        } else {
            $('#send-message').hide();
            $('#open-messages').hide();
        }
    }

    if (accessToken) {
        $.ajax({
            type: 'GET',
            url: '/api/user/info',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: function(response) {
                userEmail = response.email;
                updateMessageLinksVisibility();
            },
            error: function(xhr, status, error) {
                console.error('사용자 정보를 가져오는데 실패했습니다:', status, error);
                updateMessageLinksVisibility();
            }
        });
    } else {
        updateMessageLinksVisibility();
    }

    $('#logout').on('click', function() {
        $.ajax({
            url: '/api/auth/logout',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: function(response) {
                localStorage.removeItem('accessToken');
                Swal.fire({
                    title: '로그아웃 성공',
                    text: '로그아웃이 완료되었습니다.',
                    icon: 'success',
                    confirmButtonText: '확인'
                }).then(() => {
                    window.location.href = 'http://localhost:8080';
                });
            },
            error: function(xhr, status, error) {
                console.error('로그아웃 요청 중 오류 발생:', error);
                Swal.fire('로그아웃 중 오류가 발생했습니다.', '', 'error');
            }
        });
    });
});
