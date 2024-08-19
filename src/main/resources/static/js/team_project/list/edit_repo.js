// 토큰 가져오기 함수
function getToken() {
    return localStorage.getItem('accessToken');
}

// 레포지토리 수정 함수
function editRepository(projectId, changedProjectName, changedDescription) {
    const token = getToken();
    if (!token) return;

    $.ajax({
        url: '/api/team/repo',
        type: 'PATCH',
        contentType: 'application/json',
        headers: { 'Authorization': `Bearer ${token}` },
        data: JSON.stringify({
            projectId: projectId,
            changedProjectName: changedProjectName,
            changedDescription: changedDescription
        }),
        success: function(response) {
            Swal.fire('성공', '레포지토리가 성공적으로 수정되었습니다.', 'success');
            $('#editRepoModal').hide();
            loadRepositories($('#editTeamSelect').val());
        },
        error: function(xhr, status, error) {
            console.error('Error editing repository:', error);
            Swal.fire('오류', '레포지토리 수정에 실패했습니다.', 'error');
        }
    });
}

// 팀 목록 로드
function loadTeams() {
    $.ajax({
        url: '/api/team/group/list',
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + getToken() },
        success: function(teams) {
            const teamSelect = $('#editTeamSelect');
            teamSelect.empty().append('<option value="">팀 선택</option>');
            teams.forEach(function(team) {
                teamSelect.append($('<option>', {
                    value: team.teamId,
                    text: team.teamName
                }));
            });
            teamSelect.prop('disabled', false);
        },
        error: function(xhr, status, error) {
            console.error('팀 목록 로드 실패:', error);
            Swal.fire('오류', '팀 목록을 불러오는데 실패했습니다.', 'error');
        }
    });
}

// 레포지토리 목록 조회 함수
function loadRepositories(teamId) {
    if (!teamId) {
        console.error('TeamId is missing');
        return;
    }

    $.ajax({
        url: `/api/team/repo/list/${teamId}`,
        type: 'GET',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        success: function(repos) {
            console.log('Repositories loaded:', repos);
            const editRepoSelect = $('#editRepoSelect');
            editRepoSelect.empty().append('<option value="">레포지토리 선택</option>');
            repos.forEach(function(repo) {
                editRepoSelect.append($('<option>', {
                    value: repo.projectId,
                    text: repo.projectName,
                    'data-description': repo.description
                }));
            });
            editRepoSelect.prop('disabled', false);
        },
        error: function(xhr, status, error) {
            console.error('Error loading repositories:', error);
            Swal.fire('오류', '레포지토리 목록을 불러오는데 실패했습니다.', 'error');
        }
    });
}

// 수정 모달 열기 함수
function openEditRepoModal() {
    loadTeams();
    $('#editRepoModal').show();
    resetEditForm();
}

// 폼 리셋 함수
function resetEditForm() {
    $('#editTeamSelect').val('');
    $('#editRepoSelect').empty().append('<option value="">레포지토리 선택</option>').prop('disabled', true);
    $('#editProjectName, #editDescription').val('').prop('disabled', true);
    $('#editRepoButton, #deleteRepoButton').prop('disabled', true);
}

// 이벤트 리스너 설정
$(document).ready(function() {
    // 팀 선택 변경 시 해당 팀의 레포지토리 목록 로드
    $('#editTeamSelect').on('change', function() {
        const teamId = $(this).val();
        if (teamId) {
            loadRepositories(teamId);
        } else {
            resetEditForm();
        }
    });

    // 레포지토리 선택 변경 시 수정 폼 필드 업데이트
    $('#editRepoSelect').on('change', function() {
        const selectedOption = $(this).find(':selected');
        if (selectedOption.val()) {
            $('#editProjectName').val(selectedOption.text()).prop('disabled', false);
            $('#editDescription').val(selectedOption.data('description') || '').prop('disabled', false);
            $('#editRepoButton, #deleteRepoButton').prop('disabled', false);
        } else {
            $('#editProjectName, #editDescription').val('').prop('disabled', true);
            $('#editRepoButton, #deleteRepoButton').prop('disabled', true);
        }
    });

    // 레포지토리 수정 버튼 클릭 이벤트
    $('#editRepoButton').on('click', function() {
        const projectId = $('#editRepoSelect').val();
        const changedProjectName = $('#editProjectName').val();
        const changedDescription = $('#editDescription').val();

        if (!projectId || !changedProjectName) {
            Swal.fire('오류', '레포지토리와 프로젝트 이름은 필수 입력 사항입니다.', 'error');
            return;
        }

        editRepository(projectId, changedProjectName, changedDescription);
    });


    // 모달 닫기 이벤트
    $('.close-button').on('click', function() {
        $(this).closest('.modal').hide();
        resetEditForm();
    });
});

// 전역 스코프에 함수 노출
window.openEditRepoModal = openEditRepoModal;
