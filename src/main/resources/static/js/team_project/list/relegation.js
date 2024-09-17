// relegation.js
function initRelegationButtons() {
    document.querySelectorAll('.relegate-button').forEach(button => {
        button.addEventListener('click', function() {
            const teamId = this.getAttribute('data-team-id');
            const memberId = this.getAttribute('data-member-id');
            relegateTeamMember(teamId, memberId);
        });
    });
}

function relegateTeamMember(teamId, memberId) {
    const currentUserRole = window.currentUserRole;
    const targetMemberRole = window.getMemberRole(memberId);

    // 권한 체크
    if (currentUserRole === 'manager') {
        // 매니저는 모든 역할에 대해 강등 가능
    } else if (currentUserRole === 'sub_manager') {
        // 서브 매니저는 멤버에 대해서만 강등 가능
        if (targetMemberRole !== 'member') {
            Swal.fire('오류', '서브 매니저는 멤버만 강등시킬 수 있습니다.', 'error');
            return;
        }
    } else {
        Swal.fire('오류', '권한이 없습니다.', 'error');
        return;
    }

    const url = '/api/team/role/relegation';
    const data = {
        teamId: teamId,
        targetUserId: memberId
    };

    sendAuthenticatedRequest(url, 'PATCH', data)
        .then(response => {
            console.log('Relegation API response:', response);
            Swal.fire('성공', '팀원이 성공적으로 강등되었습니다.', 'success');
            window.refreshTeamInfo(teamId);
        })
        .catch(error => {
            console.error('Error relegating team member:', error);
            Swal.fire('오류', '팀원 강등에 실패했습니다.', 'error');
        });
}
