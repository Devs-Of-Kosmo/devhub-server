// 드래그 앤 드롭 기능 활성화
function enableDragAndDrop() {
    const teamIcons = $('#Desktop .icon[data-team-id]');
    const trashCan = $('#trashCan');

    if (trashCan.length === 0) {
        console.warn('Trash can element not found');
        return;
    }

    teamIcons.attr('draggable', 'true');
    teamIcons.on('dragstart', function(e) {
        e.originalEvent.dataTransfer.setData('text/plain', $(this).attr('data-team-id'));
    });

    trashCan.on('dragover', function(e) {
        e.preventDefault();
        $(this).addClass('dragover');
    });

    trashCan.on('dragleave', function() {
        $(this).removeClass('dragover');
    });

    trashCan.on('drop', function(e) {
        e.preventDefault();
        $(this).removeClass('dragover');
        const teamId = e.originalEvent.dataTransfer.getData('text');
        moveToTrash(teamId);
    });

    trashCan.on('dblclick', openTrashModal);
}

// 팀을 휴지통으로 이동 (로컬에서만 처리)
function moveToTrash(teamId) {
    const teamIcon = $(`[data-team-id="${teamId}"]`);
    if (teamIcon.length) {
        const teamName = teamIcon.find('.title').text();
        trashedTeams.push({ id: teamId, name: teamName });
        teamIcon.hide();

        const listItem = $(`#projectList li[data-team-id="${teamId}"]`);
        if (listItem.length) {
            listItem.hide();
        }

        updateTrashCanImage();
        Swal.fire('이동 완료', '팀이 휴지통으로 이동되었습니다.', 'success');

        saveTrashedTeamsToLocalStorage();
    }
}

// 로컬 저장소에 trashedTeams 저장
function saveTrashedTeamsToLocalStorage() {
    localStorage.setItem('trashedTeams', JSON.stringify(trashedTeams));
}

// 로컬 저장소에서 trashedTeams 로드
function loadTrashedTeamsFromLocalStorage() {
    const storedTrashedTeams = localStorage.getItem('trashedTeams');
    if (storedTrashedTeams) {
        trashedTeams = JSON.parse(storedTrashedTeams);
        $.each(trashedTeams, function(_, team) {
            const teamIcon = $(`[data-team-id="${team.id}"]`);
            if (teamIcon.length) {
                teamIcon.addClass('trashed');
                teamIcon.css('pointer-events', 'none');
            }
        });
    }
}

// 휴지통 이미지 업데이트
function updateTrashCanImage() {
    const trashCanImg = $('#trashCan img');
    if (trashCanImg.length) {
        trashCanImg.attr('src', trashedTeams.length > 0 ? '/css/images/team_project/fulltrash.png' : '/css/images/team_project/trash.png');
    }
}