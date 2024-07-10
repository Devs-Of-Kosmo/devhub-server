document.addEventListener('DOMContentLoaded', function() {
    const secret = 'your-256-bit-secret'; // 실제로는 안전한 키를 사용해야 합니다.
    const options = { expiresIn: '1h' };

    // JWT 토큰을 생성하는 함수
    function generateToken(payload, secret, options) {
        return jwt.sign(payload, secret, options);
    }

    // JWT 토큰을 검증하는 함수
    function verifyToken(token, secret, options) {
        try {
            return jwt.verify(token, secret, options);
        } catch (err) {
            console.error('Token verification failed:', err);
            return null;
        }
    }

    // 로그인 폼 제출 이벤트
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault(); // 기본 폼 제출 동작 방지

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // 간단한 로그인 검증 로직 (예제용)
        if (email === 'test@example.com' && password === 'password') {
            // 로그인 성공 시 토큰 생성
            const payload = { email: email };
            const accessToken = generateToken(payload, secret, options);
            const refreshToken = generateToken(payload, secret, { expiresIn: '7d' });

            // access token과 refresh token을 local storage에 저장
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // 보호된 페이지로 리디렉션
            window.location.href = 'http://localhost:8080/main';
        } else {
            alert('로그인에 실패했습니다. 자격 증명을 확인하세요.');
        }
    });

    async function refreshAccessToken() {
        const refreshToken = localStorage.getItem('refreshToken');

        try {
            const decoded = jwt.verify(refreshToken, secret);
            const newAccessToken = generateToken({ email: decoded.email }, secret, options);
            localStorage.setItem('accessToken', newAccessToken);
            return newAccessToken;
        } catch (err) {
            console.error('Token refresh failed:', err);
            window.location.href = '/login';
        }
    }

    // Axios 요청 인터셉터를 사용하여 액세스 토큰을 헤더에 추가
    axios.interceptors.request.use(
        async (config) => {
            let accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Axios 응답 인터셉터를 사용하여 401 오류 및 토큰 갱신 처리
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            const originalRequest = error.config;
            if (error.response && error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                const newAccessToken = await refreshAccessToken();
                if (newAccessToken) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    return axios(originalRequest);
                }
            }
            return Promise.reject(error);
        }
    );
});
