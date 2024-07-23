$(document).ready(function() {
    var accessToken = localStorage.getItem('accessToken');
    var userEmail = null;

    if (accessToken) {
        $.ajax({
            type: 'GET',
            url: '/api/user/info',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: function(response) {
                var userName = response.name;
                userEmail = response.email;
                $('#login-link').text(userName + '님');

                $('#login-link').on('click', function() {
                    $('#profileName').val(userName);
                    $('#profileEmail').val(userEmail);
                    $('#profileModal').modal('show');
                });
            },
            error: function(error) {
                console.error('사용자 정보를 가져오는데 실패했습니다:', error);
            }
        });
    }
});
