$(document).ready(function() {
    console.log("Script loaded");

    function checkAccessToken() {
        var accessToken = localStorage.getItem('accessToken');
        console.log('Access Token from Local Storage:', accessToken);

        if (!accessToken) {
            console.warn('로그인 정보가 없습니다.');
            window.location.href = '/login';
            return;
        }

        loadUserInfo();
        loadPersonalRepoList();
        loadTeamProjects();
        setupProjectLinks();
        loadFriendList();

    }

    function loadFriendList() {
        // 친구 목록은 로컬 스토리지에서 관리합니다.
        var friends = JSON.parse(localStorage.getItem('friends')) || [];
        displayFriendList(friends);
    }

    function displayFriendList(friends) {
        var friendList = $('#friend-list');
        friendList.empty();

        friends.forEach(function(friend) {
            var friendItem = $('<div class="friend-item"></div>');
            friendItem.append('<p>' + friend.name + ' (' + friend.email + ')</p>');
            friendList.append(friendItem);
        });
    }

    $('#add-friend-btn').on('click', function() {
        $('#addFriendModal').modal('show');
    });

    $('#confirm-add-friend').on('click', function() {
        var friendEmail = $('#friend-email').val();
        addFriend(friendEmail);
    });

    function addFriend(email) {
        ajaxWithToken('/api/user/info', {
            method: 'GET',
            data: { email: email }
        })
            .done(function(response) {
                var friends = JSON.parse(localStorage.getItem('friends')) || [];
                var newFriend = {
                    userId: response.userId,
                    email: response.email,
                    name: response.name
                };

                // 중복 체크
                if (!friends.some(friend => friend.email === newFriend.email)) {
                    friends.push(newFriend);
                    localStorage.setItem('friends', JSON.stringify(friends));
                    Swal.fire('Success', '친구가 추가되었습니다.', 'success');
                    loadFriendList();
                } else {
                    Swal.fire('Info', '이미 추가된 친구입니다.', 'info');
                }
                $('#addFriendModal').modal('hide');
            })
            .fail(function(error) {
                console.error('Error adding friend:', error);
                Swal.fire('Error', '친구 추가에 실패했습니다. 유효한 이메일인지 확인해주세요.', 'error');
            });
    }

    // 비밀번호 변경 버튼 클릭 이벤트 (ID 선택자로 변경)
    $('#change-password-btn').on('click', function() {
        // ... 기존 비밀번호 변경 코드 ...
    });

    function loadTeamProjects() {
        // 임시로 더미 데이터 사용
        var dummyData = [{ id: 1, name: "Project 1" }, { id: 2, name: "Project 2" }];
        $('#team-projects-count').text(dummyData.length);
        console.log('Team Projects (Dummy):', dummyData);
    }


    function setupProjectLinks() {
        $('#personal-project-link').on('click', function() {
            window.location.href = 'loading';
        });

        $('#team-project-link').on('click', function() {
            window.location.href = '/team_project';
        });
    }

    function ajaxWithToken(url, options = {}) {
        options.headers = options.headers || {};
        options.headers['Authorization'] = 'Bearer ' + localStorage.getItem('accessToken');

        return $.ajax(url, options);
    }

    function loadUserInfo() {
        ajaxWithToken('/api/user/info')
            .done(function(data) {
                console.log('User info:', data);
                $('#user-name').text(data.name);
                $('#user-email').text(data.email);
            })
            .fail(function(error) {
                console.error('Error fetching user info:', error);
                handleAjaxError(error);
            });
    }

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
            projectItem.append('<p>Created: ' + new Date(project.createdDate).toLocaleString() + '</p>');

            var editButton = $('<button class="edit-project">Edit</button>');
            editButton.click(function() {
                editProject(project.projectId, project.projectName, project.description);
            });

            var deleteButton = $('<button class="delete-project">Delete</button>');
            deleteButton.click(function() {
                deleteProject(project.projectId);
            });

            projectItem.append(editButton);
            projectItem.append(deleteButton);
            projectList.append(projectItem);
        });
    }

    function editProject(projectId, currentName, currentDescription) {
        Swal.fire({
            title: 'Edit Project',
            html:
                '<input id="edit-project-name" class="swal2-input" value="' + currentName + '">' +
                '<textarea id="edit-project-description" class="swal2-textarea">' + currentDescription + '</textarea>',
            focusConfirm: false,
            preConfirm: () => {
                return {
                    projectName: document.getElementById('edit-project-name').value,
                    description: document.getElementById('edit-project-description').value
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                updateProject(projectId, result.value.projectName, result.value.description);
            }
        });
    }

    function updateProject(projectId, changedProjectName, changedDescription) {
        ajaxWithToken('/api/personal/repo', {
            method: 'PATCH',
            contentType: 'application/json',
            data: JSON.stringify({
                projectId: projectId,
                changedProjectName: changedProjectName,
                changedDescription: changedDescription
            })
        })
            .done(function(response) {
                console.log('Project updated:', response);
                Swal.fire('Success', 'Project updated successfully', 'success');
                loadPersonalRepoList();
            })
            .fail(function(error) {
                console.error('Error updating project:', error);
                Swal.fire('Error', 'Failed to update project', 'error');
            });
    }

    function deleteProject(projectId) {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                ajaxWithToken('/api/personal/repo/' + projectId, {
                    method: 'DELETE'
                })
                    .done(function() {
                        Swal.fire('Deleted!', 'Your project has been deleted.', 'success');
                        loadPersonalRepoList();
                    })
                    .fail(function(error) {
                        console.error('Error deleting project:', error);
                        Swal.fire('Error', 'Failed to delete project', 'error');
                    });
            }
        });
    }

    function handleAjaxError(error) {
        if (error.status === 401) {
            console.error('Access token expired or invalid, redirecting to login page.');
            window.location.href = '/login';
        } else {
            Swal.fire('Error', 'An error occurred while fetching data.', 'error');
        }
    }

    // 프로필 이미지 업로드 기능
    $('#profile-image').on('click', function() {
        $('#profile-image-upload').click();
    });

    $('#profile-image-upload').on('change', function(event) {
        var file = event.target.files[0];
        var reader = new FileReader();

        reader.onload = function(e) {
            $('#profile-image').attr('src', e.target.result);
            // TODO: 프로필 이미지를 서버에 업로드하는 AJAX 요청 추가
        }

        reader.readAsDataURL(file);
    });

    // 비밀번호 변경 버튼 클릭 이벤트
    $('.btn-primary').on('click', function() {
        Swal.fire({
            title: '비밀번호 변경',
            html:
                '<input id="current-password" class="swal2-input" type="password" placeholder="현재 비밀번호">' +
                '<input id="new-password" class="swal2-input" type="password" placeholder="새 비밀번호">' +
                '<input id="confirm-password" class="swal2-input" type="password" placeholder="새 비밀번호 확인">',
            focusConfirm: false,
            preConfirm: () => {
                return [
                    document.getElementById('current-password').value,
                    document.getElementById('new-password').value,
                    document.getElementById('confirm-password').value
                ]
            }
        }).then((result) => {
            if (result.value) {
                const [currentPassword, newPassword, confirmPassword] = result.value;
                if (newPassword !== confirmPassword) {
                    Swal.fire('Error', '새 비밀번호가 일치하지 않습니다.', 'error');
                    return;
                }
                // TODO: 비밀번호 변경 API 호출 추가
                console.log('Password change requested');
            }
        });
    });

    // 진행률 슬라이더 기능
    $('#progress-slider').on('input', function() {
        var value = $(this).val();
        $('#progress-bar').css('width', value + '%').attr('aria-valuenow', value);
        $('#progress-bar').text(value + '%');
        $('#slider-value').text(value + '%');
    });

    checkAccessToken();

    $('#login-link').on('click', function() {
        window.location.href = '/login';
    });
});