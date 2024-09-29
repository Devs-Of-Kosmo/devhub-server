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

    // 새로고침 시 브랜치 및 커밋 정보 복원
    async function restoreStateAfterRefresh() {
        const storedBranchId = document.getElementById('currentBranchId').value;
        const storedCommitId = document.getElementById('currentCommitId').value;

        if (storedBranchId && storedCommitId) {
            await window.branchManagement.switchToBranch(storedBranchId, storedCommitId);
        } else {
            await window.fileExplorer.updateFileTree();
        }
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

    // 이전 커밋의 파일 리스트 가져오기
    async function getPreviousCommitFileList() {
        const latestCommitId = window.projectInfo.getLatestCommitId();
        if (!latestCommitId) {
            throw new Error('최신 커밋 ID를 가져올 수 없습니다.');
        }

        const commitData = await window.api.fetchWithTokenJSON(`/api/team/project/commit?commitId=${latestCommitId}`);
        return commitData.fileNameWithPathList || [];
    }

    // 파일 변경 사항 감지
    function detectFileChanges(previousFiles, currentFiles) {
        const previousFileSet = new Set(previousFiles);
        const currentFileSet = new Set(currentFiles);

        // 삭제된 파일
        const deletedFiles = [...previousFileSet].filter(file => !currentFileSet.has(file));

        // 이름 변경 또는 이동된 파일
        const renamedFiles = [];

        currentFiles.forEach(currentFile => {
            const fileName = currentFile.split('/').pop();
            const possibleOldPaths = [...previousFileSet].filter(prevFile =>
                prevFile.endsWith(fileName) && prevFile !== currentFile
            );
            if (possibleOldPaths.length > 0) {
                renamedFiles.push([possibleOldPaths[0], currentFile]);
            }
        });

        return {
            deletedFiles,
            renamedFiles
        };
    }

    // 브랜치 정보 가져오기
    async function getBranches(commitId) {
        try {
            console.log(`Fetching branches for commitId: ${commitId}`);
            const response = await window.api.fetchWithTokenJSON(`/api/team/project/branch?commitId=${commitId}`);
            console.log('Branches response:', response);
            return response;
        } catch (error) {
            console.error('Error fetching branches:', error);
            if (error.response) {
                console.error('Error response:', error.response);
                throw new Error(`브랜치 정보를 가져오는데 실패했습니다. 서버 응답: ${error.response.status}`);
            } else if (error.request) {
                console.error('No response received:', error.request);
                throw new Error('서버로부터 응답을 받지 못했습니다.');
            } else {
                console.error('Error setting up request:', error.message);
                throw error;
            }
        }
    }

    // 프로젝트 저장 함수 (일반 저장)
    async function saveProject() {
        try {
            const projectId = window.projectInfo.getProjectId();
            if (!projectId) {
                throw new Error('현재 프로젝트 ID가 설정되지 않았습니다.');
            }

            if (!window.uploadedFiles.length) {
                throw new Error('업로드된 파일이 없습니다.');
            }

            // 파일 크기 검사
            const totalSize = window.uploadedFiles.reduce((total, file) => total + file.size, 0);
            if (totalSize > 200 * 1024 * 1024) { // 200MB
                throw new Error('프로젝트 총 용량이 200MB를 초과합니다.');
            }

            const fromCommitId = window.projectInfo.getLatestCommitId();
            if (!fromCommitId) {
                throw new Error('현재 커밋 ID가 설정되지 않았습니다.');
            }

            // 브랜치 정보 조회 및 선택
            const branches = await getBranches(fromCommitId);
            if (branches.length === 0) {
                throw new Error('현재 커밋에 대한 브랜치가 없습니다.');
            }
            const selectedBranch = await showBranchSelectionModal(branches);
            const branchId = selectedBranch.branchId;

            // 브랜치 소유권 및 병합 조건 확인
            if (selectedBranch.creatorName !== currentUser.name) {
                throw new Error('이 브랜치에 대한 커밋 권한이 없습니다.');
            }
            // 병합 조건 체크 제거 (모든 브랜치에서 저장 가능하도록)

            // 이전 커밋의 파일 리스트 가져오기
            const previousFiles = await getPreviousCommitFileList();
            console.log('이전 커밋의 파일 리스트:', previousFiles);

            // 현재 업로드된 파일의 상대 경로 리스트 생성
            const currentFiles = window.uploadedFiles.map(file => file.webkitRelativePath);
            console.log('현재 업로드된 파일의 리스트:', currentFiles);

            // 파일 변경 사항 감지
            const { deletedFiles, renamedFiles } = detectFileChanges(previousFiles, currentFiles);
            console.log('삭제된 파일:', deletedFiles);
            console.log('이름이 변경되거나 이동된 파일:', renamedFiles);

            // 삭제할 파일 선택 모달 표시
            const selectedDeletedFiles = await showFileSelectionModal(deletedFiles, '삭제할 파일 선택', false);

            // 이름 변경된 파일 선택 모달 표시
            const selectedRenamedFiles = await showFileSelectionModal(renamedFiles, '이름 변경된 파일 선택', true);

            // 선택된 파일들을 제외한 File 객체 배열 생성
            const filesToKeep = window.uploadedFiles.filter(file => {
                const path = file.webkitRelativePath;
                const isDeleted = selectedDeletedFiles.includes(path);
                const isRenamed = selectedRenamedFiles.some(pair => pair[1] === path);
                return !isDeleted && !isRenamed;
            });

            // 저장할 파일 목록 확인
            const confirmSave = await showSaveConfirmationModal(
                filesToKeep.map(file => file.webkitRelativePath),
                selectedDeletedFiles,
                selectedRenamedFiles
            );
            if (!confirmSave) {
                console.log('사용자가 저장을 취소했습니다.');
                return;
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

            // FormData 객체 생성
            const formData = new FormData();
            formData.append('branchId', branchId.toString());
            formData.append('fromCommitId', fromCommitId.toString());
            formData.append('commitMessage', commitMessage);

            // File 객체를 FormData에 추가
            filesToKeep.forEach(file => {
                if (file instanceof File) {
                    formData.append('files', file, file.webkitRelativePath);
                } else {
                    console.warn(`유효하지 않은 파일 건너뛰기: ${file.webkitRelativePath}`);
                }
            });

            // 삭제된 파일 목록 추가 (개별 항목으로 추가)
            selectedDeletedFiles.forEach(file => {
                formData.append('deleteFileNameList', file);
            });

            // 이름 변경된 파일 목록 추가 (JSON 문자열로 추가)
            selectedRenamedFiles.forEach(pair => {
                formData.append('renameFileNameList', JSON.stringify(pair));
            });

            // FormData 내용 로깅 (디버깅용)
            console.log('FormData 내용:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File 이름 - ${value.name}, 경로 - ${value.webkitRelativePath}`);
                } else {
                    console.log(`${key}:`, value);
                }
            }

            console.log('Sending form data:', formData);

            // API 호출
            const result = await window.api.fetchWithTokenFormData('/api/team/project/save', formData);
            console.log('서버 응답:', result);

            const newCommit = {
                commitId: result.newCommitId,
                commitMessage: result.newCommitMessage,
                createdByName: currentUser ? currentUser.name : 'Unknown',
                createdDate: new Date().toISOString()
            };

            window.projectInfo.addCommit(newCommit);

            // 저장 후 현재 브랜치 및 커밋 정보 업데이트
            window.projectInfo.setLatestCommitId(result.newCommitId);
            document.getElementById('currentCommitId').value = result.newCommitId;

            Swal.fire('프로젝트 저장 성공!', `커밋 ID: ${result.newCommitId}`, 'success');

            // 파일 트리 업데이트
            window.fileUpload.updateFileTree(document.getElementById('fileTree'), window.uploadedFiles.filter(file => filesToKeep.includes(file)));

            // 파일 트리 즉시 업데이트
            await window.fileExplorer.updateFileTree();

        } catch (error) {
            console.error('프로젝트 저장 중 오류:', error);
            Swal.fire('오류', `프로젝트 저장 중 문제가 발생했습니다: ${error.message}`, 'error');
        }
    }

// 파일 선택 모달 표시 함수
    async function showFileSelectionModal(files, title, isRename = false) {
        return new Promise((resolve) => {
            if (isRename) {
                // RenameFileNameList는 [ [oldName, newName], ... ] 형태여야 합니다.
                let htmlContent = `<div class="file-selection-modal">`;
                files.forEach((pair, index) => {
                    if (pair.length !== 2) {
                        console.warn(`유효하지 않은 rename 쌍: ${pair}`);
                        return;
                    }
                    htmlContent += `
                        <div class="file-item">
                            <input type="checkbox" id="file-${index}" value="${index}">
                            <label for="file-${index}">
                                ${pair[0]} -> ${pair[1]}
                            </label>
                        </div>`;
                });
                htmlContent += `</div>`;

                Swal.fire({
                    title: title,
                    html: htmlContent,
                    focusConfirm: false,
                    preConfirm: () => {
                        const selectedFiles = [];
                        document.querySelectorAll('.file-selection-modal input:checked').forEach((checkbox) => {
                            const selectedPair = files[parseInt(checkbox.value)];
                            if (selectedPair && selectedPair.length === 2) {
                                selectedFiles.push(selectedPair);
                            }
                        });
                        return selectedFiles;
                    }
                }).then((result) => {
                    resolve(result.value || []);
                });
            } else {
                // DeleteFileNameList는 [ "file1.js", "file2.js", ... ] 형태여야 합니다.
                let htmlContent = `<div class="file-selection-modal">`;
                files.forEach((file, index) => {
                    htmlContent += `
                        <div class="file-item">
                            <input type="checkbox" id="file-${index}" value="${file}">
                            <label for="file-${index}">${file}</label>
                        </div>`;
                });
                htmlContent += `</div>`;

                Swal.fire({
                    title: title,
                    html: htmlContent,
                    focusConfirm: false,
                    preConfirm: () => {
                        const selectedFiles = [];
                        document.querySelectorAll('.file-selection-modal input:checked').forEach((checkbox) => {
                            selectedFiles.push(checkbox.value);
                        });
                        return selectedFiles;
                    }
                }).then((result) => {
                    resolve(result.value || []);
                });
            }
        });
    }

    // 저장 확인 모달 함수
    async function showSaveConfirmationModal(filesToKeep, deletedFiles, renamedFiles) {
        let htmlContent = '<h3>저장할 파일 목록:</h3><ul>';
        filesToKeep.forEach(file => {
            htmlContent += `<li>${file}</li>`;
        });
        htmlContent += '</ul>';

        if (deletedFiles.length > 0) {
            htmlContent += '<h3>삭제될 파일 목록:</h3><ul>';
            deletedFiles.forEach(file => {
                htmlContent += `<li>${file}</li>`;
            });
            htmlContent += '</ul>';
        }

        if (renamedFiles.length > 0) {
            htmlContent += '<h3>이름이 변경될 파일 목록:</h3><ul>';
            renamedFiles.forEach(pair => {
                htmlContent += `<li>${pair[0]} -> ${pair[1]}</li>`;
            });
            htmlContent += '</ul>';
        }

        const result = await Swal.fire({
            title: '저장 확인',
            html: htmlContent,
            showCancelButton: true,
            confirmButtonText: '저장',
            cancelButtonText: '취소',
            width: 600,
            customClass: {
                container: 'save-confirmation-modal'
            }
        });

        return result.isConfirmed;
    }

    // 브랜치 선택 모달을 표시는 함수
    async function showBranchSelectionModal(branches) {
        return new Promise((resolve, reject) => {
            const branchListHtml = branches.map(branch => `
                <li>
                    <span>${branch.branchName}</span>
                    <span>${branch.description}</span>
                    <span>생성자: ${branch.creatorName}</span>
                    <span>생성일: ${new Date(branch.createdDate).toLocaleString()}</span>
                    <button class="select-branch" data-branch-id="${branch.branchId}">선택</button>
                </li>
            `).join('');

            Swal.fire({
                title: '브랜치 선택',
                html: `<ul>${branchListHtml}</ul>`,
                showConfirmButton: false,
                didOpen: () => {
                    document.querySelectorAll('.select-branch').forEach(button => {
                        button.addEventListener('click', () => {
                            const selectedBranch = branches.find(branch => branch.branchId === parseInt(button.dataset.branchId));
                            resolve(selectedBranch);
                            Swal.close();
                        });
                    });
                }
            });
        });
    }

    // 초기 버튼 상태 설정
    updateSaveButtonState();

    // 프로젝트 정보가 변경될 때마다 버튼 상태 업데이트
    window.projectInfo.onProjectInfoChange = updateSaveButtonState;

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

    // 프로젝트 초기화 함수 (최초 저장)
    async function initializeProject() {
        try {
            if (!window.uploadedFiles.length) {
                throw new Error('업로드된 파일이 없습니다.');
            }

            const projectId = sessionStorage.getItem('projectId');
            if (!projectId) {
                throw new Error('세션 스토리지에 프로젝트 ID가 없습니다.');
            }

            // 파일 크기 검사
            const totalSize = window.uploadedFiles.reduce((total, file) => total + file.size, 0);
            if (totalSize > 200 * 1024 * 1024) { // 200MB
                throw new Error('프로젝트 총 용량이 200MB를 초과합니다.');
            }

            const result = await Swal.fire({
                title: '커밋 메시지',
                input: 'text',
                inputLabel: '초기 커밋에 대한 메시지를 입력하세요',
                inputPlaceholder: '예: 프로젝트 초기 설정',
                showCancelButton: true,
                inputValidator: (value) => !value && '커밋 메시지를 입력해주세요!'
            });

            if (result.isDismissed) {
                console.log('사용자가 취소했거나 모달을 닫았습니다.');
                return;
            }

            if (!result.value) {
                throw new Error('커밋 메시지가 입력되지 않았습니다.');
            }

            const commitMessage = result.value;

            // TEST 폴더를 제외한 파일 목록 생성
            const filteredFiles = window.uploadedFiles.filter(file => !file.webkitRelativePath.startsWith('test/'));

            console.log('초기화할 파일 목록:', filteredFiles);

            // 프로젝트 초기화
            const initResult = await window.projectInfo.initializeProject(projectId, filteredFiles, commitMessage);

            const initialCommit = {
                commitId: initResult.newCommitId,
                commitMessage: initResult.commitMessage,
                createdByName: currentUser ? currentUser.name : 'Unknown',
                createdDate: new Date().toISOString()
            };

            window.projectInfo.addCommit(initialCommit);

            Swal.fire({
                title: '프로젝트 최초 저장 성공!',
                icon: 'success'
            });

            window.projectInfo.isInitialized = true;
            updateSaveButtonState();

        } catch (error) {
            console.error('프로젝트 초기화 중 오류:', error);
            Swal.fire('오류', `프로젝트 초기화 중 문제가 발생했습니다: ${error.message}`, 'error');
        }
    }

    // 코드 차이 버튼 이벤트 리스너
    if (codeDiffButton) {
        codeDiffButton.addEventListener('click', async function() {
            if (window.uploadedFiles.length > 0 && window.comparisonFiles.length > 0) {
                const originalFile = window.uploadedFiles[0];
                const comparisonFile = window.comparisonFiles[0];
                await window.diff.compareFiles(
                    { name: originalFile.name, content: originalFile },
                    { name: comparisonFile.name, content: comparisonFile }
                );
            } else {
                Swal.fire('오류', '비교할 파일을 모두 업로드해주세요.', 'error');
            }
        });
    }

    // 페이지 로드 시 상태 복원
    await restoreStateAfterRefresh();
});