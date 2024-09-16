// metadata.js

document.addEventListener("DOMContentLoaded", function () {
    const metadataContainer = document.querySelector('.metadata-cards-container');
    const accessToken = localStorage.getItem('accessToken');
    const projectName = sessionStorage.getItem('projectName');
    const projectId = sessionStorage.getItem('projectId');
    const commitCardsContainer = document.querySelector('.commit-cards-container');
    let selectedMetadataCard = null;

    async function fetchProjectMetadata(projectName) {
        console.log('fetchProjectMetadata 호출됨, 프로젝트 이름:', projectName);

        if (!projectId) {
            console.error('projectId가 설정되지 않았습니다.');
            return;
        }

        try {
            const timestamp = new Date().getTime();
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

        metadataContainer.innerHTML = '';

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
                    const timestamp = new Date().getTime();
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
            const timestamp = new Date().getTime();
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

                const branchContent = document.getElementById('branchContent');
                branchContent.style.display = "none";
            }
        }
    });

    async function fetchCommitDetails(commitId, commitDetails) {
        try {
            const timestamp = new Date().getTime();
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
        const timestamp = new Date().getTime();
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
        const timestamp = new Date().getTime();
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

    window.fetchProjectMetadata = fetchProjectMetadata;
});
