// branchManagement.js

const branchManagement = {
    async createBranch() {
        try {
            console.log('브랜치 생성 시도. 현재 프로젝트 정보:', JSON.stringify(window.projectInfo));
            
            const projectId = window.projectInfo.getProjectId();
            console.log(`브랜치 생성 시 프로젝트 ID: ${projectId}`);
            
            if (!projectId) {
                throw new Error('프로젝트가 선택되지 않았습니다. 프로젝트를 먼저 선택해주세요.');
            }

            const { value: formValues } = await Swal.fire({
                title: '새 브랜치 생성',
                html:
                    '<input id="branchName" class="swal2-input" placeholder="브랜치 이름">' +
                    '<input id="description" class="swal2-input" placeholder="설명">',
                focusConfirm: false,
                preConfirm: () => {
                    return {
                        branchName: document.getElementById('branchName').value,
                        description: document.getElementById('description').value
                    }
                }
            });

            if (formValues) {
                const { branchName, description } = formValues;
                const fromCommitId = window.projectInfo.latestCommitId;

                console.log('브랜치 생성 요청 데이터:', { projectId, fromCommitId, branchName, description });

                if (!fromCommitId) {
                    throw new Error('최신 커밋 ID가 없습니다. 프로젝트에 커밋이 존재하는지 확인해주세요.');
                }

                const response = await window.api.fetchWithTokenJSON('/api/team/project/branch', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        projectId,
                        fromCommitId,
                        branchName,
                        description
                    })
                });

                console.log('브랜치 생성 응답:', response);

                if (response.newBranchId && response.newBranchName) {
                    this.addBranchToTimeline(response);
                    Swal.fire('성공', '새 브랜치가 생성되었습니다.', 'success');
                } else {
                    throw new Error('브랜치 생성 응답이 유효하지 않습니다.');
                }
            }
        } catch (error) {
            console.error('브랜치 생성 중 오류:', error);
            Swal.fire('오류', `브랜치 생성 중 문제가 발생했습니다: ${error.message}`, 'error');
        }
    },

    addBranchToTimeline(branchInfo) {
        const branchTimeline = document.getElementById('branchTimeline');
        const newBranchNode = document.createElement('div');
        newBranchNode.className = 'branch-node';
        newBranchNode.innerHTML = `
         <div class="branch-content">
        <div class="branch-name">${branchInfo.newBranchName}</div>
        <div class="branch-info">
            <span class="branch-author">작성자: ${branchInfo.createdBy || 'Unknown'}</span>
            <span class="branch-time">생성 시간: ${new Date().toLocaleString()}</span>
        </div>
         </div>
         <br>
         <div class="branch-buttons">
        <button class="change-button">change</button>
        <button class="download-button">download</button>
        <button class="delete-button">delete</button>
         </div>
            `;

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

    initialize() {
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