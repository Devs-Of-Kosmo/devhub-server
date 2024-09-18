// promotion.js
function initPromotionButtons() {
    document.querySelectorAll('.promote-button').forEach(button => {
        button.addEventListener('click', function() {
            const teamId = this.getAttribute('data-team-id');
            const memberId = this.getAttribute('data-member-id');

            console.log("Promote Button Clicked. Team ID:", teamId, "Member ID:", memberId);

            if (memberId) {
                promoteTeamMember(teamId, memberId);
            } else {
                Swal.fire('오류', '팀원의 ID가 설정되지 않았습니다.', 'error');
            }
        });
    });
}

function promoteTeamMember(teamId, memberId) {
    console.log(`Attempting to promote member. Team ID: ${teamId}, Member ID: ${memberId}`);

    const currentUserRole = window.currentUserRole;
    const targetMemberRole = window.getMemberRole(memberId);

    // 권한 체크
    if (currentUserRole === 'manager') {
        // 매니저는 모든 역할에 대해 진급 가능
    } else if (currentUserRole === 'sub_manager') {
        // 서브 매니저는 멤버에 대해서만 진급 가능
        if (targetMemberRole !== 'member') {
            Swal.fire('오류', '서브 매니저는 멤버만 진급시킬 수 있습니다.', 'error');
            return;
        }
    } else {
        Swal.fire('오류', '권한이 없습니다.', 'error');
        return;
    }

    const url = '/api/team/role/promotion';
    const data = {
        teamId: teamId,
        targetUserId: memberId
    };

    sendAuthenticatedRequest(url, 'PATCH', data)
        .then(response => {
            console.log('Promotion API response:', response);
            Swal.fire({
                title: '성공',
                text: '팀원이 성공적으로 진급되었습니다.',
                icon: 'success',
                confirmButtonText: '확인'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.refreshTeamInfo(teamId);
                }
            });
        })
        .catch(error => {
            console.error('Error promoting team member:', error);
            Swal.fire('오류', '팀원 진급에 실패했습니다.', 'error');
        });
}
