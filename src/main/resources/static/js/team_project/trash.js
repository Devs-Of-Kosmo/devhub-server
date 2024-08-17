// 휴지통 모달 열기
window.openTrashModal = function() {
    const modal = $('#trashModal');
    const trashItems = $('#trashItems');
    if (!modal.length || !trashItems.length) {
        console.warn('Trash modal or trash items container not found');
        return;
    }
    trashItems.empty();

    $.each(window.trashedTeams, function(_, team) {
        const item = $('<div>', {
            class: 'trash-item',
            html: `
                <span>${team.name}</span>
                <button onclick="window.restoreTeam(${team.id})">복구</button>
            `
        });
        trashItems.append(item);
    });

    modal.show();
}

// 팀 복구
window.restoreTeam = function(teamId) {
    window.sendAuthenticatedRequest(`/api/team/group/${teamId}`, 'POST')
        .done(function(response) {
            console.log('Restore team response:', response);

            window.trashedTeams = window.trashedTeams.filter(team => team.id !== teamId);
            window.saveTrashedTeamsToLocalStorage();

            const teamIcon = $(`[data-team-id="${teamId}"]`);
            if (teamIcon.length) {
                teamIcon.show().removeClass('trashed').css('pointer-events', '');
            }

            const listItem = $(`#projectList li[data-team-id="${teamId}"]`);
            if (listItem.length) listItem.show();

            window.updateTrashCanImage();
            window.openTrashModal();
            window.loadUserTeams().then(function() {
                Swal.fire('복구 완료', '팀이 성공적으로 복구되었습니다.', 'success');
            });
        })
        .fail(function(error) {
            console.error('Error restoring team:', error);
            Swal.fire('오류 발생', `팀 복구 중 오류가 발생했습니다: ${error.responseJSON.message}`, 'error');
        });
}

// 휴지통 비우기
window.emptyTrash = function() {
    if (window.trashedTeams.length === 0) {
        Swal.fire('휴지통이 비어있습니다', '', 'info');
        return;
    }

    Swal.fire({
        title: '휴지통 비우기',
        text: '정말로 휴지통을 비우시겠습니까? 이 작업은 되돌릴 수 없습니다.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '비우기',
        cancelButtonText: '취소'
    }).then((result) => {
        if (result.isConfirmed) {
            const errors = [];
            const deletePromises = window.trashedTeams.map(team =>
                window.sendAuthenticatedRequest(`/api/team/group/${team.id}`, 'DELETE')
                    .done(function() {
                        console.log(`Team ${team.id} deleted successfully`);
                        $(`[data-team-id="${team.id}"]`).remove();
                        $(`#projectList li[data-team-id="${team.id}"]`).remove();
                    })
                    .fail(function(error) {
                        console.error(`Error deleting team ${team.id}:`, error);
                        errors.push(`팀 ${team.id} 삭제 실패: ${error.responseJSON.message}`);
                    })
            );

            $.when.apply($, deletePromises).always(function() {
                window.trashedTeams = [];
                window.saveTrashedTeamsToLocalStorage();
                window.updateTrashCanImage();
                window.openTrashModal();

                if (errors.length > 0) {
                    Swal.fire('주의', `일부 팀 삭제 중 오류가 발생했습니다:\n${errors.join('\n')}`, 'warning');
                } else {
                    Swal.fire('완료', '휴지통을 비웠습니다.', 'success');
                }
            });
        }
    });
}

// 이벤트 리스너 설정
$(document).ready(function() {
    window.loadTrashedTeamsFromLocalStorage();
    window.updateTrashCanImage();
});