$(document).ready(function() {
    let currentProjectId = null;

    function loadPersonalRepoList() {
        ajaxWithToken('/api/personal/repo/list')
            .done(function(data) {
                console.log('Personal Repos:', data);
                $('#personal-projects-count').text(data.length);
                displayPersonalProjects(data);
            })
            .fail(function(error) {
                console.error('Error fetching personal repos:', error);
                handleAjaxError(error);
            });
    }

    function displayPersonalProjects(projects) {
        var projectList = $('#project-list');
        projectList.empty();

        projects.forEach(function(project) {
            var projectItem = $('<div class="project-item"></div>');
            projectItem.append('<h3>' + project.projectName + '</h3>');
            projectItem.append('<p>' + project.description + '</p>');

            var viewCommitsButton = $('<button class="btn btn-sm btn-primary view-commits">커밋 보기</button>');
            viewCommitsButton.click(function() {
                currentProjectId = project.projectId;
                loadProjectMetadata(project.projectId);
                highlightSelectedProject(projectItem);
            });

            projectItem.append(viewCommitsButton);
            projectList.append(projectItem);
        });
    }

    function highlightSelectedProject(selectedItem) {
        $('.project-item').removeClass('selected');
        selectedItem.addClass('selected');
    }

    function loadProjectMetadata(projectId) {
        ajaxWithToken('/api/personal/project/metadata?projectId=' + projectId)
            .done(function(data) {
                displayCommitHistory(data.commitInfo);
            })
            .fail(function(error) {
                console.error('Error fetching project metadata:', error);
                handleAjaxError(error);
            });
    }

    function displayCommitHistory(commits) {
        var commitList = $('#commit-list');
        commitList.empty();

        if (commits.length === 0) {
            commitList.append('<p class="no-commits">커밋 기록이 없습니다.</p>');
            return;
        }

        commits.forEach(function(commit) {
            var commitItem = $('<div class="commit-item"></div>');

            var commitIcon = $('<div class="commit-icon"><i class="fas fa-code-branch"></i></div>');
            var commitContent = $('<div class="commit-content"></div>');

            commitContent.append('<h6 class="commit-message">' + commit.commitMessage + '</h6>');
            commitContent.append('<p class="commit-info">' +
                '<span>커밋 ID: ' + commit.commitId + '</span><br>' +
                '<span>날짜: ' + new Date(commit.createdDate).toLocaleString() + '</span>' +
                '</p>');

            var commitActions = $('<div class="commit-actions"></div>');
            var detailsButton = $('<button class="btn btn-sm btn-info view-details">상세 보기</button>');
            detailsButton.click(function() {
                loadCommitDetails(commit.commitId);
            });
            commitActions.append(detailsButton);
            commitActions.append('<span class="file-count">변경된 파일: ' + (commit.changedFiles ? commit.changedFiles.length : '알 수 없음') + '개</span>');

            commitContent.append(commitActions);
            commitItem.append(commitIcon).append(commitContent);
            commitList.append(commitItem);
        });
    }

    function loadCommitDetails(commitId) {
        ajaxWithToken('/api/personal/project/commit?commitId=' + commitId)
            .done(function(data) {
                displayCommitDetails(data);
            })
            .fail(function(error) {
                console.error('Error fetching commit details:', error);
                handleAjaxError(error);
            });
    }

    function displayCommitDetails(details) {
        var detailsContent = '<h4>변경된 파일 목록:</h4><ul class="changed-files-list">';
        details.fileNameWithPathList.forEach(function(file) {
            detailsContent += '<li>' + file + '</li>';
        });
        detailsContent += '</ul>';

        Swal.fire({
            title: '커밋 상세 정보',
            html: detailsContent,
            width: 600,
            confirmButtonText: '확인'
        });
    }

    function ajaxWithToken(url, options = {}) {
        options.headers = options.headers || {};
        options.headers['Authorization'] = 'Bearer ' + localStorage.getItem('accessToken');
        return $.ajax(url, options);
    }

    function handleAjaxError(error) {
        if (error.status === 401) {
            console.error('Access token expired or invalid, redirecting to login page.');
            window.location.href = '/login';
        } else {
            Swal.fire('Error', 'An error occurred while fetching data.', 'error');
        }
    }

    // 새로고침 버튼 추가 및 이벤트 핸들러 등록
    var refreshButton = $('<button class="btn btn-primary refresh-commits">새로고침</button>');
    $('#commit-history').prepend(refreshButton);

    refreshButton.on('click', function() {
        loadPersonalRepoList();
        if (currentProjectId) {
            loadProjectMetadata(currentProjectId);
        } else {
            $('#commit-list').empty().append('<p class="no-commits">프로젝트를 선택해주세요.</p>');
        }
    });

    // 페이지 로드 시 프로젝트 목록 불러오기
    loadPersonalRepoList();
});