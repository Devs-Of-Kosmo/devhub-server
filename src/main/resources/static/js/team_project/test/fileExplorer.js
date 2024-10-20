const fileExplorer = {
    currentCommitId: null,
    currentBranchId: null,

    async updateFileTree() {
        try {
            const projectId = window.projectInfo.getProjectId();
            const latestCommitId = window.projectInfo.getLatestCommitId();
            if (!projectId || !latestCommitId) {
                console.warn('프로젝트 ID 또는 최신 커밋 ID가 없습니다.');
                return;
            }

            console.log(`Fetching file list for commitId: ${latestCommitId}`);
            const response = await window.api.fetchWithTokenJSON(`/api/team/project/commit?commitId=${latestCommitId}`);
            console.log('API Response:', response);

            if (response && response.fileNameWithPathList && response.fileNameWithPathList.length > 0) {
                this.displayFileTree(response.fileNameWithPathList, latestCommitId);
            } else {
                console.warn('파일 목록이 비어 있습니다.');
                const fileTree = document.getElementById('fileTree');
                fileTree.innerHTML = '<p>이 커밋에는 파일이 없습니다.</p>';
            }

            // 브랜치 정보 가져오기
            await this.updateBranchInfo(latestCommitId);

        } catch (error) {
            console.error('파일 트리 업데이트 중 오류:', error);
            Swal.fire('오류', '파일 트리를 업데이트하는 데 실패했습니다.', 'error');
        }
    },

    async updateBranchInfo(commitId) {
        try {
            const branches = await window.api.fetchWithTokenJSON(`/api/team/project/branch?commitId=${commitId}`);
            if (branches && branches.length > 0) {
                this.currentBranchId = branches[0].branchId;
                await this.displayCommitHistory(this.currentBranchId);
            }
        } catch (error) {
            console.error('브랜치 정보 업데이트 중 오류:', error);
        }
    },

    displayFileTree(fileList, commitId) {
        this.currentCommitId = commitId;
        const fileTree = document.getElementById('fileTree');
        fileTree.innerHTML = '';

        // 현재 커밋 정보 제거
        const existingCommitInfo = document.querySelector('.commit-info');
        if (existingCommitInfo) {
            existingCommitInfo.remove();
        }

        const structure = this.createFileStructure(fileList);
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
            let commitId = window.projectInfo.getCurrentCommitId();
            if (!commitId) {
                commitId = window.projectInfo.getLatestCommitId();
            }
            console.log(`Current commitId: ${commitId}`);

            if (!commitId) {
                throw new Error('유효한 commitId를 찾을 수 없습니다.');
            }

            const encodedFilePath = encodeURIComponent(filePath);
            const fileContent = await window.api.fetchWithTokenText(
                `/api/team/project/text-file?commitId=${commitId}&filePath=${encodedFilePath}`
            );

            // 파일 이름 표시 추가
            const fileNameElement = document.createElement('h3');
            fileNameElement.textContent = `${filePath}`;

            const fileContentContainer = document.getElementById('fileContent');
            fileContentContainer.innerHTML = ''; // 기존 내용 초기화
            fileContentContainer.appendChild(fileNameElement);

            const preElement = document.createElement('pre');
            const codeElement = document.createElement('code');
            codeElement.textContent = fileContent;
            preElement.appendChild(codeElement);
            fileContentContainer.appendChild(preElement);

            if (typeof hljs !== 'undefined') {
                hljs.highlightElement(codeElement);
            } else {
                console.warn('highlight.js가 로드되지 않았습니다.');
            }

            // 비교 커밋이 선택되어 있다면 비교 실행
            if (this.comparisonCommitId) {
                await this.compareWithSelectedCommit(filePath, fileContent);
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('에러', '파일 내용을 불러오는 중 문제가 발생했습니다.', 'error');
        }
    },

    async handleImageFileClick(filePath) {
        try {
            const commitId = window.projectInfo.getCurrentCommitId();
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
    },

    async displayCommitHistory(branchId) {
        try {
            const commits = await window.api.fetchBranchCommits(branchId);
            const commitHistoryElement = document.getElementById('commitHistory');
            if (commitHistoryElement && commits && commits.length > 0) {
                commitHistoryElement.innerHTML = '<h3>커밋 히스토리</h3>';
                const ul = document.createElement('ul');
                commits.forEach(commit => {
                    const li = document.createElement('li');
                    li.textContent = `${commit.commitMessage} (${new Date(commit.createdDate).toLocaleString()})`;
                    li.addEventListener('click', () => this.loadCommit(commit.commitId));
                    ul.appendChild(li);
                });
                commitHistoryElement.appendChild(ul);
            }
        } catch (error) {
            console.error('커밋 히스토리 로딩 중 오류:', error);
        }
    },

    async loadCommit(commitId) {
        try {
            console.log(`Loading commit: ${commitId}`);
            const response = await window.api.fetchWithTokenJSON(`/api/team/project/commit?commitId=${commitId}`);
            if (response && response.fileNameWithPathList) {
                this.displayFileTree(response.fileNameWithPathList, commitId);
                // 파일 내용 초기화
                const fileContentContainer = document.getElementById('fileContent');
                if (fileContentContainer) {
                    fileContentContainer.innerHTML = '<p>파일을 선택하세요.</p>';
                }
                Swal.fire('커밋 로드 완료', `커밋 ID ${commitId}의 파일 구조를 불러왔습니다.`, 'success');
            } else {
                throw new Error('파일 목록을 가져오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('커밋 로딩 중 오류:', error);
            Swal.fire('오류', '커밋을 로딩하는 데 실패했습니다.', 'error');
        }
    },

    async compareWithSelectedCommit(filePath, currentFileContent) {
        try {
            const encodedFilePath = encodeURIComponent(filePath);
            const comparisonFileContent = await window.api.fetchWithTokenText(
                `/api/team/project/text-file?commitId=${this.comparisonCommitId}&filePath=${encodedFilePath}`
            );

            // diff.js의 compareFiles 함수를 사용하여 비교
            window.diff.compareFiles(
                { name: filePath, content: currentFileContent },
                { name: filePath, content: comparisonFileContent }
            );
        } catch (error) {
            console.error('Error comparing files:', error);
            Swal.fire('에러', '파일 비교 중 문제가 발생했습니다.', 'error');
        }
    },

    async selectComparisonCommit() {
        const commitList = await this.fetchCommitList();
        const { value: selectedCommitId } = await Swal.fire({
            title: '비교할 커밋 선택',
            input: 'select',
            inputOptions: Object.fromEntries(commitList.map(commit => [
                commit.commitId,
                `${commit.commitMessage} (${new Date(commit.createdDate).toLocaleString()})`
            ])),
            inputPlaceholder: '커밋을 선택하세요',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return '커밋을 선택해야 합니다!';
                }
            }
        });

        if (selectedCommitId) {
            this.comparisonCommitId = selectedCommitId;
            Swal.fire('선택 완료', `비교할 커밋이 선택되었습니다. 이제 파일을 클릭하면 비교 결과를 볼 수 있습니다.`, 'success');
        }
    },

    async fetchCommitList() {
        // 커밋 목록을 가져오는 API 호출
        return await window.api.fetchWithTokenJSON('/api/team/project/commits');
    }
};

window.fileExplorer = fileExplorer;