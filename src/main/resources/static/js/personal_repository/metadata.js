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
        const treeElement = renderFileTree(treeData, commitId);
        commitCardsContainer.innerHTML = ''; // 기존 내용을 지우고
        commitCardsContainer.appendChild(treeElement); // 트리 요소를 추가합니다.
        commitCardsContainer.style.display = 'block';
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
        const ul = document.createElement('ul');

        for (const key in tree) {
            const newPath = path ? `${path}/${key}` : key;
            const li = document.createElement('li');
            li.classList.add('tree-node');
            li.dataset.path = newPath;
            li.dataset.commitId = commitId;

            if (tree[key] !== null) {
                // 폴더인 경우
                const span = document.createElement('span');
                span.classList.add('toggle-icon');
                span.innerHTML = '<i class="fas fa-caret-right"></i>'; // 닫힌 상태의 아이콘

                const folderName = document.createElement('span');
                folderName.classList.add('directory-icon');
                folderName.textContent = key;

                li.appendChild(span);
                li.appendChild(folderName);

                // 하위 트리를 생성하여 숨김 상태로 추가
                const childUl = renderFileTree(tree[key], commitId, newPath);
                childUl.style.display = 'none';
                li.appendChild(childUl);

                // 토글 이벤트 추가
                span.addEventListener('click', function () {
                    if (childUl.style.display === 'none') {
                        childUl.style.display = 'block';
                        span.innerHTML = '<i class="fas fa-caret-down"></i>'; // 열린 상태의 아이콘
                    } else {
                        childUl.style.display = 'none';
                        span.innerHTML = '<i class="fas fa-caret-right"></i>'; // 닫힌 상태의 아이콘
                    }
                });

                // 폴더 이름 클릭 시에도 토글
                folderName.addEventListener('click', function () {
                    span.click();
                });
            } else {
                // 파일인 경우
                const fileIcon = document.createElement('span');
                fileIcon.classList.add('file-icon');
                fileIcon.textContent = key;

                li.appendChild(fileIcon);

                // 파일 클릭 이벤트 추가
                fileIcon.addEventListener('click', async function () {
                    const filePath = li.dataset.path;
                    const commitId = li.dataset.commitId;
                    await fetchFileContent(commitId, filePath);
                });
            }

            ul.appendChild(li);
        }

        return ul;
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
            displayTextContent(textContent, filePath);
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

    function displayTextContent(text, filePath) {
        const contentContainer = document.getElementById('file-content-display');
        if (contentContainer) {
            const extension = filePath.split('.').pop().toLowerCase();
            const language = getLanguageFromExtension(extension);

            contentContainer.innerHTML = `
                <h3>${filePath}</h3>
                <pre><code class="language-${language}">${escapeHtml(text)}</code></pre>
            `;

            // 코드 하이라이팅 적용
            hljs.highlightAll();

            // file1Content에 내용 저장
            window.file1Content = text;
        }
    }

    // 파일 확장자에 따라 언어 결정 함수 추가
    function getLanguageFromExtension(extension) {
        const languageMap = {
            'js': 'javascript',
            'java': 'java',
            'py': 'python',
            'cpp': 'cpp',
            'c': 'c',
            'html': 'html',
            'css': 'css',
            'txt': 'plaintext',
            'xml': 'xml',
            'json': 'json',
            'md': 'markdown',
            // 필요한 언어를 추가하세요
        };
        return languageMap[extension] || 'plaintext';
    }

    function clearFileContent() {
        const contentContainer = document.getElementById('file-content-display');
        if (contentContainer) {
            contentContainer.innerHTML = '';
        }
    }

    // HTML 이스케이프 함수
    function escapeHtml(unsafe) {
        return unsafe.replace(/[&<>"'`=\/]/g, function (s) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '/': '&#x2F;',
                '`': '&#x60;',
                '=': '&#x3D;'
            }[s];
        });
    }

    window.fetchProjectMetadata = fetchProjectMetadata;
});
