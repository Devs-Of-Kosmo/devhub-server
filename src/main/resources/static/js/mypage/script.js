$(document).ready(function() {
    console.log("Script loaded");

    let currentUserEmail; // 현재 사용자의 이메일을 저장할 전역 변수

    function checkAccessToken() {
        var accessToken = localStorage.getItem('accessToken');
        console.log('Access Token from Local Storage:', accessToken);

        if (!accessToken) {
            console.warn('로그인 정보가 없습니다.');
            window.location.href = '/login';
            return;
        }

        loadUserInfo().then(() => {
            loadPersonalRepoList();
            loadTeamProjects();
            if (typeof fetchAndUpdateBoardPosts === 'function') {
                fetchAndUpdateBoardPosts();
            }
        });
    }

    document.getElementById('home-link').addEventListener('click', function() {
        window.location.href = '/';
    });

    function ajaxWithToken(url, options = {}) {
        options.headers = options.headers || {};
        options.headers['Authorization'] = 'Bearer ' + localStorage.getItem('accessToken');
        return $.ajax(url, options);
    }

    // ajaxWithToken 함수를 전역으로 설정
    window.ajaxWithToken = ajaxWithToken;

    function loadUserInfo() {
        return new Promise((resolve, reject) => {
            ajaxWithToken('/api/user/info')
                .done(function(data) {
                    console.log('User info loaded:', data);
                    $('#user-name').text(data.name);
                    $('#user-email').text(data.email);
                    currentUserEmail = data.email;
                    console.log('Current user email set to:', currentUserEmail);
                    resolve();
                })
                .fail(function(error) {
                    console.error('Error fetching user info:', error);
                    handleAjaxError(error);
                    reject(error);
                });
        });
    }

    $('#change-password-btn').on('click', function() {
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

    function loadTeamProjects() {
        ajaxWithToken('/api/team/group/list')
            .done(function(data) {
                if (Array.isArray(data)) {
                    $('#team-projects-count').text(data.length);
                    console.log('Team Projects:', data);
                } else {
                    console.error('Unexpected data format:', data);
                    $('#team-projects-count').text(0);
                }
            })
            .fail(function(error) {
                console.error('Error fetching team projects:', error);
                $('#team-projects-count').text(0); // 오류 발생 시 0으로 설정
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

    function displayPaymentHistory() {
        let paymentHistory = JSON.parse(localStorage.getItem('paymentHistory')) || [];
        let paymentContent = $('#payment');

        if (paymentHistory.length === 0) {
            paymentContent.html('<p>결제 내역이 없습니다.</p>');
            return;
        }

        let historyHTML = '<h3>결제 내역</h3><ul class="list-group">';
        paymentHistory.forEach(function(payment) {
            historyHTML += `
            <li class="list-group-item">
                <strong>주문번호:</strong> ${payment.merchant_uid}<br>
                <strong>상품명:</strong> ${payment.name}<br>
                <strong>금액:</strong> ${payment.amount}원<br>
                <strong>결제일:</strong> ${payment.date}
            </li>
        `;
        });
        historyHTML += '</ul>';

        paymentContent.html(historyHTML);
    }

    function handleAjaxError(error) {
        if (error.status === 401) {
            console.error('Access token expired or invalid, redirecting to login page.');
            window.location.href = '/login';
        } else {
            Swal.fire('Error', 'An error occurred while fetching data.', 'error');
        }
    }

    $('#profile-image').on('click', function() {
        $('#profile-image-upload').click();
    });

    // 프로필 이미지 업로드 이벤트 핸들러 수정
    $('#profile-image-upload').on('change', function(event) {
        var file = event.target.files[0];

        // 파일 유형 및 크기 검증
        if (!file.type.startsWith('image/')) {
            Swal.fire('오류', '이미지 파일만 업로드 가능합니다.', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB 제한
            Swal.fire('오류', '이미지 파일 크기는 5MB 이하여야 합니다.', 'error');
            return;
        }

        // 로딩 스피너 표시
        Swal.fire({
            title: '업로드 중...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        var formData = new FormData();
        formData.append('profileImage', file);

        ajaxWithToken('/api/user/profile-image', {
            method: 'POST',
            processData: false,
            contentType: false,
            data: formData
        })
        .done(function(response) {
            Swal.close(); // 로딩 스피너 닫기
            Swal.fire('성공', '프로필 이미지가 업데이트되었습니다.', 'success');
            // 프로필 이미지 새로 고침
            $('#profile-image').attr('src', response.profileImageUrl + '?t=' + new Date().getTime());
        })
        .fail(function(error) {
            Swal.close(); // 로딩 스피너 닫기
            console.error('Error uploading profile image:', error);
            Swal.fire('오류', '프로필 이미지 업로드에 실패하였습니다.', 'error');
        });
    });


    $('#progress-slider').on('input', function() {
        var value = $(this).val();
        $('#progress-bar').css('width', value + '%').attr('aria-valuenow', value);
        $('#progress-bar').text(value + '%');
        $('#slider-value').text(value + '%');
    });

    // 결제 탭 클릭 시 결제 내역 표시
    $('a[href="#payment"]').on('click', function() {
        displayPaymentHistory();
    });

    $('#login-link').on('click', function() {
        window.location.href = '/login';
    });

    // 모달이 표시될 때마다 실행
    $('.modal').on('shown.bs.modal', function () {
        $(this).find('.btn-close').removeAttr('aria-hidden');
    });

    // 초기화 함수 호출
    checkAccessToken();
    displayPaymentHistory();
});