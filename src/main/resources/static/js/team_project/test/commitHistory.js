const commitHistory = {
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

        // 브랜치 버튼 이벤트 리스너 추가
        document.querySelectorAll('#commitModal .branch-button').forEach(button => {
            button.addEventListener('click', () => {
                const commitId = button.getAttribute('data-commit-id');
                branchManagement.showSelectBranchModal(commitId);
                document.getElementById('commitModal').style.display = 'none'; // 커밋 모달 닫기
            });
        });
    },

    createCommitElement(commit) {
        const commitItem = document.createElement('li');
        commitItem.classList.add('commit-item');
        commitItem.dataset.commitId = commit.commitId;
        commitItem.innerHTML = `
            <div class="commit-info">
                <span class="commit-message">${commit.commitMessage}</span>
                <span class="commit-author">작성자: ${commit.createdBy || 'Unknown'}</span>
                <span class="commit-date">저장 시간: ${new Date(commit.createdDate).toLocaleString()}</span>
            </div>
            <div class="commit-buttons">
                <button class="branch-button" data-commit-id="${commit.commitId}">브랜치</button>
                <button class="change-button" data-commit-id="${commit.commitId}">Change</button>
                <button class="download-commit-button" data-commit-id="${commit.commitId}">Download</button>
            </div>
        `;

        // 브랜치 버튼 이벤트 리스너
        const branchButton = commitItem.querySelector('.branch-button');
        branchButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const commitId = branchButton.getAttribute('data-commit-id');
            branchManagement.showSelectBranchModal(commitId);
            document.getElementById('commitModal').style.display = 'none'; // 모달 닫기
        });

        // Change 버튼 이벤트 리스너
        const changeButton = commitItem.querySelector('.change-button');
        changeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const commitId = changeButton.getAttribute('data-commit-id');
            this.changeCommitView(commitId);
        });

        // Download 버튼 이벤트 리스너
        const downloadButton = commitItem.querySelector('.download-commit-button');
        downloadButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const commitId = downloadButton.getAttribute('data-commit-id');
            this.downloadCommit(commitId);
        });

        return commitItem;
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

    async changeCommitView(commitId) {
        try {
            const commitData = await window.api.fetchWithTokenJSON(`/api/team/project/commit?commitId=${commitId}`);
            const fileList = commitData.fileNameWithPathList;

            console.log('Commit files:', fileList);

            if (window.fileExplorer && typeof window.fileExplorer.displayFileTree === 'function') {
                window.fileExplorer.displayFileTree(fileList, commitId);

                // 현재 커밋 ID 업데이트
                document.getElementById('currentCommitId').value = commitId;

                Swal.fire('커밋 뷰 변경', '커밋 뷰가 변경되었습니다.', 'success');
            } else {
                console.error('fileExplorer.displayFileTree is not available');
                Swal.fire('오류', '파일 트리를 업데이트할 수 없습니다.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('에러', '커밋 뷰를 변경하는 중 문제가 발생했습니다.', 'error');
        }
    }
};

// 페이지 로드 시 커밋 정보 복원
document.addEventListener('DOMContentLoaded', () => {
    const commitModal = document.getElementById('commitModal');
    const commitButton = document.getElementById('commitButton');
    const commitInfoInput = document.getElementById('commitInfo');

    if (commitButton) {
        commitButton.addEventListener('click', () => {
            if (commitInfoInput) {
                try {
                    const commits = JSON.parse(commitInfoInput.value);
                    commitHistory.updateCommitList(commits);
                } catch (e) {
                    console.error('commitInfo parsing error:', e);
                }
            }
            commitModal.style.display = 'block';
        });
    }

    // Close modal when clicking on 'close' span
    const closeButtons = commitModal.getElementsByClassName('close');
    for (let i = 0; i < closeButtons.length; i++) {
        closeButtons[i].addEventListener('click', function() {
            commitModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target == commitModal) {
            commitModal.style.display = 'none';
        }
    });
});