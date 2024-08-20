document.addEventListener("DOMContentLoaded", function () {
    const file1 = document.getElementById('file1');
    const file2 = document.getElementById('file2');
    const compareBtn = document.getElementById('compare-btn');
    const commitBtn = document.getElementById('commit-button');
    const commitMessageInput = document.getElementById('commitMessage');
    const reviewBtn = document.getElementById('review-btn');
    const accessToken = localStorage.getItem('accessToken');
    const projectName = sessionStorage.getItem('projectName'); // 세션 스토리지에서 projectName 가져오기
    const projectId = sessionStorage.getItem('projectId'); // 세션 스토리지에서 projectId 가져오기
    const description = sessionStorage.getItem('description'); // 세션 스토리지에서 description 가져오기
    const createdDate = sessionStorage.getItem('createdDate'); // 세션 스토리지에서 createdDate 가져오기
    const metadataWrapper = document.querySelector('.metadata-cards-wrapper');
    const commitCardsContainer = document.querySelector('.commit-cards-container');
    const metadataContainer = document.querySelector('.metadata-cards-container');
    let selectedMetadataCard = null;

    const sideContentModal = document.getElementById('sideContentModal');
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const closeModalBtn = document.querySelector('.close-btn');

    toggleSidebarBtn.addEventListener('click', function (event) {
        event.preventDefault();
        sideContentModal.style.display = "block";
    });

    closeModalBtn.addEventListener('click', function () {
        sideContentModal.style.display = "none";
    });

    window.addEventListener('click', function (event) {
        if (event.target == sideContentModal) {
            sideContentModal.style.display = "none";
        }
    });

    // 레포지토리 목록 가져오기
    function fetchRepositories() {
        fetch('http://localhost:8080/api/personal/repo/list', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': '*/*'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const cardsContainer = document.querySelector('.cards-container');
            cardsContainer.innerHTML = '';

            // 가져온 레포지토리 정보를 바탕으로 카드 생성 (projectName이 일치하는 레포만 표시)
            data.forEach(repo => {
                if (repo.projectName === projectName) {
                    const card = document.createElement('div');
                    card.className = 'repo-card';
                    card.innerHTML = `
                        <div class="content">
                            <h3>${repo.projectName}</h3>
                            <p>${repo.description}</p>
                            <div style="display: flex; justify-content: space-between;">
                                <button class="see-more-btn" data-project-name="${repo.projectName}">Commit History</button>
                                <button class="delete-repo-btn" data-project-name="${repo.projectName}" style="background: none; border: none; cursor: pointer;">
                                    <i class="fas fa-trash-alt" style="color: red;"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    cardsContainer.appendChild(card);
                }
            });
        })
        .catch(error => console.error('Error fetching repositories:', error));
    }

    // "더 보기" 버튼 및 삭제 버튼 클릭 이벤트 리스너 추가
    document.querySelector('.cards-container').addEventListener('click', function (event) {
        const target = event.target;

        // 커밋 히스토리 보기 버튼 클릭
        if (target.classList.contains('see-more-btn')) {
            const projectName = target.getAttribute('data-project-name');
            if (projectName) {
                fetchProjectMetadata(projectName);
            }
        }

        // 레포지토리 삭제 버튼 클릭
        if (target.closest('.delete-repo-btn')) {
            const projectName = target.closest('.delete-repo-btn').getAttribute('data-project-name');
            if (projectName) {
                const confirmDelete = confirm('정말로 이 레포지토리를 삭제하시겠습니까?');
                if (confirmDelete) {
                    deleteRepository(projectName);
                }
            }
        }
    });

    async function deleteRepository(projectName) {
        console.log('Deleting project with ID:', projectId);
        console.log('Using accessToken:', accessToken);

        try {
            const response = await fetch(`http://localhost:8080/api/personal/repo/${projectId}`, {  // 수정된 부분
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.status === 204) {
                alert('레포지토리가 성공적으로 삭제되었습니다.');
                window.location.href = 'http://localhost:8080/project_list';
            } else {
                const errorText = await response.text();  // 서버에서 전달하는 에러 메시지 확인
                console.error('Failed to delete repository:', errorText);
                throw new Error('Failed to delete repository');
            }
        } catch (error) {
            console.error('Error deleting repository:', error);
            alert('레포지토리 삭제 중 오류가 발생했습니다.');
        }
    }



    async function fetchProjectMetadata(projectName) {
        console.log('fetchProjectMetadata 호출됨, 프로젝트 이름:', projectName);
        try {
            const response = await fetch(`http://localhost:8080/api/personal/project/metadata?projectId=${projectId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': '*/*'
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
        metadataContainer.innerHTML = ''; // 기존 내용을 지우고 새로 채우기

        commitInfo.forEach(commit => {
            const commitCard = document.createElement('div');
            commitCard.className = 'commit-card';
            commitCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0;">
                        ${projectName}
                    </h3>
                    <div>
                        <button class="delete-icon-btn" data-commit-id="${commit.commitId}" style="background: none; border: none; cursor: pointer; margin-right: 8px;">
                            <i class="fas fa-trash-alt" style="color: white;"></i>
                        </button>
                        <button class="download-icon-btn" data-commit-id="${commit.commitId}" style="background: none; border: none; cursor: pointer;">
                            <i class="fas fa-download" style="color: white;"></i>
                        </button>
                    </div>
                </div>
                <p>${description}</p>
                <ul>
                    <li>
                        <strong>커밋 코드:</strong> ${commit.commitCode} <br>
                        <strong>커밋 메시지:</strong> ${commit.commitMessage} <br>
                        <strong>생성 날짜:</strong> ${new Date(commit.createdDate).toLocaleString()}
                    </li>
                </ul>
                <button class="view-commit-btn" data-commit-id="${commit.commitId}" style="color: white;">Changes</button>
                <div class="commit-details" style="display: none;"></div>
            `;
            metadataContainer.appendChild(commitCard);
        });

        console.log('메타데이터가 제대로 표시되었습니다.');
    }

    // 이벤트 리스너를 한 번만 등록
    metadataContainer.addEventListener('click', async function(event) {
        if (event.target.closest('.delete-icon-btn')) {
            const button = event.target.closest('.delete-icon-btn');
            const commitId = button.getAttribute('data-commit-id');
            const confirmDelete = confirm('정말로 이 커밋을 삭제하시겠습니까?');

            if (confirmDelete) {
                try {
                    const response = await fetch(`http://localhost:8080/api/personal/project/commit/${commitId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });

                    if (response.status === 204) {
                        alert('커밋이 성공적으로 삭제되었습니다.');
                        button.closest('.commit-card').remove();
                    } else {
                        throw new Error('Failed to delete commit');
                    }
                } catch (error) {
                    console.error('Error deleting commit:', error);
                    alert('커밋 삭제 중 오류가 발생했습니다.');
                }
            }
        }

        if (event.target.closest('.download-icon-btn')) {
            const button = event.target.closest('.download-icon-btn');
            const commitId = button.getAttribute('data-commit-id');
            const apiUrl = `http://localhost:8080/api/personal/project/download?commitId=${commitId}`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Accept': '*/*'
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
                alert('파일을 다운로드하는 도중 오류가 발생했습니다.');
            }
        }
    });

    // 초기화 로직에서 이벤트 리스너를 한 번만 호출하도록 변경
    function initializeMetadataCarousel() {
        const metadataContainer = document.querySelector('.metadata-cards-container');
        let isMouseDown = false;
        let startX, scrollLeft;

        metadataContainer.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            metadataContainer.classList.add('active');
            startX = e.pageX - metadataContainer.offsetLeft;
            scrollLeft = metadataContainer.scrollLeft;
        });

        metadataContainer.addEventListener('mouseleave', () => {
            isMouseDown = false;
            metadataContainer.classList.remove('active');
        });

        metadataContainer.addEventListener('mouseup', () => {
            isMouseDown = false;
            metadataContainer.classList.remove('active');
        });

        metadataContainer.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            e.preventDefault();
            const x = e.pageX - metadataContainer.offsetLeft;
            const walk = (x - startX) * 3;
            metadataContainer.scrollLeft = scrollLeft - walk;
        });
    }

    // "커밋 조회" 버튼 클릭 이벤트 리스너 추가
    document.querySelector('.metadata-cards-container').addEventListener('click', function (event) {
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

                fetchCommitDetails(commitId, commitDetails);
            }
        }
    });

    async function fetchCommitDetails(commitId, commitDetails) {
        try {
            const response = await fetch(`http://localhost:8080/api/personal/project/commit?commitId=${commitId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': '*/*'
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

        const backButton = document.createElement('button');
        backButton.textContent = '돌아가기';
        backButton.className = 'back-btn';
        backButton.addEventListener('click', function () {
            commitCardsContainer.innerHTML = '';
            if (selectedMetadataCard) {
                selectedMetadataCard.style.borderColor = '';
            }
            selectedMetadataCard = null;
        });
        commitCardsContainer.appendChild(backButton);

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

    async function fetchImageFile(commitId, filePath) {
        const apiUrl = `http://localhost:8080/api/personal/project/image-file?commitId=${commitId}&filePath=${encodeURIComponent(filePath)}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch image file');
            }

            const blob = await response.blob();
            displayImage(blob);
        } catch (error) {
            console.error('Error fetching image file:', error);
        }
    }

    function displayImage(blob) {
        const contentContainer = document.getElementById('file-content-display');
        if (contentContainer) {
            const imageUrl = URL.createObjectURL(blob);
            contentContainer.innerHTML = `<img src="${imageUrl}" alt="Image" style="max-width: 100%; height: auto;">`;
        }
    }

    async function fetchFileContent(commitId, filePath) {
        const apiUrl = `http://localhost:8080/api/personal/project/text-file?commitId=${commitId}&filePath=${encodeURIComponent(filePath)}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': '*/*'
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

    if (commitBtn) {
        commitBtn.addEventListener('click', async function () {
            const files = file1.files;
            const commitMessage = commitMessageInput.value.trim();
            const personalProjects = JSON.parse(localStorage.getItem('personal_project') || '[]');

            console.log("커밋 버튼 클릭됨");
            console.log("선택된 파일 수:", files.length);
            console.log("입력된 커밋 메시지:", commitMessage);

            if (!files.length) {
                alert('커밋할 파일을 선택하세요.');
                return;
            }

            if (!commitMessage) {
                alert('커밋 메시지를 입력하세요.');
                return;
            }

            try {
                const formData = new FormData();
                for (let file of files) {
                    formData.append('files', file, file.webkitRelativePath);
                }
                formData.append('commitMessage', commitMessage);

                console.log("FormData 생성 완료");
                console.log("FormData 내용:", Array.from(formData.entries()));

                let apiUrl = 'http://localhost:8080/api/personal/project/init';
                let method = 'POST';

                if (personalProjects.length > 0) {
                    const latestProject = personalProjects[personalProjects.length - 1];
                    formData.append('fromCommitId', latestProject.newCommitId);
                    apiUrl = 'http://localhost:8080/api/personal/project/save';
                } else {
                    formData.append('projectId', projectId);
                }

                console.log("API URL:", apiUrl);

                const response = await fetch(apiUrl, {
                    method: method,
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    },
                    body: formData
                });

                console.log("API 요청 완료. 응답 상태 코드:", response.status);
                console.log("응답 Content-Type:", response.headers.get('content-type'));

                if (!response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        console.log("커밋 실패 (JSON 응답):", errorData);
                        alert('커밋 실패: ' + errorData.message);
                    } else {
                        const errorText = await response.text();
                        console.error('커밋 실패:', errorText);
                        alert('예기치 않은 오류가 발생했습니다.');
                    }
                    return;
                }

                const newCommitData = await response.json();
                personalProjects.push(newCommitData);
                localStorage.setItem('personal_project', JSON.stringify(personalProjects));

                alert('커밋 성공!');
            } catch (error) {
                console.error('Error committing files:', error);
                alert('파일을 커밋하는 도중 오류가 발생했습니다.');
            }
        });
    }



    if (file1) {
        file1.addEventListener('change', async function () {
            const files = this.files;
            try {
                const fileContents = await getFileContents(files);
                displayFileContents(fileContents, 'original');
            } catch (error) {
                console.error('Error reading files:', error);
                alert('파일을 읽는 도중 오류가 발생했습니다.');
            }
        });
    }

    if (file2) {
        file2.addEventListener('change', async function () {
            const fileName = this.files[0].name;
            document.getElementById('file2-name').textContent = fileName;
            await readFile(this, 'changed');
        });
    }

    if (compareBtn) {
        compareBtn.addEventListener('click', async function () {
            await compareFiles();
        });
    }

    if (reviewBtn) {
        reviewBtn.addEventListener('click', async function () {
            await reviewFiles();
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

    function displayFileContents(fileContents, type) {
        if (type === 'original') {
            let contentHtml = '';
            fileContents.forEach(file => {
                contentHtml += `<h3>${file.name}</h3><pre>${escapeHtml(file.content)}</pre>`;
            });
            document.getElementById('original-file-content').innerHTML = contentHtml;
        }
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
        const originalContent = document.getElementById('original-file-content').innerText;
        const changedContent = document.getElementById('changed-file-content').innerText;

        try {
            const response = await fetch('/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ original: originalContent, changed: changedContent }),
            });
            const data = await response.json();

            const resultElement = document.getElementById('comparison-result');
            resultElement.innerHTML = data.differences;
            resultElement.classList.add('show');
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function reviewFiles() {
        const originalContent = document.getElementById('original-file-content').innerText;
        const changedContent = document.getElementById('changed-file-content').innerText;

        try {
            const response = await fetch('/review_files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file1: originalContent, file2: changedContent }),
            });
            const data = await response.json();
            const resultElement = document.getElementById('review-result');
            if (data.result === "success") {
                resultElement.innerHTML = `<h3>리뷰 피드백:</h3><p>${data.review}</p>`;
            } else {
                resultElement.innerHTML = `<p>Error: ${data.result}</p>`;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function saveChanges() {
        const originalContent = Array.from(document.getElementById('original-file-content').querySelectorAll('pre'))
            .map(pre => ({ name: pre.previousSibling.textContent, content: pre.textContent }));
        const changedContent = Array.from(document.getElementById('changed-file-content').querySelectorAll('pre'))
            .map(pre => ({ name: pre.previousSibling.textContent, content: pre.textContent }));

        try {
            const response = await fetch('/save_changes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    original_files: originalContent,
                    changed_files: changedContent
                }),
            });
            const data = await response.json();
            const resultMessageElement = document.getElementById('result-message');
            resultMessageElement.textContent = data.result;

            if (data.result === "Files saved successfully.") {
                resultMessageElement.classList.add('success');
                resultMessageElement.classList.remove('error');
            } else {
                resultMessageElement.classList.add('error');
                resultMessageElement.classList.remove('success');
            }
        } catch (error) {
            const resultMessageElement = document.getElementById('result-message');
            resultMessageElement.textContent = '변경 사항을 저장하지 못했습니다.';
            resultMessageElement.classList.add('error');
            resultMessageElement.classList.remove('success');
            console.error('Error:', error);
        }
    }

    async function reloadOriginalFile(filePath) {
        try {
            const response = await fetch('/file?path=' + encodeURIComponent(filePath));
            const data = await response.json();
            if (data.result === "File loaded successfully") {
                document.getElementById('original-file-content').innerText = data.content;
            } else {
                alert(data.result);
            }
        } catch (error) {
            console.error('Error:', error);
        }
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

    fetchRepositories();
});
