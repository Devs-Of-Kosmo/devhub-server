document.addEventListener('DOMContentLoaded', function() {
        // URL에서 토큰을 추출하고 로컬 스토리지에 저장
        var urlParams = new URLSearchParams(window.location.search);
        var token = urlParams.get('token');
        console.log('Token from URL:', token);  // URL에서 가져온 토큰을 콘솔에 출력하여 확인

        if (token) {
            localStorage.setItem('accessToken', token);
        } else {
            token = localStorage.getItem('accessToken');
        }
        console.log('Retrieved token:', token);  // 토큰을 콘솔에 출력하여 확인

        if (token) {
            fetch('/user_info', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(response => {
                console.log('Response status:', response.status);  // 응답 상태 코드를 콘솔에 출력
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);  // 응답 데이터를 콘솔에 출력

                if (data.name) {
                    var loginNavItem = document.getElementById('login-nav-item');
                    if (loginNavItem) {
                        loginNavItem.innerHTML = '<a href="/profile" class="nav-link">' + data.name + '님</a>';
                    }
                }
            })
            .catch(error => console.error('Error:', error));
        }
   });