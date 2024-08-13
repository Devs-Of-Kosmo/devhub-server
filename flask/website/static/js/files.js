document.addEventListener("DOMContentLoaded", function () {
    const file1 = document.getElementById('file1');
    const file2 = document.getElementById('file2');
    const compareBtn = document.getElementById('compare-btn');
    const commitBtn = document.getElementById('commit-button');
    const commitMessageInput = document.getElementById('commitMessage');
    const reviewBtn = document.getElementById('review-btn');
    const accessToken = localStorage.getItem('accessToken');
    const metadataWrapper = document.querySelector('.metadata-cards-wrapper');
    const commitCardsContainer = document.querySelector('.commit-cards-container');
    let currentProjectId = null; // 현재 프로젝트 ID 저장
    let selectedMetadataCard = null; // 선택된 메타데이터 카드

    // 레포지토리 목록 가져오기
    fetchRepositories();

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
            console.log('Fetched data:', data);
            const cardsContainer = document.querySelector('.cards-container');
            cardsContainer.innerHTML = '';

            const projects = JSON.parse(localStorage.getItem('projects') || '[]');

            data.forEach(repo => {
                if (projects.some(p => p.projectId === repo.projectId)) {
                    const card = document.createElement('div');
                    card.className = 'repo-card';
                    card.innerHTML = `
                        <div class="content">
                            <h3>${repo.projectName}</h3>
                            <p>${repo.description}</p>
                            <button class="see-more-btn" data-project-id="${repo.projectId}">더 보기</button>
                        </div>
                    `;
                    cardsContainer.appendChild(card);
                }
            });
        })
        .catch(error => console.error('Error fetching repositories:', error));
    }

    // "더 보기" 버튼 클릭 이벤트 리스너 추가
    document.querySelector('.cards-container').addEventListener('click', function (event) {
        if (event.target.classList.contains('see-more-btn')) {
            const projectId = event.target.getAttribute('data-project-id');
            if (projectId) {
                currentProjectId = projectId; // 현재 프로젝트 ID 저장
                metadataWrapper.style.display = 'flex';
                fetchProjectMetadata(projectId);
            }
        }
    });

    async function fetchProjectMetadata(projectId) {
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
            displayProjectMetadata(data);
        } catch (error) {
            console.error('Error fetching project metadata:', error);
        }
    }

    function displayProjectMetadata(metadata) {
        const { projectName, description, commitInfo } = metadata;
        const metadataContainer = document.querySelector('.metadata-cards-container');
        metadataContainer.innerHTML = '';

        commitInfo.forEach(commit => {
            const commitCard = document.createElement('div');
            commitCard.className = 'commit-card';
            commitCard.innerHTML = `
                <h3>${projectName}</h3>
                <p>${description}</p>
                <ul>
                    <li>
                        <strong>커밋 코드:</strong> ${commit.commitCode} <br>
                        <strong>커밋 메시지:</strong> ${commit.commitMessage} <br>
                        <strong>생성 날짜:</strong> ${new Date(commit.createdDate).toLocaleString()}
                    </li>
                </ul>
                <button class="view-commit-btn" data-commit-id="${commit.commitId}">커밋 조회</button>
                <div class="commit-details" style="display: none;"></div>
            `;
            metadataContainer.appendChild(commitCard);
        });

        initializeMetadataCarousel();
    }

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
            const walk = (x - startX) * 3; // 스크롤 속도 조정
            metadataContainer.scrollLeft = scrollLeft - walk;
        });
    }

    // "커밋 조회" 버튼 클릭 이벤트 리스너 추가
    document.querySelector('.metadata-cards-container').addEventListener('click', function (event) {
        if (event.target.classList.contains('view-commit-btn')) {
            const commitId = event.target.getAttribute('data-commit-id');
            const commitCard = event.target.parentElement; // 해당 커밋 카드
            const commitDetails = event.target.nextElementSibling; // 커밋 세부사항 영역

            if (commitId) {
                // 이전에 선택된 메타데이터 카드가 있으면 초기화
                if (selectedMetadataCard) {
                    selectedMetadataCard.style.borderColor = '';
                }

                // 선택된 메타데이터 카드 스타일 변경
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
            displayCommitDetails(data, commitDetails, commitId); // commitId 추가
        } catch (error) {
            console.error('Error fetching commit details:', error);
        }
    }

    function displayCommitDetails(data, commitDetails, commitId) {
        const { fileNameWithPathList } = data;

        // 트리 구조로 변환
        const treeData = buildFileTree(fileNameWithPathList);

        // 트리 구조 표시
        const treeHtml = renderFileTree(treeData, commitId);
        commitCardsContainer.innerHTML = `<h3>커밋에 포함된 파일 목록:</h3>${treeHtml}`;
        commitCardsContainer.style.display = 'block'; // 커밋 세부사항 표시

        // 돌아가기 버튼 생성
        const backButton = document.createElement('button');
        backButton.textContent = '돌아가기';
        backButton.className = 'back-btn';
        backButton.addEventListener('click', function () {
            // 돌아가기 버튼 클릭 시 초기 상태로 복원
            commitCardsContainer.innerHTML = '';
            if (selectedMetadataCard) {
                selectedMetadataCard.style.borderColor = '';
            }
            selectedMetadataCard = null;
        });
        commitCardsContainer.appendChild(backButton);

        // 트리 토글 기능 추가
        addTreeToggleEvent();

        // 파일 선택 이벤트 추가
        addFileSelectEvent();
    }

    // 파일 경로를 트리 구조로 변환
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

    // 트리 구조를 HTML로 변환
    function renderFileTree(tree, commitId, path = '') {
        let html = '<ul>';
        for (const key in tree) {
            const newPath = path ? `${path}/${key}` : key;
            html += `<li class="tree-node" data-path="${newPath}" data-commit-id="${commitId}">`;
            if (tree[key] !== null) {
                html += `<span class="toggle-icon">></span> <span class="directory-icon">${key}</span>`;
                html += renderFileTree(tree[key], commitId, newPath);
            } else {
                // 파일명 왼쪽에 체크박스 추가
                html += `<input type="checkbox" class="file-checkbox" data-path="${newPath}" data-commit-id="${commitId}"> <span class="file-icon">${key}</span>`;
            }
            html += '</li>';
        }
        html += '</ul>';
        return html;
    }

    // 트리 토글 기능 추가
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

    // 파일 선택 이벤트 추가 (체크박스 하나만 선택 가능하도록 수정)
    function addFileSelectEvent() {
        document.querySelectorAll('.file-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', async function () {
                if (this.checked) {
                    // 모든 체크박스를 선택 해제
                    document.querySelectorAll('.file-checkbox').forEach(box => {
                        if (box !== this) box.checked = false;
                    });

                    const listItem = this.closest('.tree-node');
                    const filePath = listItem.getAttribute('data-path');
                    const commitId = listItem.getAttribute('data-commit-id');

                    // 체크박스가 체크되었을 때 파일 내용을 가져와서 표시
                    await fetchFileContent(commitId, filePath);
                } else {
                    // 체크박스가 체크 해제되었을 때 파일 내용을 지우기
                    clearFileContent();
                }
            });
        });

        document.querySelectorAll('.file-icon').forEach(fileIcon => {
            fileIcon.addEventListener('click', async function () {
                const listItem = this.closest('.tree-node');
                const checkbox = listItem.querySelector('.file-checkbox');

                // 체크박스 상태를 토글
                checkbox.checked = !checkbox.checked;

                // 체크 상태에 따라 파일 내용 표시 혹은 지우기
                const filePath = listItem.getAttribute('data-path');
                const commitId = listItem.getAttribute('data-commit-id');
                if (checkbox.checked) {
                    await fetchFileContent(commitId, filePath);
                } else {
                    clearFileContent();
                }
            });
        });

        document.querySelectorAll('.file-icon').forEach(fileIcon => {
            fileIcon.addEventListener('click', async function () {
                const listItem = this.closest('.tree-node');
                const filePath = listItem.getAttribute('data-path');
                const commitId = listItem.getAttribute('data-commit-id');
                const fileType = filePath.split('.').pop().toLowerCase();

                if (fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg' || fileType === 'gif' || fileType === 'bmp') {
                    await fetchImageFile(commitId, filePath);
                }
            });
        });
    }

    // 이미지 파일 가져오기
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

    // 이미지 파일 표시
    function displayImage(blob) {
        const contentContainer = document.getElementById('file-content-display');
        if (contentContainer) {
            const imageUrl = URL.createObjectURL(blob);
            contentContainer.innerHTML = `<img src="${imageUrl}" alt="Image" style="max-width: 100%; height: auto;">`;
        }
    }

    // 파일 내용 가져오기
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

    // 텍스트 파일 내용 표시
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

    // 파일 내용 지우기
    function clearFileContent() {
        const contentContainer = document.getElementById('file-content-display');
        if (contentContainer) {
            contentContainer.innerHTML = '';
        }
    }

    // HTML 특수문자 이스케이프
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // 커밋 버튼 이벤트 리스너
    if (commitBtn) {
        commitBtn.addEventListener('click', async function () {
            const files = file1.files;
            const commitMessage = commitMessageInput.value.trim();
            const personalProjects = JSON.parse(localStorage.getItem('personal_project') || '[]');

            if (!files.length) {
                alert('커밋할 파일을 선택하세요.');
                return;
            }

            if (!commitMessage) {
                alert('커밋 메시지를 입력하세요.');
                return;
            }

            // 로컬 스토리지에서 현재 프로젝트 ID 가져오기
            const projects = JSON.parse(localStorage.getItem('projects') || '[]');
            const currentProject = projects[0]; // 첫 번째 프로젝트 선택 (필요 시 로직 수정)

            if (!currentProject || !currentProject.projectId) {
                alert('선택된 프로젝트가 없습니다.');
                return;
            }

            console.log('Access Token:', accessToken);
            console.log('Project ID:', currentProject.projectId);
            console.log('Files:', files);
            for (let file of files) {
                console.log(`File: ${file.name}, Size: ${file.size}`);
            }
            console.log('Commit Message:', commitMessage);

            try {
                // FormData 객체 생성 및 데이터 추가
                const formData = new FormData();
                for (let file of files) {
                    formData.append('files', file, file.webkitRelativePath); // 상대 경로 포함
                }
                formData.append('commitMessage', commitMessage);

                let apiUrl = 'http://localhost:8080/api/personal/project/init';
                let method = 'POST';

                // 로컬 스토리지에 personal_project가 존재하는지 확인
                if (personalProjects.length > 0) {
                    // 다음 버전 저장 API 호출 준비
                    const latestProject = personalProjects[personalProjects.length - 1];
                    formData.append('fromCommitId', latestProject.newCommitId); // 가장 최근 커밋 ID 사용
                    apiUrl = 'http://localhost:8080/api/personal/project/save';
                } else {
                    // 최초 저장인 경우 projectId 추가
                    formData.append('projectId', currentProject.projectId); // 실제 projectId 사용
                }

                // 스프링부트 서버로 POST 요청 보내기
                const response = await fetch(apiUrl, {
                    method: method,
                    headers: {
                        'Authorization': 'Bearer ' + accessToken // 헤더에 액세스 토큰 포함
                    },
                    body: formData
                });

                const contentType = response.headers.get('content-type');

                if (!response.ok) {
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        alert('커밋 실패: ' + errorData.message);
                    } else {
                        const errorText = await response.text();
                        console.error('커밋 실패:', errorText);
                        alert('예기치 않은 오류가 발생했습니다.');
                    }
                    return;
                }

                const newCommitData = await response.json();

                // 로컬 스토리지에 personal_project 리스트로 저장
                personalProjects.push(newCommitData);
                localStorage.setItem('personal_project', JSON.stringify(personalProjects));

                alert('커밋 성공!');
                console.log(newCommitData); // 응답 데이터 로그 출력
            } catch (error) {
                console.error('Error committing files:', error);
                alert('파일을 커밋하는 도중 오류가 발생했습니다.');
            }
        });
    }

    // file1 변경 이벤트 리스너
    if (file1) {
        file1.addEventListener('change', async function () {
            const files = this.files;
            try {
                const fileContents = await getFileContents(files);
                displayFileContents(fileContents, 'original');

                // 파일 내용 콘솔에 출력
                console.log('Files:', files);
                for (let file of files) {
                    const content = await readFileContent(file);
                    console.log(`File: ${file.name}, Size: ${file.size}, Content:`, content.slice(0, 100)); // 첫 100자만 출력
                }
            } catch (error) {
                console.error('Error reading files:', error);
                alert('파일을 읽는 도중 오류가 발생했습니다.');
            }
        });
    }

    // file2 변경 이벤트 리스너
    if (file2) {
        file2.addEventListener('change', async function () {
            const fileName = this.files[0].name;
            document.getElementById('file2-name').textContent = fileName;
            await readFile(this, 'changed');
        });
    }

    // compare 버튼 이벤트 리스너
    if (compareBtn) {
        compareBtn.addEventListener('click', async function () {
            await compareFiles();
        });
    }

    // review 버튼 이벤트 리스너
    if (reviewBtn) {
        reviewBtn.addEventListener('click', async function () {
            await reviewFiles();
        });
    }

    async function uploadFile(input, type) {
        const formData = new FormData();
        formData.append(input.name, input.files[0]);

        try {
            const response = await fetch('/upload', { method: 'POST', body: formData });
            const data = await response.json();

            if (type === 'original') {
                document.getElementById('original-structure-container').innerHTML = data.combined_structure.original_structure;
                addDirectoryToggle();
                addFileClickEvent();
                // Read the original file content and display it
                let originalFileContent = '';
                for (let file of data.files) {
                    originalFileContent += `<h3>${file.name}</h3><pre>${file.content}</pre>`;
                }
                document.getElementById('original-file-content').innerHTML = originalFileContent;
            } else if (type === 'changed') {
                document.getElementById('changed-file-content').innerText = data.content;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function readFile(input, type) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            const content = event.target.result;
            if (type === 'changed') {
                document.getElementById('changed-file-content').innerText = content;
            }
        };

        reader.readAsText(file);
    }

    async function displayFileContent(file, type) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const content = event.target.result;
            if (type === 'original') {
                document.getElementById('original-file-content').innerText = content;
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

    let openDirectories = {};

    async function getFileContents(files) {
        const fileContents = [];
        for (let file of files) {
            // MIME 타입을 검사하여 텍스트 파일만 읽음
            if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
                try {
                    const content = await readFileContent(file);
                    fileContents.push({ name: file.webkitRelativePath, content: content });
                } catch (error) {
                    console.error('Error reading file:', file.name, error);
                    throw error; // Rethrow the error to handle it in the calling function
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
            };
            reader.readAsText(file);
        });
    }

    function addDirectoryToggle() {
        const toggler = document.getElementsByClassName("directory");
        for (let i = 0; i < toggler.length; i++) {
            const directoryPath = toggler[i].getAttribute("data-path");

            if (!toggler[i].classList.contains("bound")) {
                toggler[i].classList.add("bound");
                toggler[i].addEventListener("click", async function (event) {
                    if (event.target.tagName === 'LI') {
                        const nested = this.querySelector(".nested");
                        if (nested) {
                            nested.classList.toggle("active");
                            this.classList.toggle("directory-open");

                            if (!nested.innerHTML) {
                                const path = this.getAttribute("data-path");
                                const type = this.getAttribute("data-type");
                                try {
                                    const response = await fetch(`/subdirectories?path=${encodeURIComponent(path)}&type=${type}`);
                                    const data = await response.json();
                                    if (data.result === "Subdirectories loaded successfully") {
                                        nested.innerHTML = data.subdirectories;
                                        addDirectoryToggle();
                                        addFileClickEvent();
                                        openDirectories[path] = true;
                                        updateOpenDirectories();
                                    } else {
                                        alert(data.result);
                                    }
                                } catch (error) {
                                    console.error('Error:', error);
                                }
                            } else {
                                if (nested.classList.contains("active")) {
                                    openDirectories[directoryPath] = true;
                                } else {
                                    delete openDirectories[directoryPath];
                                }
                                updateOpenDirectories();
                            }
                        }
                    }
                });
            }

            if (openDirectories[directoryPath]) {
                toggler[i].classList.add("directory-open");
                const nested = toggler[i].querySelector(".nested");
                if (nested) {
                    nested.classList.add("active");
                }
            }
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

    function updateOpenDirectories() {
        const toggler = document.getElementsByClassName("directory");
        for (let i = 0; i < toggler.length; i++) {
            const directoryPath = toggler[i].getAttribute("data-path");
            if (openDirectories[directoryPath]) {
                toggler[i].classList.add("directory-open");
                const nested = toggler[i].querySelector(".nested");
                if (nested) {
                    nested.classList.add("active");
                }
            } else {
                toggler[i].classList.remove("directory-open");
                const nested = toggler[i].querySelector(".nested");
                if (nested) {
                    nested.classList.remove("active");
                }
            }
        }
    }

    function addFileClickEvent() {
        const files = document.getElementsByClassName("file");
        for (let i = 0; i < files.length; i++) {
            if (!files[i].classList.contains("bound")) {
                files[i].classList.add("bound");
                files[i].addEventListener("click", async function () {
                    const filePath = this.getAttribute("data-path");
                    const fileType = this.getAttribute("data-type");
                    try {
                        const response = await fetch('/file?path=' + encodeURIComponent(filePath));
                        const data = await response.json();
                        if (data.result === "File loaded successfully") {
                            if (fileType === 'original') {
                                document.getElementById('original-file-content').innerText = data.content;
                            }
                        } else {
                            alert(data.result);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }
                });
            }
        }
    }
});
