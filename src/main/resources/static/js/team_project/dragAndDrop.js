// 드래그 앤 드롭 기능 활성화
window.enableDragAndDrop = function() {
    const desktop = $('#Desktop');
    const trashCan = $('#trashCan');

    if (trashCan.length === 0) {
        console.warn('Trash can element not found');
        return;
    }

    desktop.off('dragstart', '.icon[data-team-id]').on('dragstart', '.icon[data-team-id]', function(e) {
        e.originalEvent.dataTransfer.setData('text/plain', $(this).attr('data-team-id'));
    });

    trashCan.off('dragover').on('dragover', function(e) {
        e.preventDefault();
        $(this).addClass('dragover');
    });

    trashCan.off('dragleave').on('dragleave', function() {
        $(this).removeClass('dragover');
    });

    trashCan.off('drop').on('drop', function(e) {
        e.preventDefault();
        $(this).removeClass('dragover');
        const teamId = e.originalEvent.dataTransfer.getData('text');
        window.moveToTrash(teamId);
    });

    trashCan.off('dblclick').on('dblclick', window.openTrashModal);
}

// 팀을 휴지통으로 이동
window.moveToTrash = function(teamId) {
    const teamIcon = $(`[data-team-id="${teamId}"]`);
    if (teamIcon.length) {
        const teamName = teamIcon.find('.title').text();
        window.trashedTeams.push({ id: teamId, name: teamName });
        teamIcon.hide();

        const listItem = $(`#projectList li[data-team-id="${teamId}"]`);
        if (listItem.length) {
            listItem.hide();
        }

        window.updateTrashCanImage();
        Swal.fire('이동 완료', '팀이 휴지통으로 이동되었습니다.', 'success');
        window.saveTrashedTeamsToLocalStorage();
    }
}

// 로컬 저장소에 trashedTeams 저장
window.saveTrashedTeamsToLocalStorage = function() {
    localStorage.setItem('trashedTeams', JSON.stringify(window.trashedTeams));
}

// 로컬 저장소에서 trashedTeams 로드
window.loadTrashedTeamsFromLocalStorage = function() {
    const storedTrashedTeams = localStorage.getItem('trashedTeams');
    if (storedTrashedTeams) {
        window.trashedTeams = JSON.parse(storedTrashedTeams);
        $.each(window.trashedTeams, function(_, team) {
            const teamIcon = $(`[data-team-id="${team.id}"]`);
            if (teamIcon.length) {
                teamIcon.addClass('trashed');
                teamIcon.css('pointer-events', 'none');
            }
        });
    }
}

// 휴지통 이미지 업데이트
window.updateTrashCanImage = function() {
    const trashCanImg = $('#trashCan img');
    if (trashCanImg.length) {
        trashCanImg.attr('src', window.trashedTeams.length > 0 ? '/css/images/team_project/fulltrash.png' : '/css/images/team_project/trash.png');
    }
}

// 이벤트 리스너 설정 (페이지 로드 시 실행)
$(document).ready(function() {
    window.enableDragAndDrop();
});