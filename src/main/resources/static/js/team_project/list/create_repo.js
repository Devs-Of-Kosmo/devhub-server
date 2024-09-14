$(document).ready(function() {
    const currentTeamId = window.getCurrentTeamId();

    // 토큰 가져오기 함수
    function getToken() {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            Swal.fire('오류', '로그인이 필요합니다.', 'error');
            window.location.href = '/login';
            return null;
        }
        return token;
    }

    // 팀 목록 로드
    function loadTeams() {
        $.ajax({
            url: '/api/team/group/list',
            type: 'GET',
            headers: { 'Authorization': 'Bearer ' + getToken() },
            success: function(teams) {
                const teamSelect = $('#repoTeamId');
                teamSelect.empty().append('<option value="">팀 선택</option>');
                teams.forEach(function(team) {
                    teamSelect.append($('<option>', {
                        value: team.teamId,
                        text: team.teamName
                    }));
                });

                // 현재 팀 ID가 있으면 선택
                if (currentTeamId) {
                    teamSelect.val(currentTeamId);
                }

                // 팀 목록을 로드한 후 레포지토리 목록 로드
                loadRepositories(currentTeamId);
            },
            error: function(xhr, status, error) {
                console.error('팀 목록 로드 실패:', error);
                Swal.fire('오류', '팀 목록을 불러오는데 실패했습니다.', 'error');
            }
        });
    }

    // 레포지토리 생성
    function createRepository(teamId, projectName, description) {
        $.ajax({
            url: '/api/team/repo',
            type: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken() },
            contentType: 'application/json',
            data: JSON.stringify({
                teamId: teamId,
                projectName: projectName,
                description: description
            }),
            success: function(response) {
                $('#createRepoModal').hide();
                // 입력 필드 초기화
                $('#repoProjectName').val('');
                $('#repoDescription').val('');

                Swal.fire({
                    title: '성공',
                    text: '레포지토리가 성공적으로 생성되었습니다.',
                    icon: 'success',
                    confirmButtonText: '확인'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // 페이지 새로고침
                        location.reload();
                    }
                });
            },
            error: function(xhr, status, error) {
                console.error('레포지토리 생성 실패:', error);
                Swal.fire('오류', '레포지토리 생성에 실패했습니다.', 'error');
            }
        });
    }

    // 레포지토리 로드
    function loadRepositories(teamId) {
        if (!teamId) {
            console.error('Team ID is required to load repositories');
            return;
        }

        $.ajax({
            url: `/api/team/repo/list/${teamId}`,
            type: 'GET',
            headers: { 'Authorization': `Bearer ${getToken()}` },
            success: function(repos) {
                updateDesktopIcons(repos, teamId);
            },
            error: function(xhr, status, error) {
                console.error('Error loading repositories:', error);
                Swal.fire('오류', '레포지토리 목록을 불러오는데 실패했습니다.', 'error');
            }
        });
    }

    // 레포지토리 아이콘 업데이트
    function updateDesktopIcons(repos, teamId) {
        const desktop = $('#desktop');
        desktop.find('.disk-icon:not(#create-repo-disk):not([data-title="teamInfo"]):not([data-title="inviteMembers"])').remove();

        repos.forEach(function(repo) {
            addRepoDiskIcon(repo.projectId, repo.projectName, teamId, $('#repoTeamId option:selected').text(), repo.description, repo.deleteCondition);
        });
    }

    // 레포지토리 디스크 아이콘 추가
    function addRepoDiskIcon(projectId, projectName, teamId, teamName, description, isDeleted = false) {
        const desktop = $('#desktop');
        if (desktop.find(`[data-project-id="${projectId}"]`).length > 0) return;

        const diskIcon = $('<div>', {
            class: 'disk-icon',
            'data-project-id': projectId,
            'data-team-id': teamId,
            draggable: true,
            css: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                margin: '10px',
                width: '100px',
                height: '100px',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative'
            }
        }).append(
            $('<img>', {
                src: '/css/images/team_project/repo.png',
                alt: projectName,
                css: {
                    width: '64px',
                    height: '64px',
                    objectFit: 'contain',
                    transition: 'all 0.2s',
                    marginBottom: '5px'
                }
            }),
            $('<p>', {
                text: projectName,
                css: {
                    fontSize: '0.9em',
                    wordBreak: 'break-word',
                    textShadow: '0px 0px 4px #000',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: '1.2em',
                    height: '2.4em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }
            })
        );

        if (isDeleted) {
            diskIcon.attr('data-deleted', 'true');
            diskIcon.css({
                opacity: '0.5',
                pointerEvents: 'none'
            });
            diskIcon.append(
                $('<span>', {
                    text: '❌',
                    css: {
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        fontSize: '20px',
                        color: 'red',
                        textShadow: '0px 0px 3px white'
                    }
                })
            );
        } else {
            diskIcon.on('click', function() {
                window.location.href = `/test_team`;
            });
            diskIcon.on('dragstart', function(event) {
                event.originalEvent.dataTransfer.setData('text/plain', JSON.stringify({
                    id: projectId,
                    name: projectName,
                    teamId: teamId,
                    teamName: teamName,
                    description: description
                }));
            });
        }

        desktop.append(diskIcon);
    }

    // 이벤트 리스너
    $('#createRepoButton').on('click', function() {
        const teamId = $('#repoTeamId').val();
        const projectName = $('#repoProjectName').val();
        const description = $('#repoDescription').val();

        if (!teamId || !projectName) {
            Swal.fire('오류', '팀과 프로젝트 이름은 필수 입력 사항입니다.', 'error');
            return;
        }

        createRepository(teamId, projectName, description);
    });

    $('#repoTeamId').on('change', function() {
        const selectedTeamId = $(this).val();
        if (selectedTeamId) {
            loadRepositories(selectedTeamId);
        } else {
            // 팀이 선택되지 않았을 때 레포지토리 목록 초기화
            const desktop = $('#desktop');
            desktop.find('.disk-icon:not(#create-repo-disk):not([data-title="teamInfo"]):not([data-title="inviteMembers"])').remove();
        }
    });

    $('#create-repo-disk').on('click', function() {
        $('#createRepoModal').show();
    });

    $('.close-button').on('click', function() {
        $(this).closest('.modal').hide();
    });

    // 초기 로드
    loadTeams();
});