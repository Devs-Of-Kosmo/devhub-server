document.addEventListener('DOMContentLoaded', async function() {
    // 전역 파일 리스트 초기화
    window.uploadedFiles = [];
    window.comparisonFiles = [];

    let currentUser = null;

    const saveProjectButton = document.getElementById('saveProjectButton');
    const fileUploadInput = document.getElementById('fileUpload');
    const comparisonFileUploadInput = document.getElementById('comparisonFileUpload');
    const uploadButton = document.getElementById('uploadButton');
    const comparisonUploadButton = document.getElementById('comparisonUploadButton');
    const fileTree = document.getElementById('fileTree');
    const comparisonContent = document.getElementById('comparisonContent');
    const codeDiffButton = document.getElementById('codeDiffButton');
    const reviewResult = document.getElementById('reviewResult');
    const fileContent = document.getElementById('fileContent');

    // 사용자 정보를 가져오는 함수
    async function fetchUserInfo() {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.error('No access token found');
            return null;
        }

        try {
            const response = await fetch('/api/user/info', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            // 로고 부분에 사용자 이름 표시
            const logoElement = document.querySelector('.logo');
            if (logoElement) {
                logoElement.textContent = `${data.name}의 레포지토리`;
            }

            return data;
        } catch (error) {
            console.error('Error fetching user info:', error);
            return null;
        }
    }

    // 페이지 로드 시 사용자 정보 가져오기
    currentUser = await fetchUserInfo();

    // 프로젝트 정보 초기화
    await window.projectInfo.initialize();

    // projectId 확인
    const projectId = window.projectInfo.getProjectId();
    if (!projectId) {
        console.warn('프로젝트 ID가 설정되지 않았습니다.');
        Swal.fire('알림', '프로젝트를 선택해주세요.', 'info');
    }

    // 파일 선택 이벤트
    if (uploadButton) {
        uploadButton.addEventListener('click', () => fileUploadInput.click());
    }

    if (comparisonUploadButton) {
        comparisonUploadButton.addEventListener('click', () => comparisonFileUploadInput.click());
    }

    // 파일이 선택되었을 때 처리
    if (fileUploadInput) {
        fileUploadInput.addEventListener('change', function(event) {
            window.uploadedFiles = Array.from(event.target.files);
            console.log('업로드된 파일:', window.uploadedFiles);
            window.fileUpload.updateFileTree(fileTree, window.uploadedFiles);
            checkUploadStatus();
        });
    }

    if (comparisonFileUploadInput) {
        comparisonFileUploadInput.addEventListener('change', function(event) {
            window.comparisonFiles = Array.from(event.target.files);
            console.log('비교할 파일:', window.comparisonFiles);
            window.fileUpload.updateFileTree(comparisonContent, window.comparisonFiles, true);
            checkUploadStatus();
        });
    }

    // 업로드 상태 확인
    function checkUploadStatus() {
        const hasFiles = window.uploadedFiles.length > 0;
        const hasComparisonFiles = window.comparisonFiles.length > 0;

        codeDiffButton.disabled = !(hasFiles && hasComparisonFiles);
    }

    // 프로젝트 초기화 함수
    async function initializeProject() {
        try {
            if (!window.uploadedFiles.length) {
                throw new Error('업로드된 파일이 없습니다.');
            }

            if (!window.projectInfo.getProjectId()) {
                throw new Error('프로젝트 ID가 설정되지 않았습니다.');
            }

            const { value: commitMessage } = await Swal.fire({
                title: '커밋 메시지',
                input: 'text',
                inputLabel: '초기 커밋에 대한 메시지를 입력하세요',
                inputPlaceholder: '예: 프로젝트 초기 설정',
                showCancelButton: true,
                inputValidator: (value) => !value && '커밋 메시지를 입력해주세요!'
            });

            if (!commitMessage) {
                throw new Error('커밋 메시지가 입력되지 않았습니다.');
            }

            // TEST 폴더를 제외한 파일 목록 생성
            const filteredFiles = window.uploadedFiles.filter(file => !file.webkitRelativePath.startsWith('test/'));

            const result = await window.projectInfo.initializeProject(filteredFiles, commitMessage);

            const initialCommit = {
                commitId: result.newCommitId,
                commitMessage: result.commitMessage,
                createdByName: currentUser ? currentUser.name : 'Unknown',
                createdDate: new Date().toISOString()
            };

            window.projectInfo.addCommit(initialCommit);

            Swal.fire({
                title: '프로젝트 최초저장 성공!',

                icon: 'success'
            });

            window.projectInfo.isInitialized = true;
            updateSaveButtonState();

        } catch (error) {
            console.error('프로젝트 초기화 중 오류:', error);
            Swal.fire('오류', `프로젝트 초기화 중 문제가 발생했습니다: ${error.message}`, 'error');
        }
    }

    // 프로젝트 저장 함수
    async function saveProject() {
        try {
            if (!window.projectInfo.getProjectId()) {
                throw new Error('현재 프로젝트 ID가 설정되지 않았습니다.');
            }

            if (!window.uploadedFiles.length) {
                throw new Error('업로드된 파일이 없습니다.');
            }

            const { value: commitMessage } = await Swal.fire({
                title: '커밋 메시지',
                input: 'text',
                inputLabel: '커밋 메시지를 입력하세요',
                inputPlaceholder: '예: 기능 추가',
                showCancelButton: true,
                inputValidator: (value) => value ? null : '커밋 메시지를 입력해주세요!'
            });

            if (!commitMessage) {
                throw new Error('커밋 메시지가 입력되지 않았습니다.');
            }

            const formData = new FormData();
            formData.append('teamId', window.projectInfo.teamId);
            formData.append('projectId', window.projectInfo.getProjectId());
            formData.append('commitMessage', commitMessage);

            // TEST 폴더를 제외한 파일만 추가
            window.uploadedFiles.forEach(file => {
                if (!file.webkitRelativePath.startsWith('test/')) {
                    formData.append('files', file);
                }
            });

            const result = await window.api.fetchWithTokenFormData('/api/team/project/save', formData);

            const newCommit = {
                commitId: result.newCommitId,
                commitMessage: result.commitMessage,
                createdByName: currentUser ? currentUser.name : 'Unknown',
                createdDate: new Date().toISOString()
            };

            window.projectInfo.addCommit(newCommit);

            Swal.fire('프로젝트 저장 성공!', `커밋 ID: ${result.newCommitId}`, 'success');

            window.fileUpload.updateFileTree(document.getElementById('fileTree'), window.uploadedFiles);

        } catch (error) {
            Swal.fire('오류', `프로젝트 저장 중 문제가 발생했습니다: ${error.message}`, 'error');
        }
    }

    // 코드 차이 버튼 이벤트 리스너 추가
    if (codeDiffButton) {
        codeDiffButton.addEventListener('click', function() {
            if (window.uploadedFiles.length > 0 && window.comparisonFiles.length > 0) {
                window.diff.compareFiles(window.uploadedFiles[0], window.comparisonFiles[0]);
            } else {
                Swal.fire('오류', '비교할 파일을 모두 업로드해주세요.', 'error');
            }
        });
    }

    // 버튼 상태 업데이트 함수
    function updateSaveButtonState() {
        if (!window.projectInfo.isInitialized) {
            saveProjectButton.textContent = '최초 저장';
            saveProjectButton.removeEventListener('click', saveProject);
            saveProjectButton.addEventListener('click', initializeProject);
        } else {
            saveProjectButton.textContent = '저장';
            saveProjectButton.removeEventListener('click', initializeProject);
            saveProjectButton.addEventListener('click', saveProject);
        }
    }

    // 초기 버튼 상태 설정
    updateSaveButtonState();

    // 프로젝트 정보가 변경될 때마다 버튼 상태 업데이트
    window.projectInfo.onProjectInfoChange = updateSaveButtonState;
});