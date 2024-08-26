document.addEventListener("DOMContentLoaded", function () {
    const reviewBtn = document.getElementById('review-btn');
    const reviewModal = document.getElementById('reviewModal');
    const closeReviewBtn = document.querySelector('.close-review-btn');

    reviewBtn.addEventListener('click', async function () {
        const file1Content = getFileContent('file-content-display');
        const file2Content = getFileContent('changed-file-content');

        if (!file1Content || !file2Content) {
            Swal.fire({
                title: '파일 내용 없음',
                text: '비교할 두 파일의 내용이 모두 필요합니다.',
                icon: 'warning',
                confirmButtonText: '확인'
            });
            return;
        }

        try {
            const response = await fetch('/review-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ file1: file1Content, file2: file2Content })
            });

            if (!response.ok) {
                throw new Error('Failed to get AI review');
            }

            const data = await response.json();
            displayReview(data.review);
            reviewModal.classList.add('show');  // 'show' 클래스를 추가하여 모달 표시
        } catch (error) {
            console.error('Error during code review:', error);
            Swal.fire({
                title: '리뷰 실패',
                text: '코드 리뷰 중 오류가 발생했습니다.',
                icon: 'error',
                confirmButtonText: '확인'
            });
        }
    });

    closeReviewBtn.addEventListener('click', function () {
        reviewModal.classList.remove('show');  // 'show' 클래스를 제거하여 모달 숨김
    });

    // 모달 외부 클릭 시 닫기
    reviewModal.addEventListener('click', function (event) {
        if (event.target === reviewModal) {
            reviewModal.classList.remove('show');
        }
    });

    function getFileContent(elementId) {
        const element = document.getElementById(elementId);
        return element ? element.innerText : null;
    }

    function displayReview(review) {
        const reviewResult = document.getElementById('review-result');

        // 마크다운 스타일의 텍스트를 HTML로 변환
        const formattedReview = review
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/^- (.*)/gm, '<li>$1</li>')
            .replace(/<li>.*?<\/li>/gs, function(match) {
                return '<ul>' + match + '</ul>';
            });

        reviewResult.innerHTML = `<p>${formattedReview}</p>`;

        // 중첩된 ul 태그 제거
        reviewResult.innerHTML = reviewResult.innerHTML.replace(/<\/ul><ul>/g, '');
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