const branchManagement = {
    async createBranch() {
        try {
            console.log('브랜치 생성 시도. 현재 프로젝트 정보:', JSON.stringify(window.projectInfo));

            const projectId = parseInt(window.projectInfo.getProjectId(), 10);
            console.log(`브랜치 생성 시 프로젝트 ID: ${projectId}`);

            if (!projectId || isNaN(projectId)) {
                throw new Error('유효한 프로젝트 ID가 없습니다. 프로젝트를 먼저 선택해주세요.');
            }

            // 사용자 정보 가져오기
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
                    const branchName = document.getElementById('branchName').value;
                    const description = document.getElementById('description').value;
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

                const requestData = {
                    projectId,
                    fromCommitId,
                    branchName,
                    description
                };

                console.log('브랜치 생성 요청 데이터:', JSON.stringify(requestData));

                const response = await window.api.fetchWithTokenJSON('/api/team/project/branch', {
                    method: 'POST',
                    body: JSON.stringify(requestData)
                });

                console.log('브랜치 생성 응답:', JSON.stringify(response));

                if (response.newBranchId && response.newBranchName) {
                    const newBranchInfo = {
                        branchId: response.newBranchId,
                        branchName: response.newBranchName,
                        description: description,
                        creatorName: userInfo.name,
                        createdDate: new Date().toISOString()
                    };
                    this.addBranchToTimeline(newBranchInfo);
                    this.saveBranchesToAttribute(newBranchInfo);
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
                <div class="branch-info">
                    <span class="branch-author">작성자: ${branchInfo.creatorName || 'Unknown'}</span>
                    <span class="branch-time">생성 시간: ${new Date(branchInfo.createdDate).toLocaleString()}</span>
                </div>
            </div>
            <br>
            <div class="branch-buttons">
                <button class="branch-button" data-branch-id="${branchInfo.branchId}">branch</button>
                <button class="change-button" data-branch-id="${branchInfo.branchId}">change</button>
                <button class="download-button" data-branch-id="${branchInfo.branchId}">download</button>
                <button class="delete-button" data-branch-id="${branchInfo.branchId}">delete</button>
            </div>
        `;

        // 이벤트 리스너 추가
        const branchButton = newBranchNode.querySelector('.branch-button');
        branchButton.addEventListener('click', () => {
            this.switchToBranch(branchInfo.branchId);
        });

        const changeButton = newBranchNode.querySelector('.change-button');
        changeButton.addEventListener('click', () => {
            this.changeCommitView(branchInfo.branchId);
        });

        // 새 브랜치를 타임라인의 맨 위에 추가
        if (branchTimeline.firstChild) {
            branchTimeline.insertBefore(newBranchNode, branchTimeline.firstChild);

            // 새 브랜치와 기존 첫 번째 브랜치 사이에 선 추가
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
            // 에러 발생 시 빈 브랜치 목록을 표시
            document.getElementById('branchesInfo').value = '[]';
            this.renderBranches();
        }
    },

    renderBranches() {
        const branchTimeline = document.getElementById('branchTimeline');
        branchTimeline.innerHTML = ''; // 기존 내용 초기화

        const branches = this.getBranchesFromAttribute();
        if (branches.length === 0) {
            branchTimeline.innerHTML = '<p>브랜치가 없거나 브랜치 정보를 가져오는 데 실패했습니다.</p>';
            return;
        }

        branches.forEach(branch => {
            this.addBranchToTimeline(branch);
        });
    },

    async switchToBranch(branchId) {
        try {
            // 서버에 해당 브랜치의 커밋 이력을 요청
            const response = await window.api.fetchWithTokenJSON(`/api/team/project/branch/commit?branchId=${branchId}`);
            console.log(`브랜치 ${branchId}의 커밋 이력:`, response);

            // 프로젝트 정보 업데이트
            if (response && response.length > 0) {
                const latestCommit = response[0];
                window.projectInfo.setLatestCommitId(latestCommit.commitId);
                // 다른 필요한 업데이트 수행
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
            // 서버에 해당 브랜치의 커밋 이력을 요청
            const response = await window.api.fetchWithTokenJSON(`/api/team/project/branch/commit?branchId=${branchId}`);
            console.log(`브랜치 ${branchId}의 커밋 이력:`, response);

            if (response && Array.isArray(response)) {
                // 커밋 내역을 업데이트
                commitHistory.updateCommitList(response);
                Swal.fire('성공', `브랜치의 커밋 내역을 불러왔습니다.`, 'success');
            } else {
                throw new Error('올바른 형식의 커밋 이력을 받지 못했습니다.');
            }
        } catch (error) {
            console.error('커밋 내역 변경 중 오류 발생:', error);
            Swal.fire('오류', '커밋 내역을 변경하는 데 실패했습니다.', 'error');
        }
    },

    initialize() {
        // 브랜치 모달이 열릴 때마다 브랜치 정보를 새로 불러옵니다.
        const branchButton = document.getElementById('branchButton');
        if (branchButton) {
            branchButton.addEventListener('click', () => {
                this.fetchBranchesFromServer();
                // 모달이 열릴 때 이벤트 리스너를 설정합니다.
                this.setupCreateBranchButtonListener();
            });
        }

        // 페이지 로드 시 브랜치 정보를 불러옵니다.
        this.fetchBranchesFromServer();
    },

    setupCreateBranchButtonListener() {
        const createBranchButton = document.getElementById('createBranchButton');
        if (createBranchButton) {
            createBranchButton.addEventListener('click', () => {
                console.log('브랜치 생성 버튼 클릭. 현재 프로젝트 정보:', JSON.stringify(window.projectInfo));
                if (window.projectInfo.getProjectId()) {
                    this.createBranch();
                } else {
                    Swal.fire('경고', '먼저 프로젝트를 초기화해 주세요.', 'warning');
                }
            });
        } else {
            console.warn('브랜치 생성 버튼을 찾을 수 없습니다.');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    branchManagement.initialize();
    console.log('브랜치 관리 초기화 완료');
});

// Export
window.branchManagement = branchManagement;
