// commit.js

document.addEventListener("DOMContentLoaded", function () {
    const file1 = document.getElementById('file1');
    const commitBtn = document.getElementById('commit-button');
    const commitMessageInput = document.getElementById('commitMessage');
    const accessToken = localStorage.getItem('accessToken');
    const projectId = sessionStorage.getItem('projectId');
    const sideContentModal = document.getElementById('sideContentModal');
    const openFileBtn = document.querySelector('.open-file-btn');

    // 파일 업로드 후 체크 아이콘과 메시지를 표시하는 함수
    function showCheckIcon(button, message = '') {
        // 기존의 체크 아이콘을 제거하지 않음
        let checkIcon = button.parentElement.querySelector('.check-icon');
        if (!checkIcon) {
            // 체크 아이콘이 없을 때만 새로 생성
            checkIcon = document.createElement('span');
            checkIcon.className = 'check-icon';
            checkIcon.style.marginLeft = '10px'; // 버튼과의 간격 조절
            button.insertAdjacentElement('afterend', checkIcon);
            setTimeout(() => checkIcon.classList.add('show'), 100); // 체크 아이콘 표시 딜레이
        }

        // 기존 메시지를 제거하지 않음
        let uploadMessage = button.parentElement.querySelector('.upload-message');
        if (!uploadMessage && message) {
            // 메시지가 없을 때만 새로 생성
            uploadMessage = document.createElement('span');
            uploadMessage.className = 'upload-message';
            uploadMessage.style.marginLeft = '10px'; // 간격 조절
            uploadMessage.textContent = message;
            checkIcon.insertAdjacentElement('beforebegin', uploadMessage);
        }
    }

    // 체크 아이콘과 메시지를 제거하는 함수
    function clearCheckIconAndMessage() {
        const checkIcon = document.querySelector('.check-icon');
        const uploadMessage = document.querySelector('.upload-message');
        if (checkIcon) checkIcon.remove();
        if (uploadMessage) uploadMessage.remove();
    }

    // 커밋 성공 메시지와 체크 아이콘을 제거하는 함수
    function clearCommitSuccessMessage() {
        const successMessage = document.querySelector('.commit-success-message');
        const checkIcon = document.querySelector('.check-icon');
        if (successMessage) successMessage.remove();
        if (checkIcon) checkIcon.remove();
    }

    // 커밋 메시지 입력 필드 내용을 지우는 함수
    function clearCommitMessage() {
        commitMessageInput.value = '';
    }

    // 커밋을 위한 파일 선택 처리
    if (file1) {
        // 중복 이벤트 리스너 방지
        file1.removeEventListener('change', handleFile1Change);
        file1.addEventListener('change', handleFile1Change);
    }

    function handleFile1Change(event) {
        const files = event.target.files;
        try {
            let totalSize = 0;
            for (let file of files) {
                totalSize += file.size;
            }

            // 파일 크기가 100MB를 초과하면 경고 메시지 표시
            const maxSizeInBytes = 100 * 1024 * 1024; // 100MB
            if (totalSize > maxSizeInBytes) {
                Swal.fire({
                    title: '파일 크기 초과',
                    text: '100MB 이상의 프로젝트는 업로드 할 수 없습니다.',
                    icon: 'warning',
                    confirmButtonText: '확인'
                });
                return;
            }

            // 폴더명 가져오기
            const folderName = files[0].webkitRelativePath.split('/')[0];
            const message = `'${folderName}' 폴더가 업로드되었습니다.`;

            // 기존 체크 아이콘과 메시지 제거
            const previousCheckIcon = document.querySelector('.check-icon');
            const previousMessage = document.querySelector('.upload-message');
            if (previousCheckIcon) previousCheckIcon.remove();
            if (previousMessage) previousMessage.remove();

            // 새로운 체크 아이콘과 메시지 표시
            showCheckIcon(openFileBtn, message);
        } catch (error) {
            console.error('파일 읽기 오류:', error);
        }
    }

    // 커밋 버튼 클릭 처리
    if (commitBtn) {
        commitBtn.addEventListener('click', async function () {
            const files = file1.files;
            const commitMessage = commitMessageInput.value.trim();
            const personalProjects = JSON.parse(localStorage.getItem('personal_project') || '[]');

            if (!files.length) {
                Swal.fire({
                    title: '파일 선택 필요',
                    text: '커밋할 파일을 선택하세요.',
                    icon: 'warning',
                    confirmButtonText: '확인'
                });
                return;
            }

            if (!commitMessage) {
                Swal.fire({
                    title: '커밋 메시지 필요',
                    text: '커밋 메시지를 입력하세요.',
                    icon: 'warning',
                    confirmButtonText: '확인'
                });
                return;
            }

            try {
                const formData = new FormData();
                for (let file of files) {
                    formData.append('files', file, file.webkitRelativePath);
                }
                formData.append('commitMessage', commitMessage);

                let apiUrl = 'http://localhost:8080/api/personal/project/init';
                let method = 'POST';

                if (personalProjects.length > 0) {
                    const latestProject = personalProjects[personalProjects.length - 1];
                    formData.append('fromCommitId', latestProject.newCommitId);
                    apiUrl = 'http://localhost:8080/api/personal/project/save';
                } else {
                    formData.append('projectId', projectId);
                }

                const timestamp = new Date().getTime(); // 캐시 방지
                apiUrl = `${apiUrl}?ts=${timestamp}`;

                const response = await fetch(apiUrl, {
                    method: method,
                    headers: {
                        'Authorization': 'Bearer ' + accessToken,
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    },
                    body: formData
                });

                if (!response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        console.log("커밋 실패 (JSON 응답):", errorData);
                    } else {
                        const errorText = await response.text();
                        console.error('커밋 실패:', errorText);
                    }
                    return;
                }

                const newCommitData = await response.json();
                personalProjects.push(newCommitData);
                localStorage.setItem('personal_project', JSON.stringify(personalProjects));

                // 성공 메시지 표시 및 모달 닫기
                Swal.fire({
                    title: '커밋 성공',
                    text: '커밋이 완료되었습니다.',
                    icon: 'success',
                    confirmButtonText: '확인'
                }).then(() => {
                    sideContentModal.style.display = "none";
                    clearCommitMessage(); // 커밋 메시지 입력 필드 초기화
                    clearCheckIconAndMessage(); // 체크 아이콘과 메시지 제거
                });

            } catch (error) {
                console.error('커밋 중 오류 발생:', error);
                Swal.fire({
                    title: '커밋 실패',
                    text: '커밋 중 오류가 발생했습니다.',
                    icon: 'error',
                    confirmButtonText: '확인'
                });
            }
        });
    }

    // 파일 내용을 읽는 함수 (필요 시 사용)
    async function getFileContents(files) {
        const fileContents = [];
        for (let file of files) {
            if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
                try {
                    const content = await readFileContent(file);
                    fileContents.push({ name: file.webkitRelativePath, content: content });
                } catch (error) {
                    console.error('파일 읽기 오류:', file.name, error);
                    throw error;
                }
            } else {
                console.warn('텍스트 파일이 아니므로 건너뜁니다:', file.name);
            }
        }
        return fileContents;
    }

    function readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                resolve(event.target.result);
            };
            reader.onerror = function (error) {
                reject(error);
            }
            reader.readAsText(file);
        });
    }

    // 파일 입력 필드를 초기화하는 함수 (필요 시 사용)
    window.resetFileInput = function resetFileInput(inputId) {
        const fileInput = document.getElementById(inputId);
        if (fileInput) {
            fileInput.value = ''; // 파일 입력 필드 초기화
            setTimeout(() => fileInput.click(), 100); // 안정적인 작동을 위한 약간의 지연 추가
        }
    };
});
