const branchManagement = {
    async createBranch() {
        try {
            console.log('브랜치 생성 시도. 현재 프로젝트 정보:', JSON.stringify(window.projectInfo));

            const projectId = parseInt(window.projectInfo.getProjectId(), 10);
            console.log(`브랜치 생성 시 프로젝트 ID: ${projectId}`);

            if (!projectId || isNaN(projectId)) {
                throw new Error('유효한 프로젝트 ID가 없습니다. 프로젝트를 먼저 선택해주세요.');
            }

            const userInfo = await this.fetchUserInfo();
            if (!userInfo) {
                throw new Error('사용자 정보를 가져올 수 없습니다.');
            }

            const { value: formValues } = await Swal.fire({
                title: '새 브랜치 생성',
                html:
                    '<input id="branchName" class="swal2-input" placeholder="브랜치 이름">' +
                    '<input id="description" class="swal2-input" placeholder="설명">',
                focusConfirm: false,
                showCancelButton: true,
                preConfirm: () => {
                    const branchName = document.getElementById('branchName').value.trim();
                    const description = document.getElementById('description').value.trim();
                    if (!branchName) {
                        Swal.showValidationMessage('브랜치 이름을 입력해주세요.');
                        return false;
                    }
                    return { branchName, description };
                }
            });

            if (formValues) {
                const { branchName, description } = formValues;
                const fromCommitId = parseInt(window.projectInfo.getLatestCommitId(), 10);

                if (!fromCommitId || isNaN(fromCommitId)) {
                    throw new Error('유효한 최신 커밋 ID가 없습니다. 프로젝트에 커밋이 존재하는지 확인해주세요.');
                }

                const requestData = { projectId, fromCommitId, branchName, description };
                console.log('브랜치 생성 요청 데이터:', JSON.stringify(requestData));

                const response = await window.api.fetchWithTokenJSON('/api/team/project/branch', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                console.log('브랜치 생성 응답:', JSON.stringify(response));

                if (response.newBranchId && response.newBranchName) {
                    const newBranchInfo = {
                        branchId: response.newBranchId,
                        branchName: response.newBranchName,
                        description: description,
                        creatorName: userInfo.name,
                        createdDate: new Date().toISOString(),
                        mergeCondition: response.mergeCondition // 추가된 필드
                    };
                    this.addBranchToTimeline(newBranchInfo);
                    this.saveBranchesToAttribute(newBranchInfo);

                    // 현재 브랜치 설정 추가
                    window.projectInfo.setCurrentBranch(response.newBranchId);
                    document.getElementById('currentBranchId').value = response.newBranchId;
                    console.log('현재 브랜치 설정됨:', response.newBranchId);

                    Swal.fire('성공', '새 브랜치가 생성되었습니다.', 'success');
                    await this.fetchBranchesFromServer();
                } else {
                    throw new Error('브랜치 생성 응답이 유효하지 않습니다.');
                }
            }
        } catch (error) {
            console.error('브랜치 생성 중 오류:', error);
            let errorMessage = '브랜치 생성 중 문제가 발생했습니다.';
            if (error.message) {
                errorMessage += `\n오류 내용: ${error.message}`;
            }
            Swal.fire('오류', errorMessage, 'error');
        }
    },

    async fetchUserInfo() {
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
            return await response.json();
        } catch (error) {
            console.error('Error fetching user info:', error);
            return null;
        }
    },

    addBranchToTimeline(branchInfo) {
        const branchTimeline = document.getElementById('branchTimeline');
        const newBranchNode = document.createElement('div');
        newBranchNode.className = 'branch-node';
        newBranchNode.innerHTML = `
            <div class="branch-content">
                <div class="branch-name">${branchInfo.branchName}</div>
                <div class="branch-info">작성자: ${branchInfo.creatorName || 'Unknown'} 생성 시간: ${new Date(branchInfo.createdDate).toLocaleString()}</div>
            </div>
            <div class="branch-buttons">
                <button class="branch-button" data-branch-id="${branchInfo.branchId}">branch</button>
                <button class="change-button" data-branch-id="${branchInfo.branchId}">change</button>
                <button class="download-button" data-branch-id="${branchInfo.branchId}">download</button>
                <button class="delete-button" data-branch-id="${branchInfo.branchId}">delete</button>
            </div>
        `;

        const branchButton = newBranchNode.querySelector('.branch-button');
        branchButton.addEventListener('click', () => {
            this.switchToBranch(branchInfo.branchId);
        });

        const changeButton = newBranchNode.querySelector('.change-button');
        changeButton.addEventListener('click', () => {
            this.changeCommitView(branchInfo.branchId);
        });

        const deleteButton = newBranchNode.querySelector('.delete-button');
        deleteButton.addEventListener('click', () => {
            this.deleteBranch(branchInfo.branchId);
        });

        if (branchTimeline.firstChild) {
            branchTimeline.insertBefore(newBranchNode, branchTimeline.firstChild);
            const branchLine = document.createElement('div');
            branchLine.className = 'branch-line';
            branchTimeline.insertBefore(branchLine, branchTimeline.firstChild.nextSibling);
        } else {
            branchTimeline.appendChild(newBranchNode);
        }
        console.log('브랜치 타임라인에 새 브랜치 추가됨:', branchInfo);
    },

    saveBranchesToAttribute(newBranch) {
        const branchesInput = document.getElementById('branchesInfo');
        const branches = this.getBranchesFromAttribute();
        branches.push(newBranch);
        branchesInput.value = JSON.stringify(branches);
    },

    getBranchesFromAttribute() {
        const branchesInput = document.getElementById('branchesInfo');
        return branchesInput.value ? JSON.parse(branchesInput.value) : [];
    },

    async fetchBranchesFromServer() {
        try {
            const projectId = window.projectInfo.getProjectId();
            const latestCommitId = window.projectInfo.getLatestCommitId();
            if (!projectId) {
                console.warn('프로젝트 ID가 없습니다. 브랜치를 가져올 수 없습니다.');
                return;
            }
            if (!latestCommitId) {
                console.warn('최신 커밋 ID가 없습니다. 브랜치를 가져올 수 없습니다.');
                return;
            }

            const response = await window.api.fetchWithTokenJSON(`/api/team/project/branch?projectId=${projectId}&commitId=${latestCommitId}`);
            console.log('서버에서 가져온 브랜치 정보:', response);

            if (Array.isArray(response)) {
                document.getElementById('branchesInfo').value = JSON.stringify(response);
                this.renderBranches();
            } else {
                throw new Error('서버에서 올바른 형식의 브랜치 정보를 받지 못했습니다.');
            }
        } catch (error) {
            console.error('서버에서 브랜치 정보를 가져오는 중 오류 발생:', error);
            let errorMessage = '브랜치 정보를 가져오는 데 실패했습니다.';
            if (error.message) {
                errorMessage += ` 오류 내용: ${error.message}`;
            }
            Swal.fire('오류', errorMessage, 'error');
            document.getElementById('branchesInfo').value = '[]';
            this.renderBranches();
        }
    },

    renderBranches() {
        const branchTimeline = document.getElementById('branchTimeline');
        branchTimeline.innerHTML = '';

        const branches = this.getBranchesFromAttribute();
        if (branches.length === 0) {
            branchTimeline.innerHTML = '<p>브랜치가 없거나 브랜치 정보를 가져오는 데 실패했습니다.</p>';
            return;
        }

        branches.forEach(branch => {
            this.addBranchToTimeline(branch);
        });
    },

    async switchToBranch(branchId, commitId = null) {
        try {
            const response = await window.api.fetchWithTokenJSON(`/api/team/project/branch/commit?branchId=${branchId}`);
            console.log(`브랜치 ${branchId}의 커밋 이력:`, response);

            if (response && response.length > 0) {
                const targetCommit = commitId ? response.find(commit => commit.commitId === commitId) : response[0];
                if (!targetCommit) {
                    throw new Error('지정된 커밋을 찾을 수 없습니다.');
                }

                window.projectInfo.setLatestCommitId(targetCommit.commitId);
                window.projectInfo.setCurrentBranch(branchId);

                // hidden input 요소에 현재 상태 저장
                document.getElementById('currentBranchId').value = branchId;
                document.getElementById('currentCommitId').value = targetCommit.commitId;

                console.log('브랜치 전환됨, 현재 브랜치 ID:', branchId, '커밋 ID:', targetCommit.commitId);

                // 파일 트리 업데이트
                await window.fileExplorer.updateFileTree();

                Swal.fire('성공', '브랜치로 이동했습니다.', 'success');
            } else {
                throw new Error('해당 브랜치에 커밋 이력이 없습니다.');
            }
        } catch (error) {
            console.error('브랜치로 이동 중 오류 발생:', error);
            Swal.fire('오류', '브랜치로 이동하는 데 실패했습니다.', 'error');
        }
    },

    async changeCommitView(branchId) {
        try {
            const response = await window.api.fetchWithTokenJSON(`/api/team/project/branch/commit?branchId=${branchId}`);
            console.log(`브랜치 ${branchId}의 커밋 이력:`, response);

            if (response && Array.isArray(response)) {
                commitHistory.updateCommitList(response);

                // 현재 브랜치 ID 업데이트
                document.getElementById('currentBranchId').value = branchId;

                Swal.fire('성공', `브랜치의 커밋 내역을 불러왔습니다.`, 'success');
            } else {
                throw new Error('올바른 형식의 커밋 이력을 받지 못했습니다.');
            }
        } catch (error) {
            console.error('커밋 내역 변경 중 오류 발생:', error);
            Swal.fire('오류', '커밋 내역을 변경하는 데 실패했습니다.', 'error');
        }
    },

    async deleteBranch(branchId) {
        try {
            const confirmDelete = await Swal.fire({
                title: '브랜치 삭제',
                text: '정말로 이 브랜치를 삭제하시겠습니까?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '삭제',
                cancelButtonText: '취소'
            });

            if (confirmDelete.isConfirmed) {
                const response = await window.api.fetchWithTokenJSON(`/api/team/project/branch/${branchId}`, {
                    method: 'DELETE'
                });

                if (response.success) {
                    // 브랜치 삭제 후 UI에서 제거
                    const branches = this.getBranchesFromAttribute().filter(branch => branch.branchId !== branchId);
                    document.getElementById('branchesInfo').value = JSON.stringify(branches);
                    this.renderBranches();
                    Swal.fire('성공', '브랜치가 삭제되었습니다.', 'success');
                } else {
                    throw new Error('브랜치 삭제에 실패했습니다.');
                }
            }
        } catch (error) {
            console.error('브랜치 삭제 중 오류 발생:', error);
            Swal.fire('오류', '브랜치를 삭제하는 데 실패했습니다.', 'error');
        }
    },

    initialize() {
        const branchButton = document.getElementById('branchButton');
        if (branchButton) {
            branchButton.addEventListener('click', () => {
                this.fetchBranchesFromServer();
                this.setupCreateBranchButtonListener();
            });
        }
        this.fetchBranchesFromServer();
        this.setupCreateBranchButtonListener();
        this.restoreCommitList(); // 커밋 리스트 복원 추가
    },

    setupCreateBranchButtonListener() {
        const createBranchButtons = document.querySelectorAll('.create-branch-button');
        createBranchButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('브랜치 생성 버튼 클릭. 현재 프로젝트 정보:', JSON.stringify(window.projectInfo));
                if (window.projectInfo.getProjectId()) {
                    this.createBranch();
                } else {
                    Swal.fire('경고', '먼저 프로젝트를 초기화해 주세요.', 'warning');
                }
            });
        });
    },

    async showSelectBranchModal(commitId) {
        try {
            const response = await window.api.fetchWithTokenJSON(`/api/team/project/branch?commitId=${commitId}`);

            const modal = document.getElementById('selectBranchModal');
            const branchList = document.getElementById('branchList');
            branchList.innerHTML = '';

            response.forEach(branch => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="branch-name">${branch.branchName}</span>
                    <button class="implement-button">구현하기</button>
                    <div class="branch-description">${branch.description || '설명 없음'}</div>
                    <span class="branch-author">작성자: ${branch.creatorName || 'Unknown'}</span>
                `;

                const implementButton = li.querySelector('.implement-button');
                implementButton.onclick = (e) => {
                    e.stopPropagation();
                    this.switchToBranch(branch.branchId);
                };

                branchList.appendChild(li);
            });

            modal.style.display = 'block';
        } catch (error) {
            console.error('브랜치 목록을 가져오는 중 오류 발생:', error);
            Swal.fire('오류', '브랜치 목록을 가져오는 데 실패했습니다.', 'error');
        }
    },

    // 커밋 리스트 복원 함수 추가
    restoreCommitList() {
        const commitInfoInput = document.getElementById('commitInfo');
        const currentBranchId = document.getElementById('currentBranchId').value;
        if (commitInfoInput && commitInfoInput.value && currentBranchId) {
            try {
                const commits = JSON.parse(commitInfoInput.value);
                commitHistory.updateCommitList(commits);
            } catch (e) {
                console.error('commitInfo parsing error:', e);
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    branchManagement.initialize();
    console.log('브랜치 관리 초기화 완료');

    const selectBranchButton = document.getElementById('selectBranchButton');
    if (selectBranchButton) {
        selectBranchButton.addEventListener('click', () => branchManagement.showSelectBranchModal());
    }

    // 모달 닫기 버튼 이벤트 리스너
    const closeButtons = document.getElementsByClassName('close');
    for (let i = 0; i < closeButtons.length; i++) {
        closeButtons[i].addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    }
});

// Export
window.branchManagement = branchManagement;