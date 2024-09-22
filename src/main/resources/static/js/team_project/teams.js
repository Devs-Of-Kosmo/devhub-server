// 아이콘 클릭 처리
window.handleIconClick = function(icon, windowId) {
    $('#Desktop .icon').removeClass('clicked');
    $(icon).addClass('clicked');
    setTimeout(function() {
        if (windowId === 'editTeam') {
            window.populateEditProjectModal().then(function() {
                window.openWindow('editProject');
            });
        } else {
            window.openWindow(windowId);
        }
        $(icon).removeClass('clicked');
    }, 300);
}

// 사용자의 팀 정보를 가져오는 함수
window.loadUserTeams = function() {
    return window.sendAuthenticatedRequest('/api/team/group/list')
        .done(function(teams) {
            const desktop = $('#Desktop');
            const projectList = $('#projectList');

            $('#Desktop .icon[data-team-id]').remove();
            $('#projectList li[data-team-id]').remove();

            $.each(teams, function(_, team) {
                const isTrashed = window.trashedTeams.some(t => t.id === team.teamId);

                // 팀 상세 정보 조회
                window.sendAuthenticatedRequest(`/api/team/group/${team.teamId}`)
                    .done(function(teamDetail) {
                        const isDeleted = teamDetail.deleteCondition;

                        const projectIcon = $('<div>', {
                            class: `icon ${isTrashed ? 'trashed' : ''} ${isDeleted ? 'deleted' : ''}`,
                            'data-team-id': team.teamId,
                            draggable: !isDeleted,
                            html: `
                                <img src="https://cdn-icons-png.flaticon.com/512/3767/3767084.png" alt="${team.teamName}">
                                <span class="title">${team.teamName}</span>
                                ${isDeleted ? '<span class="delete-mark">X</span>' : ''}
                            `
                        });

                        if (!isTrashed && !isDeleted) {
                            projectIcon.on('click', function() {
                                sessionStorage.setItem('teamId', team.teamId);
                                sessionStorage.setItem('teamName', team.teamName);
                                window.location.href = '/team_loading';
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
                    })
                    .fail(function(error) {
                        console.error('Error loading team details:', error);
                        window.handleAjaxError(error);
                    });
            });

            window.enableDragAndDrop();
        })
        .fail(function(error) {
            console.error('Error loading teams:', error);
            window.handleAjaxError(error);
        });
}

// 새 팀 생성
window.createNewProject = function() {
    const createButton = $('#createProjectButton');
    const teamName = $('#projectName').val().trim();
    const description = $('#projectDescription').val().trim();

    if (!teamName) {
        alert('팀 이름을 입력해주세요.');
        return;
    }

    if (createButton.prop('disabled')) {
        return;
    }
    createButton.prop('disabled', true).text('처리 중...');

    window.sendAuthenticatedRequest('/api/team/group', 'POST', { teamName, description })
        .done(function(response) {
            window.closeWindow('createProject');
            $('#projectName').val('');
            $('#projectDescription').val('');
            Swal.fire({
                title: '성공',
                text: '팀이 성공적으로 생성되었습니다. 페이지를 새로고침합니다.',
                icon: 'success',
                confirmButtonText: '확인'
            }).then(() => {
                location.reload(); // 페이지 새로고침
            });
        })
        .fail(function(error) {
            console.error('Error:', error);
            window.handleAjaxError(error);
        })
        .always(function() {
            createButton.prop('disabled', false).text('만들기');
        });
}

// 새로 생성된 팀을 목록에 추가하는 함수
window.addNewTeamToList = function(teamId, teamName) {
    const desktop = $('#Desktop');
    const projectList = $('#projectList');

    const projectIcon = $('<div>', {
        class: 'icon',
        'data-team-id': teamId,
        draggable: true,
        html: `
            <img src="https://cdn-icons-png.flaticon.com/512/3767/3767084.png" alt="${teamName}">
            <span class="title">${teamName}</span>
        `
    });

    projectIcon.on('click', function() {
        sessionStorage.setItem('teamId', teamId);
        sessionStorage.setItem('teamName', teamName);
        window.location.href = '/team_loading';
    });

    desktop.append(projectIcon);

    const listItem = $('<li>', {
        'data-team-id': teamId,
        text: teamName
    });
    projectList.append(listItem);
}

// Edit 모달에 프로젝트 목록을 채우는 함수
window.populateEditProjectModal = function() {
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
window.updateTeamInfo = function(teamId) {
    const changedTeamName = $('#editTeamName').val().trim();
    const changedDescription = $('#editTeamDescription').val().trim();

    if (!changedTeamName && !changedDescription) {
        alert('팀 이름 또는 설명을 변경해주세요.');
        return;
    }

    const updateData = { teamId };
    if (changedTeamName) updateData.changedTeamName = changedTeamName;
    if (changedDescription) updateData.changedDescription = changedDescription;

    window.sendAuthenticatedRequest('/api/team/group', 'PATCH', updateData)
        .done(function() {
            window.loadUserTeams().then(function() {
                window.closeWindow('editProject');
                alert('팀 정보가 성공적으로 수정되었습니다.');
            });
        })
        .fail(function(error) {
            console.error('Error:', error);
            window.handleAjaxError(error);
        });
}