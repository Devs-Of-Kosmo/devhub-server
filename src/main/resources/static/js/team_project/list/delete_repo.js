// delete_repo.js

let trashedRepos = JSON.parse(localStorage.getItem('trashedRepos') || '[]');

function markRepoAsDeleted(projectId) {
    const repoIcon = document.querySelector(`.disk-icon[data-project-id="${projectId}"]`);
    if (repoIcon) {
        repoIcon.setAttribute('data-deleted', 'true');
        repoIcon.style.opacity = '0.5';
        repoIcon.style.pointerEvents = 'none';

        // '❌' 아이콘을 추가하는 코드
        const deletedIcon = document.createElement('span');
        deletedIcon.textContent = '❌';
        deletedIcon.style.position = 'absolute';
        deletedIcon.style.top = '-5px';
        deletedIcon.style.right = '-5px';
        deletedIcon.style.fontSize = '20px';
        deletedIcon.style.color = 'red';
        deletedIcon.style.textShadow = '0px 0px 3px white';
        repoIcon.appendChild(deletedIcon);
    }
}

// 레포지토리를 휴지통으로 이동하는 함수
function moveToTrash(repoData) {
    const existingIndex = trashedRepos.findIndex(repo => repo.projectId === repoData.id);
    if (existingIndex === -1) {
        trashedRepos.push({
            projectId: repoData.id,
            projectName: repoData.name,
            teamId: repoData.teamId,
            teamName: repoData.teamName,
            description: repoData.description
        });
        localStorage.setItem('trashedRepos', JSON.stringify(trashedRepos));
        updateTrashUI();
        removeRepoFromDesktop(repoData.id);
        Swal.fire('성공', '레포지토리가 휴지통으로 이동되었습니다.', 'success');
    } else {
        Swal.fire('알림', '이 레포지토리는 이미 휴지통에 있습니다.', 'info');
    }
}


// 페이지 로드 시 삭제된 레포지토리를 삭제된 상태로 표시
function initializeTrash() {
    trashedRepos.forEach(repo => {
        markRepoAsDeleted(repo.projectId);
    });
}

// 데스크톱에서 레포지토리 아이콘 제거
function removeRepoFromDesktop(projectId) {
    const repoIcon = document.querySelector(`.disk-icon[data-project-id="${projectId}"]`);
    if (repoIcon) {
        repoIcon.remove();
    }
}

// 레포지토리 삭제 함수 (API를 통한 실제 삭제)
function deleteRepo(projectId) {
    const token = getToken();
    if (!token) return;

    if (!projectId) {
        console.error('Invalid projectId:', projectId);
        Swal.fire('오류', '유효하지 않은 프로젝트 ID입니다.', 'error');
        return;
    }

    Swal.fire({
        title: '정말로 삭제하시겠습니까?',
        text: "이 작업은 되돌릴 수 없습니다!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '네, 삭제합니다!',
        cancelButtonText: '취소'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/api/team/repo/${projectId}`,
                type: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
                success: function() {
                    Swal.fire('삭제 완료', '레포지토리가 성공적으로 삭제되었습니다.', 'success');
                    removeFromTrash(projectId);
                    removeRepoFromDesktop(projectId);
                },
                error: function(xhr, status, error) {
                    console.error('Error deleting repository:', error);
                    Swal.fire('오류', '레포지토리 삭제에 실패했습니다.', 'error');
                }
            });
        }
    });
}

// 휴지통 목록에서 제거하는 함수
function removeFromTrash(projectId) {
    trashedRepos = trashedRepos.filter(repo => repo.projectId !== projectId);
    localStorage.setItem('trashedRepos', JSON.stringify(trashedRepos));
    updateTrashUI();
}

// 휴지통 UI 업데이트 함수
function updateTrashUI() {
    updateTrashModal();
    updateTrashIcon();
}

// 휴지통 모달 업데이트 함수
function updateTrashModal() {
    const trashItems = document.getElementById('trashItems');
    trashItems.innerHTML = '';

    trashedRepos.forEach(repo => {
        const item = document.createElement('div');
        item.className = 'trash-item';
        item.innerHTML = `
            <span>${repo.projectName} (${repo.teamName})</span>
            <button onclick="deleteRepo('${repo.projectId}')">삭제</button>
            <button onclick="location.reload();">복구</button> 
        `;
        trashItems.appendChild(item);
    });
}

// 휴지통 아이콘 업데이트 함수
function updateTrashIcon() {
    const trashIcon = document.querySelector('.item[data-folder="codepen"] img');
    if (trashIcon) {
        trashIcon.src = trashedRepos.length > 0 ? '/css/images/team_project/fulltrash.png' : '/css/images/team_project/trash.png';
    }
}

// 휴지통 초기화 함수
function initializeTrash() {
    updateTrashIcon();
}

// 모달을 여는 함수
function openTrash() {
    updateTrashModal();
    document.getElementById('trashModal').style.display = 'block';
}

// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    // 휴지통 관련 이벤트 리스너 추가
    document.querySelector('.trash-can').addEventListener('click', openTrash);

    // 휴지통으로 드래그 앤 드롭
    const trashCan = document.querySelector('.trash-can');
    trashCan.addEventListener('dragover', function(event) {
        event.preventDefault();
    });
    trashCan.addEventListener('drop', function(event) {
        event.preventDefault();
        const repoData = JSON.parse(event.dataTransfer.getData('text/plain'));
        moveToTrash(repoData);
    });

    initializeTrash();
});