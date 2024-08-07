$(document).ready(function() {
    console.log("Script loaded");

    function checkAccessToken() {
        var accessToken = localStorage.getItem('accessToken');
        console.log('Access Token from Local Storage:', accessToken);

        if (!accessToken) {
            console.warn('No access token found, redirecting to login page.');
            window.location.href = '/login';
            return;
        }

        loadUserInfo();
        loadPersonalRepoCount();
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
                if (error.status === 401) {
                    console.error('Access token expired or invalid, redirecting to login page.');
                    window.location.href = '/login';
                } else {
                    console.error('Error fetching user info:', error);
                    window.location.href = '/login';
                }
            });
    }

    function loadPersonalRepoCount() {
        ajaxWithToken('/api/personal/repo/list')
            .done(function(data) {
                console.log('Personal Repos:', data);
                $('#personal-projects-count').text(data.length);
            })
            .fail(function(error) {
                console.error('Error fetching personal repos:', error);
                if (error.status === 401) {
                    console.error('Access token expired or invalid, redirecting to login page.');
                    window.location.href = '/login';
                } else {
                    console.error('Error fetching personal repos:', error);
                }
            });
    }

    function navigateToMyPage() {
        var accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            window.location.href = '/login';
            return;
        }

        $.ajax({
            url: '/mypage',
            method: 'GET',
            dataType: 'html',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            },
            success: function(html) {
                $('body').html(html);
                window.history.pushState({}, '', '/mypage');
            },
            error: function(err) {
                console.error('Error fetching mypage:', err);
                if (err.status === 401) {
                    console.error('Access token expired or invalid, redirecting to login page.');
                    window.location.href = '/login';
                } else {
                    Swal.fire('Error', 'Failed to fetch mypage.', 'error');
                }
            }
        });
    }

    window.navigateToMyPage = navigateToMyPage; // 전역 함수로 설정

    function redirectToLogin() {
        $('#my-projects-link, #project-link').each(function() {
            $(this).attr('href', '/login').on('click', function(event) {
                event.preventDefault();
                window.location.href = '/login';
            });
        });

        $("#login-button, #login-link").on('click', function() {
            window.location.href = "/login";
        });
    }

    checkAccessToken();

    $('#login-link').on('click', function() {
        navigateToMyPage();
    });
});