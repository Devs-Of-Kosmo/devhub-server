const fileExplorer = {
    currentCommitId: null,

    displayFileTree(fileList, commitId) {
        console.log('Received fileList:', fileList);
        this.currentCommitId = commitId;
        const fileTree = document.getElementById('fileTree');
        fileTree.innerHTML = ''; // 기존 파일 트리 초기화

        // TEST 폴더를 제외한 파일 목록 생성
        const filteredFileList = fileList.filter(file => !file.startsWith('test/'));
        console.log('Filtered fileList:', filteredFileList);

        // 파일 트리 구조 생성
        const structure = this.createFileStructure(filteredFileList);
        console.log('Generated file structure:', structure);
        const treeElement = this.createTreeElement(structure);
        fileTree.appendChild(treeElement);
    },

    createFileStructure(fileList) {
        const structure = {};
        fileList.forEach(filePath => {
            const parts = filePath.split('/');
            let current = structure;
            parts.forEach((part, index) => {
                if (!current[part]) {
                    current[part] = index === parts.length - 1 ? null : {};
                }
                current = current[part];
            });
        });
        return structure;
    },

    createTreeElement(structure, currentPath = '') {
        const ul = document.createElement('ul');
        ul.classList.add('file-tree-ul');

        for (const [key, value] of Object.entries(structure)) {
            const li = document.createElement('li');
            if (value === null) {
                const filePath = currentPath ? `${currentPath}/${key}` : key;

                // 파일 이름 스팬 생성
                const fileNameSpan = document.createElement('span');
                fileNameSpan.textContent = key;
                fileNameSpan.classList.add('file-name');

                // 파일 클릭 이벤트 리스너 추가
                fileNameSpan.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const extension = filePath.split('.').pop().toLowerCase();
                    if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
                        this.handleImageFileClick(filePath);
                    } else {
                        this.handleFileClick(filePath);
                    }
                });

                li.classList.add('file-item');
                li.appendChild(fileNameSpan);

            } else {
                const folderPath = currentPath ? `${currentPath}/${key}` : key;
                const folderSpan = document.createElement('span');
                folderSpan.textContent = key;
                folderSpan.classList.add('folder-name');

                // 폴더 이름 클릭 시 트리 확장/축소 기능 추가
                folderSpan.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const childUl = li.querySelector('ul');
                    if (childUl) {
                        childUl.classList.toggle('hidden');
                    }
                });

                li.classList.add('folder-item');
                li.appendChild(folderSpan);

                const childUl = this.createTreeElement(value, folderPath);
                li.appendChild(childUl);
            }
            ul.appendChild(li);
        }
        return ul;
    },

    async handleFileClick(filePath) {
        try {
            const commitId = this.currentCommitId;
            console.log(`Current commitId: ${commitId}`);

            const encodedFilePath = encodeURIComponent(filePath);
            const fileContent = await window.api.fetchWithTokenText(
                `/api/team/project/text-file?commitId=${commitId}&filePath=${encodedFilePath}`
            );

            const fileContentDiv = document.getElementById('fileContent').querySelector('pre > code');
            fileContentDiv.textContent = fileContent;

            if (typeof hljs !== 'undefined') {
                hljs.highlightElement(fileContentDiv);
            } else {
                console.warn('highlight.js가 로드되지 않았습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('에러', '파일 내용을 불러오는 중 문제가 발생했습니다.', 'error');
        }
    },

    async handleImageFileClick(filePath) {
        try {
            const commitId = this.currentCommitId;
            console.log(`Fetching image for commitId: ${commitId}`);

            const blob = await window.api.fetchImageFile(commitId, filePath);
            const imgUrl = URL.createObjectURL(blob);

            const imageModal = document.getElementById('imageModal');
            const imageElement = document.getElementById('modalImage');
            imageElement.src = imgUrl;

            // 이미지 모달 열기
            imageModal.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('에러', '이미지를 불러오는 중 문제가 발생했습니다.', 'error');
        }
    }
};

window.fileExplorer = fileExplorer;