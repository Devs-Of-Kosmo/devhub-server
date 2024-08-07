document.addEventListener('DOMContentLoaded', function() {
    // URL에서 토큰을 추출하여 로컬 스토리지에 저장
    var urlParams = new URLSearchParams(window.location.search);
    var token = urlParams.get('token');

    if (token) {
        localStorage.setItem('accessToken', token);
    } else {
        token = localStorage.getItem('accessToken');
    }

    // 보안을 위해 토큰은 콘솔에 출력하지 않는 것이 좋습니다.
    console.log('Token 상태:', token ? '토큰이 성공적으로 저장되었습니다.' : '토큰이 없습니다.');

    if (token) {
        fetch('http://localhost:8080/api/personal/repo/list', { // 스프링 부트 API의 절대 경로
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized access - please log in again');
                } else if (response.status === 404) {
                    throw new Error('API endpoint not found');
                }
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Personal projects:', data);

            // projects 데이터를 로컬 스토리지에 저장
            localStorage.setItem('projects', JSON.stringify(data));
        })
        .catch(error => {
            console.error('Error fetching personal projects:', error);
            alert('Error fetching personal projects: ' + error.message);
        });
    } else {
        alert('Token is missing. Please log in.');
    }
});
