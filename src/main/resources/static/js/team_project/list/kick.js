// kick.js
function initKickButtons() {
    document.querySelectorAll('.kick-button').forEach(button => {
        button.addEventListener('click', function() {
            const teamId = this.getAttribute('data-team-id');
            const memberId = this.getAttribute('data-member-id');
            kickTeamMember(teamId, memberId);
        });
    });
}

function kickTeamMember(teamId, memberId) {
    const currentUserRole = window.currentUserRole;

    // 권한 체크
    if (currentUserRole !== 'manager') {
        Swal.fire('오류', '권한이 없습니다. 매니저만 팀원을 퇴출시킬 수 있습니다.', 'error');
        return;
    }

    const url = `/api/team/group/kick/${teamId}?kickUserId=${memberId}`;

    sendAuthenticatedRequest(url, 'DELETE')
        .then(response => {
            console.log('Kick API response:', response);
            Swal.fire('성공', '팀원이 성공적으로 퇴출되었습니다.', 'success');
            window.refreshTeamInfo(teamId);
        })
        .catch(error => {
            console.error('Error kicking team member:', error);
            Swal.fire('오류', '팀원 퇴출에 실패했습니다.', 'error');
        });
}
