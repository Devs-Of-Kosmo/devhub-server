document.addEventListener("DOMContentLoaded", function () {
    const file1 = document.getElementById('file1');
    const file2 = document.getElementById('file2');
    const compareBtn = document.getElementById('compare-btn');
    const commitBtn = document.getElementById('commit-button');
    const commitMessageInput = document.getElementById('commitMessage');
    const accessToken = localStorage.getItem('accessToken');
    const projectName = sessionStorage.getItem('projectName');
    const projectId = sessionStorage.getItem('projectId');
    const description = sessionStorage.getItem('description');
    const metadataWrapper = document.querySelector('.metadata-cards-wrapper');
    const commitCardsContainer = document.querySelector('.commit-cards-container');
    const metadataContainer = document.querySelector('.metadata-cards-container');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.querySelector('.close-settings-btn');

    const editProjectBtn = document.getElementById('editProjectBtn');
    const editProjectModal = document.getElementById('editProjectModal');
    const closeEditModalBtn = document.querySelector('.close-edit-modal-btn');
    const saveChangesBtn = document.getElementById('saveChangesBtn');

    const changedProjectNameInput = document.getElementById('changedProjectName');
    const changedDescriptionInput = document.getElementById('changedDescription');
    let selectedMetadataCard = null;

    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const branchToggleBtn = document.getElementById('branchToggleBtn');
    const sideContentModal = document.getElementById('sideContentModal');
    const branchContent = document.getElementById('branchContent');
    const closeModalBtn = document.querySelector('.close-btn');
    const closeBranchBtn = document.createElement('span');
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const closeHelpBtn = document.querySelector('.close-help-btn');

    // 닫기 버튼 생성
    closeBranchBtn.className = 'close-btn';
    closeBranchBtn.innerHTML = '&times;';
    branchContent.appendChild(closeBranchBtn);

    // projectName과 description을 Navbar에 표시
    const projectNameElement = document.getElementById('project-name');
    const projectDescriptionElement = document.getElementById('project-description');

    if (projectNameElement) {
        projectNameElement.textContent = projectName || 'Project Name';
    }

    if (projectDescriptionElement) {
        projectDescriptionElement.textContent = description || 'Project Description';
    }

    // 토글 사이드바 버튼 클릭 시 sideContentModal만 표시
    toggleSidebarBtn.addEventListener('click', function (event) {
        event.preventDefault();
        sideContentModal.style.display = "block";
        branchContent.style.display = "none";
    });

    // 모달 닫기 버튼
    closeModalBtn.addEventListener('click', function () {
        sideContentModal.style.display = "none";
        branchContent.style.display = "none";
        clearCheckIconAndMessage(); // 체크 아이콘과 메시지 제거
        clearCommitSuccessMessage(); // 커밋 성공 메시지와 체크 아이콘 제거
    });

    // 브랜치 콘텐츠 닫기 버튼
    closeBranchBtn.addEventListener('click', function () {
        branchContent.style.display = "none";
    });

    // 설명서 버튼 클릭 시 모달 창 열기
    helpBtn.addEventListener('click', function (event) {
        event.preventDefault();
        helpModal.style.display = "block";
    });

    // 설명서 모달 닫기 버튼
    closeHelpBtn.addEventListener('click', function () {
        helpModal.style.display = "none";
    });

    // 외부 클릭 시 모달 닫기
    window.addEventListener('click', function (event) {
        if (event.target == sideContentModal || event.target == branchContent || event.target == helpModal) {
            sideContentModal.style.display = "none";
            branchContent.style.display = "none";
            helpModal.style.display = "none";
            clearCheckIconAndMessage(); // 체크 아이콘과 메시지 제거
        }
    });

    // 브랜치 버튼 클릭 시 메타데이터 카드 보여주기
    branchToggleBtn.addEventListener('click', async function (event) {
        event.preventDefault();
        branchContent.style.display = "block";
        sideContentModal.style.display = "none";

        // 메타데이터 카드 정보를 가져와서 표시
        await fetchProjectMetadata(projectName);
        branchContent.style.zIndex = "1001";
    });

    // 설정 버튼 클릭 시 모달 창 열기
    settingsBtn.addEventListener('click', function (event) {
        event.preventDefault();
        settingsModal.style.display = "block";
    });

    // 모달 닫기 버튼
    closeSettingsBtn.addEventListener('click', function () {
        settingsModal.style.display = "none";
    });

    // 외부 클릭 시 설정 모달 닫기
    window.addEventListener('click', function (event) {
        if (event.target == settingsModal) {
            settingsModal.style.display = "none";
        }
    });

    // 뒤로가기 버튼 클릭 시 설정 모달로 돌아가기
    backToSettingsBtn.addEventListener('click', function () {
        editProjectModal.style.display = "none";
        settingsModal.style.display = "block";
    });

    // 수정 버튼 클릭 시 수정 모달 창 열기
    editProjectBtn.addEventListener('click', function (event) {
        event.preventDefault();
        editProjectModal.style.display = "block";

        // 기존 프로젝트 이름과 설명을 입력 필드에 표시
        changedProjectNameInput.value = projectName || '';
        changedDescriptionInput.value = description || '';

        // 설정 모달 닫기
        settingsModal.style.display = "none";
    });

    // 수정 모달 닫기 버튼
    closeEditModalBtn.addEventListener('click', function () {
        editProjectModal.style.display = "none";
        clearCommitSuccessMessage(); // 커밋 성공 메시지와 체크 아이콘 제거
        clearCommitMessage(); // 커밋 메시지 입력 필드 내용 제거
    });

    // 외부 클릭 시 수정 모달 닫기
    window.addEventListener('click', function (event) {
        if (event.target == editProjectModal) {
            editProjectModal.style.display = "none";
            clearCommitSuccessMessage(); // 커밋 성공 메시지와 체크 아이콘 제거
            clearCommitMessage(); // 커밋 메시지 입력 필드 내용 제거
        }
    });

    // 프로젝트 업데이트 시 처리
    saveChangesBtn.addEventListener('click', async function () {
        const changedProjectName = changedProjectNameInput.value.trim();
        const changedDescription = changedDescriptionInput.value.trim();

        if (!changedProjectName || !changedDescription) {
            Swal.fire({
                title: '입력 부족',
                text: '프로젝트 이름과 설명을 모두 입력하세요.',
                icon: 'warning',
                confirmButtonText: '확인'
            });
            return;
        }

        try {
            const timestamp = new Date().getTime(); // 캐시 방지를 위한 타임스탬프 추가
            const response = await fetch(`http://localhost:8080/api/personal/repo?ts=${timestamp}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                body: JSON.stringify({
                    projectId: projectId,
                    changedProjectName: changedProjectName,
                    changedDescription: changedDescription
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update project');
            }

            const responseData = await response.json();
            console.log('프로젝트 업데이트 성공:', responseData);

            sessionStorage.setItem('projectName', responseData.projectNameAfterChange);
            sessionStorage.setItem('description', responseData.descriptionAfterChange);

            projectNameElement.textContent = responseData.projectNameAfterChange;
            projectDescriptionElement.textContent = responseData.descriptionAfterChange;

            Swal.fire({
                title: '업데이트 완료!',
                text: '프로젝트 정보가 성공적으로 업데이트되었습니다.',
                icon: 'success',
                confirmButtonText: '확인'
            }).then(() => {
                editProjectModal.style.display = "none";
            });
        } catch (error) {
            console.error('Error updating project:', error);
            Swal.fire({
                title: '업데이트 실패',
                text: '프로젝트 정보 업데이트에 실패했습니다.',
                icon: 'error',
                confirmButtonText: '확인'
            });
        }
    });

    // 프로젝트 삭제 함수
    async function deleteRepository(projectId) {
        const accessToken = localStorage.getItem('accessToken');
        const confirmDelete = await Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: `이 작업은 되돌릴 수 없습니다. 프로젝트를 삭제하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '네, 삭제합니다',
            cancelButtonText: '아니요, 취소합니다'
        });

        if (confirmDelete.isConfirmed) {
            try {
                const timestamp = new Date().getTime(); // 캐시 방지를 위한 타임스탬프 추가
                const response = await fetch(`http://localhost:8080/api/personal/repo/${projectId}?ts=${timestamp}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });

                if (response.status === 204) {
                    Swal.fire({
                        title: '삭제 완료!',
                        text: '프로젝트가 성공적으로 삭제되었습니다.',
                        icon: 'success',
                        confirmButtonText: '확인'
                    }).then(() => {
                        // 삭제 후 프로젝트 목록 페이지로 이동
                        window.location.href = 'http://localhost:8080/project_list';
                    });
                } else {
                    const errorText = await response.text();
                    console.error('Failed to delete repository:', errorText);
                    Swal.fire({
                        title: '삭제 실패',
                        text: '프로젝트 삭제에 실패했습니다.',
                        icon: 'error',
                        confirmButtonText: '확인'
                    });
                }
            } catch (error) {
                console.error('Error deleting repository:', error);
                Swal.fire({
                    title: '오류 발생',
                    text: '프로젝트 삭제 중 오류가 발생했습니다.',
                    icon: 'error',
                    confirmButtonText: '확인'
                });
            }
        }
    }

    // 삭제 버튼에 이벤트 리스너 추가
    document.querySelector('.delete-repo-btn').addEventListener('click', function () {
        const projectId = sessionStorage.getItem('projectId');
        if (projectId) {
            deleteRepository(projectId);
        } else {
            Swal.fire({
                title: '오류',
                text: '프로젝트 ID를 찾을 수 없습니다.',
                icon: 'error',
                confirmButtonText: '확인'
            });
        }
    });

    async function fetchProjectMetadata(projectName) {
        console.log('fetchProjectMetadata 호출됨, 프로젝트 이름:', projectName);

        if (!projectId) {
            console.error('projectId가 설정되지 않았습니다.');
            return;
        }

        try {
            const timestamp = new Date().getTime(); // 캐시 방지를 위한 타임스탬프 추가
            const response = await fetch(`http://localhost:8080/api/personal/project/metadata?projectId=${projectId}&ts=${timestamp}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': '*/*',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch project metadata');
            }

            const data = await response.json();
            console.log('프로젝트 메타데이터 가져옴:', data);
            displayProjectMetadata(data);
        } catch (error) {
            console.error('Error fetching project metadata:', error);
        }
    }

    function displayProjectMetadata(metadata) {
        const { projectName, description, commitInfo } = metadata;
        const metadataContainer = document.querySelector('.metadata-cards-container');

        if (!metadataContainer) {
            console.error('.metadata-cards-container 요소를 찾을 수 없습니다.');
            return;
        }

        metadataContainer.innerHTML = ''; // 기존 내용을 지우고 새로 채우기

        commitInfo.forEach((commit, index) => {
            const commitCard = document.createElement('div');
            commitCard.className = 'commit-card';
            commitCard.innerHTML = `
               <div class="icon-buttons" style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
                    <button class="delete-icon-btn" data-commit-id="${commit.commitId}" style="background: none; border: none; color: #e74c3c; font-size: 16px; margin-left: 10px; cursor: pointer;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <button class="download-icon-btn" data-commit-id="${commit.commitId}" style="background: none; border: none; color: #2ecc71; font-size: 16px; margin-left: 10px; cursor: pointer;">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
                <p style="text-align: center; font-weight: bold; font-size: 18px; margin: 0 0 20px 0; color: #0e639c;">${index + 1}</p>
                <ul style="list-style-type: none; padding: 0; margin: 0 0 20px 0;">
                    <!-- >
                    <li style="margin-bottom: 15px;">
                        <strong style="display: block; margin-bottom: 5px; color: #0e639c;">커밋 코드:</strong>
                        <span style="word-break: break-all;">${commit.commitCode}</span>
                    </li>
                    <-->
                    <li style="margin-bottom: 15px;">
                        <strong style="display: block; margin-bottom: 5px; color: #0e639c;">커밋 메시지:</strong>
                        <span style="word-break: break-word;">${commit.commitMessage}</span>
                    </li>
                    <li style="margin-bottom: 15px;">
                        <strong style="display: block; margin-bottom: 5px; color: #0e639c;">생성 날짜:</strong>
                        <span>${new Date(commit.createdDate).toLocaleString()}</span>
                    </li>
                </ul>
                <button class="view-commit-btn" data-commit-id="${commit.commitId}" style="display: block; width: 100%; padding: 10px; background-color: #0e639c; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;">선택</button>
                <div class="commit-details" style="display: none; margin-top: 15px; border-top: 1px solid #3c3c3c; padding-top: 15px;"></div>
            `;
            metadataContainer.appendChild(commitCard);
        });
    }

    // 이벤트 리스너를 한 번만 등록
    metadataContainer.addEventListener('click', async function (event) {
        if (event.target.closest('.delete-icon-btn')) {
            const button = event.target.closest('.delete-icon-btn');
            const commitId = button.getAttribute('data-commit-id');
            const commitCard = button.closest('.commit-card');
            const commitIndex = Array.from(metadataContainer.children).indexOf(commitCard);

            if (commitIndex === 0) {
                Swal.fire({
                    title: '삭제 불가',
                    text: '첫 번째 커밋이력은 삭제가 불가능합니다.',
                    icon: 'warning',
                    confirmButtonText: '확인'
                });
                return;
            }

            const confirmDelete = await Swal.fire({
                title: '(주의) 커밋 이력 삭제',
                text: '커밋 이력 삭제 버튼을 누르시면 이후에 만들어진 커밋 이력도 전부 삭제됩니다.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '네, 삭제합니다',
                cancelButtonText: '아니요, 취소합니다'
            });

            if (confirmDelete.isConfirmed) {
                try {
                    const timestamp = new Date().getTime(); // 캐시 방지를 위한 타임스탬프 추가
                    const response = await fetch(`http://localhost:8080/api/personal/project/commit/${commitId}?ts=${timestamp}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                        }
                    });

                    if (response.status === 204) {
                        // 삭제 후 커밋 목록을 다시 로드하여 갱신
                        await fetchProjectMetadata(projectName);
                    } else {
                        throw new Error('Failed to delete commit');
                    }
                } catch (error) {
                    console.error('Error deleting commit:', error);
                }
            }
        }

        if (event.target.closest('.download-icon-btn')) {
            const button = event.target.closest('.download-icon-btn');
            const commitId = button.getAttribute('data-commit-id');
            const timestamp = new Date().getTime(); // 캐시 방지를 위한 타임스탬프 추가
            const apiUrl = `http://localhost:8080/api/personal/project/download?commitId=${commitId}&ts=${timestamp}`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Accept': '*/*',
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to download file');
                }

                const contentDisposition = response.headers.get('Content-Disposition');
                const fileName = contentDisposition ? contentDisposition.split('filename=')[1].replace(/"/g, '') : 'downloaded_file.zip';

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = decodeURIComponent(fileName);
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error downloading file:', error);
            }
        }

        if (event.target.classList.contains('view-commit-btn')) {
            const commitId = event.target.getAttribute('data-commit-id');
            const commitCard = event.target.closest('.commit-card');
            const commitDetails = commitCard.querySelector('.commit-details');

            if (commitId) {
                if (selectedMetadataCard) {
                    selectedMetadataCard.style.borderColor = '';
                }

                selectedMetadataCard = commitCard;
                selectedMetadataCard.style.borderColor = 'blue';

                await fetchCommitDetails(commitId, commitDetails);

                // Changes 버튼을 눌렀을 때 branchContent 모달 닫기
                branchContent.style.display = "none";
            }
        }
    });

    async function fetchCommitDetails(commitId, commitDetails) {
        try {
            const timestamp = new Date().getTime(); // 캐시 방지를 위한 타임스탬프 추가
            const response = await fetch(`http://localhost:8080/api/personal/project/commit?commitId=${commitId}&ts=${timestamp}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': '*/*',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch commit details');
            }

            const data = await response.json();
            displayCommitDetails(data, commitDetails, commitId);
        } catch (error) {
            console.error('Error fetching commit details:', error);
        }
    }

    function displayCommitDetails(data, commitDetails, commitId) {
        const { fileNameWithPathList } = data;

        const treeData = buildFileTree(fileNameWithPathList);
        const treeHtml = renderFileTree(treeData, commitId);
        commitCardsContainer.innerHTML = `${treeHtml}`;
        commitCardsContainer.style.display = 'block';

        addTreeToggleEvent();
        addFileSelectEvent();
    }

    function buildFileTree(paths) {
        const root = {};

        paths.forEach(path => {
            const parts = path.split('/');
            let currentNode = root;

            parts.forEach((part, index) => {
                if (!currentNode[part]) {
                    currentNode[part] = index === parts.length - 1 ? null : {};
                }
                currentNode = currentNode[part];
            });
        });

        return root;
    }

    function renderFileTree(tree, commitId, path = '') {
        let html = '<ul>';
        for (const key in tree) {
            const newPath = path ? `${path}/${key}` : key;
            html += `<li class="tree-node" data-path="${newPath}" data-commit-id="${commitId}">`;
            if (tree[key] !== null) {
                html += `<span class="toggle-icon">></span> <span class="directory-icon">${key}</span>`;
                html += renderFileTree(tree[key], commitId, newPath);
            } else {
                html += `<input type="checkbox" class="file-checkbox" data-path="${newPath}" data-commit-id="${commitId}"> <span class="file-icon">${key}</span>`;
            }
            html += '</li>';
        }
        html += '</ul>';
        return html;
    }

    function addTreeToggleEvent() {
        document.querySelectorAll('.tree-node > .toggle-icon').forEach(toggleIcon => {
            toggleIcon.addEventListener('click', function () {
                const listItem = this.parentElement;
                const sublist = listItem.querySelector('ul');

                if (sublist) {
                    if (sublist.style.display === 'none' || sublist.style.display === '') {
                        sublist.style.display = 'block';
                        this.textContent = 'v';
                    } else {
                        sublist.style.display = 'none';
                        this.textContent = '>';
                    }
                }
            });
        });
    }

    function addFileSelectEvent() {
        document.querySelectorAll('.file-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', async function () {
                if (this.checked) {
                    document.querySelectorAll('.file-checkbox').forEach(box => {
                        if (box !== this) box.checked = false;
                    });

                    const listItem = this.closest('.tree-node');
                    const filePath = listItem.getAttribute('data-path');
                    const commitId = listItem.getAttribute('data-commit-id');

                    await fetchFileContent(commitId, filePath);
                } else {
                    clearFileContent();
                }
            });
        });

        document.querySelectorAll('.file-icon').forEach(fileIcon => {
            fileIcon.addEventListener('click', async function () {
                const listItem = this.closest('.tree-node');
                const checkbox = listItem.querySelector('.file-checkbox');

                document.querySelectorAll('.file-checkbox').forEach(box => {
                    box.checked = false;
                });

                checkbox.checked = true;

                const filePath = listItem.getAttribute('data-path');
                const commitId = listItem.getAttribute('data-commit-id');
                const fileType = filePath.split('.').pop().toLowerCase();

                if (checkbox.checked) {
                    if (['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(fileType)) {
                        await fetchImageFile(commitId, filePath);
                    } else {
                        await fetchFileContent(commitId, filePath);
                    }
                } else {
                    clearFileContent();
                }
            });
        });
    }

    async function fetchFileContent(commitId, filePath) {
        const timestamp = new Date().getTime(); // 캐시 방지를 위한 타임스탬프 추가
        const apiUrl = `http://localhost:8080/api/personal/project/text-file?commitId=${commitId}&filePath=${encodeURIComponent(filePath)}&ts=${timestamp}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': '*/*',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch file content');
            }

            const textContent = await response.text();
            displayTextContent(textContent);
        } catch (error) {
            console.error('Error fetching file content:', error);
        }
    }

    async function fetchImageFile(commitId, filePath) {
        const timestamp = new Date().getTime(); // 캐시 방지를 위한 타임스탬프 추가
        const apiUrl = `http://localhost:8080/api/personal/project/image-file?commitId=${commitId}&filePath=${encodeURIComponent(filePath)}&ts=${timestamp}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': '*/*',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch image file');
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            displayImageContent(imageUrl);
        } catch (error) {
            console.error('Error fetching image file:', error);
        }
    }

    function displayImageContent(imageUrl) {
        const contentContainer = document.getElementById('file-content-display');
        if (contentContainer) {
            contentContainer.innerHTML = `<img src="${imageUrl}" alt="Image File" style="max-width: 100%; height: auto;" />`;
        }
    }

    function displayTextContent(text) {
        const contentContainer = document.getElementById('file-content-display');
        if (contentContainer) {
            const lines = text.split('\n');
            const numberedLines = lines.map((line, index) => {
                return `<div class="line"><span class="line-number">${index + 1}</span> ${escapeHtml(line)}</div>`;
            }).join('');
            contentContainer.innerHTML = `<pre>${numberedLines}</pre>`;
        }
    }

    function clearFileContent() {
        const contentContainer = document.getElementById('file-content-display');
        if (contentContainer) {
            contentContainer.innerHTML = '';
        }
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function showCheckIcon(button, message = '') {
        // 기존의 체크 아이콘을 제거하지 않도록 수정
        let checkIcon = button.parentElement.querySelector('.check-icon');
        if (!checkIcon) {
            // 체크 아이콘이 없을 때만 새로 생성
            checkIcon = document.createElement('span');
            checkIcon.className = 'check-icon';
            checkIcon.style.marginLeft = '10px'; // 버튼과의 간격을 조정
            button.insertAdjacentElement('afterend', checkIcon);
            setTimeout(() => checkIcon.classList.add('show'), 100); // Show check icon with delay
        }

        // 메시지도 기존의 메시지를 제거하지 않도록 수정
        let uploadMessage = button.parentElement.querySelector('.upload-message');
        if (!uploadMessage && message) {
            // 메시지가 없을 때만 새로 생성
            uploadMessage = document.createElement('span');
            uploadMessage.className = 'upload-message';
            uploadMessage.style.marginLeft = '10px'; // 메시지와 체크 아이콘 사이에 거리를 줍니다.
            uploadMessage.textContent = message;
            checkIcon.insertAdjacentElement('beforebegin', uploadMessage);
        }
    }

    if (file1) {
        // 이벤트 리스너를 초기화하기 전에 기존 리스너 제거 (중복 리스너 방지)
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

            // 파일 크기가 100MB를 초과하면 경고 메시지를 표시하고 리턴
            const maxSizeInBytes = 100 * 1024 * 1024; // 100MB
            if (totalSize > maxSizeInBytes) {
                Swal.fire({
                    title: '파일 크기 초과',
                    text: '100MB 이상의 프로젝트는 업로드 할 수 없습니다.',
                    icon: 'warning',
                    confirmButtonText: '확인'
                });
                return; // 함수 종료
            }

            // 폴더명 가져오기
            const folderName = files[0].webkitRelativePath.split('/')[0];
            const message = `'${folderName}' 폴더가 업로드되었습니다.`;

            // 이미 존재하는 체크 아이콘과 메시지를 지우기
            const previousCheckIcon = document.querySelector('.check-icon');
            const previousMessage = document.querySelector('.upload-message');
            if (previousCheckIcon) previousCheckIcon.remove();
            if (previousMessage) previousMessage.remove();

            // 새로운 체크 아이콘과 메시지 표시
            showCheckIcon(document.querySelector('.open-file-btn'), message);
        } catch (error) {
            console.error('Error reading files:', error);
        }
    }

    // 체크 아이콘과 메시지 제거 함수
    function clearCheckIconAndMessage() {
        const checkIcon = document.querySelector('.check-icon');
        const uploadMessage = document.querySelector('.upload-message');
        if (checkIcon) checkIcon.remove();
        if (uploadMessage) uploadMessage.remove();
    }

    // 커밋 성공 메시지와 체크 아이콘 제거 함수
    function clearCommitSuccessMessage() {
        const successMessage = document.querySelector('.commit-success-message');
        const checkIcon = document.querySelector('.check-icon');
        if (successMessage) successMessage.remove();
        if (checkIcon) checkIcon.remove();
    }

    // 커밋 메시지 입력 필드 내용 제거 함수
    function clearCommitMessage() {
        commitMessageInput.value = '';
    }

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

                const timestamp = new Date().getTime(); // 캐시 방지를 위한 타임스탬프 추가
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

                // 커밋이 성공했을 때 메시지와 체크 아이콘을 표시
                Swal.fire({
                    title: '커밋 성공',
                    text: '커밋이 완료되었습니다.',
                    icon: 'success',
                    confirmButtonText: '확인'
                }).then(() => {
                    // Commit 버튼 클릭 시 모달 닫기
                    sideContentModal.style.display = "none";
                });

            } catch (error) {
                console.error('Error committing files:', error);
                Swal.fire({
                    title: '커밋 실패',
                    text: '커밋 중 오류가 발생했습니다.',
                    icon: 'error',
                    confirmButtonText: '확인'
                });
            }
        });
    }

    if (file1) {
        file1.addEventListener('change', async function () {
            const files = this.files;
            try {
                const fileContents = await getFileContents(files);
                showCheckIcon(document.querySelector('.open-file-btn')); // 체크 아이콘 표시
            } catch (error) {
                console.error('Error reading files:', error);
            }
        });
    }

    if (file2) {
        file2.addEventListener('change', async function () {
            const fileNames = [];
            const contentContainer = document.getElementById('file2-content-display');

            for (let i = 0; i < this.files.length; i++) {
                const file = this.files[i];
                fileNames.push(file.name);
                const reader = new FileReader();

                reader.onload = function (event) {
                    const content = event.target.result;
                    contentContainer.innerHTML += `<pre>${escapeHtml(content)}</pre>`;
                };

                reader.readAsText(file);
            }

            document.getElementById('file2-name').textContent = fileNames.join(', '); // 파일 이름 표시
        });
    }


    if (compareBtn) {
        compareBtn.addEventListener('click', async function () {
            await compareFiles();
        });
    }


    async function getFileContents(files) {
        const fileContents = [];
        for (let file of files) {
            if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
                try {
                    const content = await readFileContent(file);
                    fileContents.push({ name: file.webkitRelativePath, content: content });
                } catch (error) {
                    console.error('Error reading file:', file.name, error);
                    throw error;
                }
            } else {
                console.warn('Skipping non-text file:', file.name);
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

    async function readFile(input, type) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            const content = event.target.result;
            if (type === 'changed') {
                displayChangedFileContent(content);
            }
        };

        reader.readAsText(file);
    }

    async function compareFiles() {
        const originalContentElement = document.getElementById('file-content-display');
        const changedContentElement = document.getElementById('changed-file-content');

        if (!originalContentElement || !changedContentElement) {
            console.error('One or both of the content elements are missing');
            return;
        }

        const originalContent = originalContentElement.innerText;
        const changedContent = changedContentElement.innerText;

        const originalLines = originalContent.split('\n');
        const changedLines = changedContent.split('\n');

        const highlightedOriginal = highlightDifferences(originalLines, changedLines, false);
        const highlightedChanged = highlightDifferences(changedLines, originalLines, true);

        originalContentElement.innerHTML = highlightedOriginal;
        changedContentElement.innerHTML = highlightedChanged;
    }

    function highlightDifferences(primaryLines, secondaryLines, isChangedContent) {
        return primaryLines.map((line, index) => {
            const secondaryLine = secondaryLines[index] || '';
            let backgroundColor = '';

            if (line !== secondaryLine) {
                if (!secondaryLine) {
                    backgroundColor = 'rgba(144, 238, 144, 0.3)'; // 연한 초록색 with 투명도 30% (완전히 빠진 부분)
                } else {
                    backgroundColor = 'rgba(173, 216, 230, 0.3)'; // 연한 남색 with 투명도 30% (변경된 부분)
                }
            }

            return `<div class="line" style="background-color: ${backgroundColor};">
                        <span class="line-number">${index + 1}</span> ${escapeHtml(line)}
                    </div>`;
        }).join('');
    }

    function displayChangedFileContent(content) {
        const contentContainer = document.getElementById('changed-file-content');
        if (contentContainer) {
            const lines = content.split('\n');
            const numberedLines = lines.map((line, index) => {
                return `<div class="line"><span class="line-number">${index + 1}</span> ${escapeHtml(line)}</div>`;
            }).join('');

            contentContainer.innerHTML = `<pre>${numberedLines}</pre>`;
        }
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // 파일 입력 필드를 초기화하는 함수
    window.resetFileInput = function resetFileInput(inputId) {
        const fileInput = document.getElementById(inputId);
        if (fileInput) {
            fileInput.value = ''; // 파일 입력 필드를 초기화
            setTimeout(() => fileInput.click(), 100); // 약간의 지연을 추가하여 안정적으로 작동하게 함
        }
    };
});
