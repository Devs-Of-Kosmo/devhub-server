// JWT 토큰을 포함한 인증된 요청을 보내는 함수
function sendAuthenticatedRequest(url, method = 'GET', data = null) {
    return $.ajax({
        url: url,
        type: method,
        data: JSON.stringify(data),
        contentType: 'application/json',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
        },
        error: function(jqXHR) {
            if (jqXHR.status === 401) {
                throw new Error('Unauthorized: Please log in again');
            }
        }
    });
}

// 로그인 함수
function login() {
    const email = $('#loginEmail').val();
    const password = $('#loginPassword').val();

    $.ajax({
        url: '/api/auth/public/login',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password }),
        success: function(data) {
            localStorage.setItem('accessToken', data.accessToken);
            closeWindow('loginModal');
            location.reload();
        },
        error: function() {
            console.error('Login error');
            alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
        }
    });
}

// 휴지통 상태를 로컬 스토리지에 저장
function saveTrashedTeamsToLocalStorage() {
    localStorage.setItem('trashedTeams', JSON.stringify(trashedTeams));
}

// 로컬 스토리지에서 휴지통 상태를 로드
function loadTrashedTeamsFromLocalStorage() {
    const storedTrashedTeams = localStorage.getItem('trashedTeams');
    if (storedTrashedTeams) {
        trashedTeams = JSON.parse(storedTrashedTeams);
    }
}

// 휴지통 모달 열기
function openTrashModal() {
    const modal = $('#trashModal');
    const trashItems = $('#trashItems');
    if (!modal.length || !trashItems.length) {
        console.warn('Trash modal or trash items container not found');
        return;
    }
    trashItems.empty();

    $.each(trashedTeams, function(_, team) {
        const item = $('<div>', {
            class: 'trash-item',
            html: `
                <span>${team.name}</span>
                <button onclick="restoreTeam(${team.id})">복구</button>
            `
        });
        trashItems.append(item);
    });

    modal.show();
}

// 팀 복구
function restoreTeam(teamId) {
    sendAuthenticatedRequest(`/api/team/group/${teamId}`, 'POST')
        .done(function(response) {
            console.log('Restore team response:', response);

            trashedTeams = trashedTeams.filter(team => team.id !== teamId);
            saveTrashedTeamsToLocalStorage();

            const teamIcon = $(`[data-team-id="${teamId}"]`);
            if (teamIcon.length) {
                teamIcon.show().removeClass('trashed').css('pointer-events', '');
            }

            const listItem = $(`#projectList li[data-team-id="${teamId}"]`);
            if (listItem.length) listItem.show();

            updateTrashCanImage();
            openTrashModal();
            loadUserTeams().then(function() {
                Swal.fire('복구 완료', '팀이 성공적으로 복구되었습니다.', 'success');
            });
        })
        .fail(function(error) {
            console.error('Error restoring team:', error);
            Swal.fire('오류 발생', `팀 복구 중 오류가 발생했습니다: ${error.responseJSON.message}`, 'error');
        });
}

// 휴지통 비우기
function emptyTrash() {
    if (trashedTeams.length === 0) {
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
            const deletePromises = trashedTeams.map(team =>
                sendAuthenticatedRequest(`/api/team/group/${team.id}`, 'DELETE')
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
                trashedTeams = [];
                saveTrashedTeamsToLocalStorage();
                updateTrashCanImage();
                openTrashModal();

                if (errors.length > 0) {
                    Swal.fire('주의', `일부 팀 삭제 중 오류가 발생했습니다:\n${errors.join('\n')}`, 'warning');
                } else {
                    Swal.fire('완료', '휴지통을 비웠습니다.', 'success');
                }
            });
        }
    });
}

// 휴지통 아이콘 업데이트
function updateTrashCanImage() {
    const trashCan = $('#trashCan');
    if (trashCan.length) {
        const trashImage = trashCan.find('img');
        if (trashImage.length) {
            trashImage.attr('src', trashedTeams.length > 0 ? '/css/images/team_project/fulltrash.png' : '/css/images/team_project/trash.png');
        }
    }
}

// 팀을 휴지통으로 이동
function moveTeamToTrash(teamId, teamName) {
    trashedTeams.push({ id: teamId, name: teamName });
    saveTrashedTeamsToLocalStorage();
    updateTrashCanImage();

    const teamIcon = $(`[data-team-id="${teamId}"]`);
    if (teamIcon.length) {
        teamIcon.addClass('trashed').css('pointer-events', 'none');
    }

    const listItem = $(`#projectList li[data-team-id="${teamId}"]`);
    if (listItem.length) listItem.hide();
}

// 이벤트 리스너 설정
$(document).ready(function() {
    loadTrashedTeamsFromLocalStorage();
    updateTrashCanImage();

    $('#trashCan').on('dblclick', openTrashModal);
    $('#closeTrashBtn').on('click', function() {
        $('#trashModal').hide();
    });
    $('#emptyTrashBtn').on('click', emptyTrash);
});