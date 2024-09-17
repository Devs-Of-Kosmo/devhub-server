(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const leaveTeamConfirmModal = document.getElementById('leaveTeamConfirmModal');
        const confirmLeaveTeamButton = document.getElementById('confirmLeaveTeamButton');
        const cancelLeaveTeamButton = document.getElementById('cancelLeaveTeamButton');

        function getCurrentTeamInfo() {
            const repoTeamSelect = document.getElementById('repoTeamId');
            let currentTeamId = localStorage.getItem('selectedTeamId');
            let currentTeamName = '';

            console.log('Stored selectedTeamId:', currentTeamId);

            if (repoTeamSelect && repoTeamSelect.selectedIndex !== -1) {
                currentTeamId = currentTeamId || repoTeamSelect.value;
                currentTeamName = repoTeamSelect.options[repoTeamSelect.selectedIndex].text;
                console.log('Selected team from dropdown:', currentTeamId, currentTeamName);
            } else {
                console.log('No team selected in dropdown');
            }

            return { id: currentTeamId, name: currentTeamName };
        }

        window.showLeaveTeamModal = function() {
            console.log('showLeaveTeamModal function called');
            if (leaveTeamConfirmModal) {
                console.log('Leave team modal found');
                const { id: currentTeamId, name: currentTeamName } = getCurrentTeamInfo();

                if (currentTeamId) {
                    document.getElementById('currentTeamInfo').textContent = `현재 팀: ${currentTeamName}`;
                    leaveTeamConfirmModal.style.display = 'block';
                    console.log('Leave team modal displayed for team:', currentTeamId, currentTeamName);
                } else {
                    console.error('No team currently selected');
                    Swal.fire('오류', '선택된 팀이 없습니다. 팀을 먼저 선택해주세요.', 'error');
                }
            } else {
                console.error('leaveTeamConfirmModal element not found');
            }
        };

        // 수정된 leaveTeam 함수
        window.leaveTeam = function() {
            const { id: currentTeamId, name: currentTeamName } = getCurrentTeamInfo();
            console.log('Attempting to leave team with ID:', currentTeamId);

            if (!currentTeamId) {
                console.error('No team selected for leaving');
                Swal.fire('오류', '나갈 팀이 선택되지 않았습니다.', 'error');
                return;
            }

            // 함수 이름 변경: sendAuthenticatedRequest -> sendAuthenticatedRequestRaw
            sendAuthenticatedRequestRaw(`/api/team/group/leave/${currentTeamId}`, 'DELETE')
                .then(response => {
                    if (!response) {
                        throw new Error('No response from server');
                    }

                    if (response.ok) {
                        console.log('Successfully left the team');
                        return Swal.fire({
                            title: '성공',
                            text: `"${currentTeamName}" 팀을 성공적으로 나갔습니다.`,
                            icon: 'success',
                            confirmButtonText: '확인'
                        });
                    } else {
                        throw new Error('Failed to leave the team');
                    }
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        leaveTeamConfirmModal.style.display = 'none';
                        // 팀 목록 새로고침
                        if (typeof window.loadTeams === 'function') {
                            window.loadTeams();
                        }
                        // 현재 팀 정보 모달 닫기
                        if (document.getElementById('teamInfoModal')) {
                            document.getElementById('teamInfoModal').style.display = 'none';
                        }
                        // 현재 팀 ID 초기화
                        localStorage.removeItem('selectedTeamId');

                        // /team_project 페이지로 리다이렉션
                        window.location.href = '/team_project';
                    }
                })
                .catch(error => {
                    console.error('Error leaving team:', error);
                    Swal.fire('오류', '팀을 나가는데 실패했습니다: ' + error.message, 'error');
                });
        };

        if (confirmLeaveTeamButton) {
            confirmLeaveTeamButton.addEventListener('click', function() {
                console.log('Confirm leave team button clicked');
                window.leaveTeam();
            });
        } else {
            console.error('Confirm leave team button not found');
        }

        if (cancelLeaveTeamButton) {
            cancelLeaveTeamButton.addEventListener('click', function() {
                console.log('Cancel leave team button clicked');
                leaveTeamConfirmModal.style.display = 'none';
            });
        } else {
            console.error('Cancel leave team button not found');
        }

        // sendAuthenticatedRequest 함수 이름을 변경하여 충돌 방지
        function sendAuthenticatedRequestRaw(url, method, body) {
            const token = localStorage.getItem('accessToken');
            return fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: body ? JSON.stringify(body) : null
            }).then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(text || 'Network response was not ok');
                    });
                }
                return response;
            });
        }
    });
})();
