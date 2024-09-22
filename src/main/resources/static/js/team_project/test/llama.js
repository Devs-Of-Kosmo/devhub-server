document.addEventListener('DOMContentLoaded', function() {
    const aiReviewButton = document.getElementById('aiReviewButton');
    const reviewResult = document.getElementById('reviewResult');

    if (aiReviewButton) {
        aiReviewButton.addEventListener('click', performAICodeReview);
        aiReviewButton.disabled = false; // 버튼 활성화
    }

    async function performAICodeReview() {
        if (window.uploadedFiles.length === 0 || window.comparisonFiles.length === 0) {
            Swal.fire('오류', '원본 파일과 비교 파일을 모두 업로드해주세요.', 'error');
            return;
        }

        const originalFile = window.uploadedFiles[0];
        const comparisonFile = window.comparisonFiles[0];

        try {
            const originalContent = await readFileContent(originalFile);
            const comparisonContent = await readFileContent(comparisonFile);

            const prompt = `다음은 두 개의 코드 파일입니다. 첫 번째는 원본 파일이고, 두 번째는 비교 파일입니다.
이 두 파일을 비교하고 코드 품질, 가독성, 효율성 측면에서 개선점을 **한글로** 제안해주세요.

원본 파일 (${originalFile.name}):
${originalContent}

비교 파일 (${comparisonFile.name}):
${comparisonContent}`;

            Swal.fire({
                title: 'AI 코드 리뷰 중...',
                text: '잠시만 기다려주세요...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const responseText = await callServerAPI(prompt);
            displayAIReviewResult(responseText);
        } catch (error) {
            console.error('AI 코드 리뷰 중 오류 발생:', error);
            if (error.message.includes('인증')) {
                Swal.fire('인증 오류', error.message, 'error').then(() => {
                    // 로그인 페이지로 리디렉션
                    window.location.href = '/login';
                });
            } else {
                Swal.fire('오류', `AI 코드 리뷰 중 문제가 발생했습니다: ${error.message}`, 'error');
            }
        }
    }

    async function callServerAPI(prompt) {
        try {
            let token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
            }

            const response = await fetch('/api/llama/code-review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ prompt }),
            });

            if (response.status === 401) {
                // 토큰이 만료된 경우, 재발급 시도
                token = await reissueToken();
                if (!token) {
                    throw new Error('토큰 재발급에 실패했습니다. 다시 로그인해주세요.');
                }
                // 재발급된 토큰으로 다시 요청
                return await callServerAPI(prompt);
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`서버 에러: ${response.status} ${response.statusText}\n${errorText}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            throw new Error(`서버 API 호출 실패: ${error.message}`);
        }
    }

    async function reissueToken() {
        try {
            const response = await fetch('/api/auth/public/reissue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') }),
            });

            if (!response.ok) {
                throw new Error('토큰 재발급 실패');
            }

            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken);
            return data.accessToken;
        } catch (error) {
            console.error('토큰 재발급 중 오류:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return null;
        }
    }

    function displayAIReviewResult(responseText) {
        Swal.close();
        reviewResult.innerHTML = `
            <h3>AI 코드 리뷰 결과</h3>
            <pre>${escapeHtml(responseText)}</pre>
        `;
    }

    function readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});