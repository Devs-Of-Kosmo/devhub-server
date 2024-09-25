// commitHistory.js

const commitHistory = {
    addCommitToHistory(commit) {
        const commitList = document.querySelector('#commitModal .commit-list');
        if (!commitList) {
            console.error('커밋 리스트 요소를 찾을 수 없습니다.');
            return;
        }

        if (!this.isCommitAlreadyAdded(commit.commitId || commit.newCommitId)) {
            const commitItem = this.createCommitElement(commit);
            commitList.prepend(commitItem);
        }

        if (commit.newCommitId) {
            window.projectInfo.setLatestCommitId(commit.newCommitId);
        }
    },

    isCommitAlreadyAdded(commitId) {
        const existingCommit = document.querySelector(`#commitModal .commit-item[data-commit-id="${commitId}"]`);
        return !!existingCommit;
    },

    createCommitElement(commit) {
        const commitItem = document.createElement('li');
        commitItem.classList.add('commit-item');
        commitItem.dataset.commitId = commit.commitId || commit.newCommitId;

        commitItem.innerHTML = `
            <span class="commit-hash">#${commit.commitId || commit.newCommitId}</span><br>
            <span class="commit-message">${commit.commitMessage}</span><br>
            <span class="commit-author">작성자: ${commit.createdByName || commit.createdBy || 'Unknown'}</span><br>
            <span class="commit-date">저장 시간: ${new Date(commit.createdDate).toLocaleString()}</span>
            <button class="download-commit-button">다운로드</button>
        `;

        const downloadButton = commitItem.querySelector('.download-commit-button');
        downloadButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.downloadCommit(commit.commitId || commit.newCommitId);
        });

        commitItem.addEventListener('click', () => {
            this.handleCommitClick(commit.commitId || commit.newCommitId);
        });

        return commitItem;
    },

    clearCommitHistory() {
        const commitList = document.querySelector('#commitModal .commit-list');
        if (commitList) {
            commitList.innerHTML = '';
        }
    },

    async downloadCommit(commitId) {
        try {
            console.log(`Downloading commit: commitId=${commitId}`);
            const url = `/api/team/project/download?commitId=${commitId}`;
            await window.api.fetchWithTokenDownload(url);
        } catch (error) {
            console.error('Error downloading commit:', error);
            Swal.fire('에러', '커밋을 다운로드하는 중 문제가 발생했습니다.', 'error');
        }
    },

    async handleCommitClick(commitId) {
        try {
            const commitData = await window.api.fetchWithTokenJSON(`/api/team/project/commit?commitId=${commitId}`);
            const fileList = commitData.fileNameWithPathList;

            // 여기서 fileList를 로깅하여 실제 내용 확인
            console.log('Commit files:', fileList);

            window.fileExplorer.displayFileTree(fileList, commitId);
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('에러', '커밋 정보를 불러오는 중 문제가 발생했습니다.', 'error');
        }
    },

    updateCommitList(commits) {
        const commitListElement = document.querySelector('#commitModal .commit-list');
        if (!commitListElement) {
            console.error('커밋 리스트 요소를 찾을 수 없습니다.');
            return;
        }
        commitListElement.innerHTML = ''; // 기존 내용 초기화

        commits.forEach(commit => {
            const commitItem = this.createCommitElement(commit);
            commitListElement.appendChild(commitItem);
        });
    }
};

window.commitHistory = commitHistory;
