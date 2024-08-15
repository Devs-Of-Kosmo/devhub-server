// 아이콘 클릭 처리
function handleIconClick(icon, windowId) {
    $('#Desktop .icon').removeClass('clicked');
    $(icon).addClass('clicked');
    setTimeout(function() {
        if (windowId === 'editTeam') {
            populateEditProjectModal().then(function() {
                openWindow('editProject');
            });
        } else {
            openWindow(windowId);
        }
        $(icon).removeClass('clicked');
    }, 300);
}

// 사용자의 팀 정보를 가져오는 함수
function loadUserTeams() {
    return $.ajax({
        url: '/api/team/group/list',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
        },
        success: function(teams) {
            const desktop = $('#Desktop');
            const projectList = $('#projectList');

            $('#Desktop .icon[data-team-id]').remove();
            $('#projectList li[data-team-id]').remove();

            $.each(teams, function(_, team) {
                const isTrashed = trashedTeams.some(t => t.id === team.teamId);
                const projectIcon = $('<div>', {
                    class: `icon ${isTrashed ? 'trashed' : ''}`,
                    'data-team-id': team.teamId,
                    html: `
                        <img src="https://cdn-icons-png.flaticon.com/512/3767/3767084.png" alt="${team.teamName}">
                        <span class="title">${team.teamName}</span>
                    `
                });

                if (!isTrashed) {
                    projectIcon.on('click', function() {
                        window.location.href = `/team_loading?id=${encodeURIComponent(team.teamId)}&name=${encodeURIComponent(team.teamName)}`;
                    });
                    const listItem = $('<li>', {
                        'data-team-id': team.teamId,
                        text: team.teamName
                    });
                    projectList.append(listItem);
                } else {
                    projectIcon.css('pointer-events', 'none');
                }

                desktop.append(projectIcon);
            });

            enableDragAndDrop();
        },
        error: function(error) {
            console.error('Error loading teams:', error);
            handleAjaxError(error);
        }
    });
}

// 새 프로젝트 생성
function createNewProject() {
    const createButton = $('#createProjectButton');
    const teamName = $('#projectName').val().trim();
    const description = $('#projectDescription').val().trim();

    if (!teamName) {
        alert('팀 이름을 입력해주세요.');
        return;
    }

    // 버튼 비활성화 및 중복 방지
    if (createButton.prop('disabled')) {
        return; // 이미 요청이 진행 중이면 중복으로 처리하지 않음
    }
    createButton.prop('disabled', true).text('처리 중...');

    $.ajax({
        url: '/api/team/group',
        type: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
        },
        contentType: 'application/json',
        data: JSON.stringify({ teamName, description }),
        success: function() {
            closeWindow('createProject');
            $('#projectName').val('');
            $('#projectDescription').val('');
            Swal.fire({
                title: '성공',
                text: '프로젝트가 성공적으로 생성되었습니다. 페이지를 새로고침합니다.',
                icon: 'success',
                confirmButtonText: '확인'
            }).then(() => {
                location.reload();
            });
        },
        error: function(error) {
            console.error('Error:', error);
            handleAjaxError(error);
        },
        complete: function() {
            // 요청이 끝난 후 버튼을 다시 활성화
            createButton.prop('disabled', false).text('만들기');
        }
    });
}

// Edit 모달에 프로젝트 목록을 채우는 함수
function populateEditProjectModal() {
    return new Promise((resolve) => {
        const projectList = $('#Desktop .icon[data-team-id]');
        const selectProject = $('#selectProject');
        selectProject.empty();

        projectList.each(function() {
            const teamId = $(this).attr('data-team-id');
            const teamName = $(this).find('.title').text();
            selectProject.append($('<option>').val(teamId).text(teamName));
        });

        selectProject.off('change').on('change', function() {
            const selectedProject = $(`#Desktop .icon[data-team-id="${selectProject.val()}"]`);
            $('#editTeamName').val(selectedProject.find('.title').text());
        });

        if (selectProject.find('option').length > 0) {
            selectProject.prop('selectedIndex', 0).trigger('change');
        }

        resolve();
    });
}

// 팀 정보 수정
function updateTeamInfo(teamId) {
    const changedTeamName = $('#editTeamName').val().trim();
    const changedDescription = $('#editTeamDescription').val().trim();

    if (!changedTeamName && !changedDescription) {
        alert('팀 이름 또는 설명을 변경해주세요.');
        return;
    }

    const updateData = { teamId };
    if (changedTeamName) updateData.changedTeamName = changedTeamName;
    if (changedDescription) updateData.changedDescription = changedDescription;

    $.ajax({
        url: '/api/team/group',
        type: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
        },
        contentType: 'application/json',
        data: JSON.stringify(updateData),
        success: function() {
            loadUserTeams().then(function() {
                closeWindow('editProject');
                alert('팀 정보가 성공적으로 수정되었습니다.');
            });
        },
        error: function(error) {
            console.error('Error:', error);
            handleAjaxError(error);
        }
    });
}

// 에러 처리 함수
function handleAjaxError(error) {
    if (error.responseJSON && error.responseJSON.message === 'Unauthorized: Please log in again') {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        openWindow('loginModal');
    } else {
        alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
}

// jQuery를 사용한 이벤트 리스너 설정
$(document).ready(function() {
    $('#createProjectButton').on('click', createNewProject);
    $('#saveTeamChangesButton').on('click', function() {
        const selectedProjectId = $('#selectProject').val();
        updateTeamInfo(selectedProjectId);
    });
});