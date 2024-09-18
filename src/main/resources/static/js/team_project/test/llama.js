document.addEventListener('DOMContentLoaded', function() {
    const aiReviewButton = document.getElementById('aiReviewButton');
    const reviewResult = document.getElementById('reviewResult');

    if (aiReviewButton) {
        aiReviewButton.addEventListener('click', performAICodeReview);
        aiReviewButton.disabled = false; // 버튼 활성화
    }

    async function performAICodeReview() {
        if (!window.isFileUploaded || !window.isComparisonFileUploaded) {
            Swal.fire('오류', '원본 파일과 비교 파일을 모두 업로드해주세요.', 'error');
            return;
        }

        const originalFile = window.uploadedFiles[0];
        const comparisonFile = window.comparisonFiles[0];

        if (!originalFile || !comparisonFile) {
            Swal.fire('오류', '원본 파일과 비교 파일을 선택해주세요.', 'error');
            return;
        }

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
            Swal.fire('오류', `AI 코드 리뷰 중 문제가 발생했습니다: ${error.message}`, 'error');
        }
    }

    async function callServerAPI(prompt) {
        try {
            const response = await fetch('/api/llama/code-review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }), // JSON으로 wrapping해서 보냅니다.
            });
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
