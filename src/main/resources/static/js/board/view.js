$(document).ready(function() {
        const pathSegments = window.location.pathname.split('/');
        const boardId = pathSegments[pathSegments.length - 1];
        const token = localStorage.getItem('accessToken'); // JWT 토큰을 로컬 스토리지에서 가져옴
        let userInfo = null;

        if (!token) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login';
            return;
        }

        // 사용자 정보를 먼저 가져온 후 게시글 정보를 가져옴
        $.ajax({
            url: '/api/user/info',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function(data) {
                userInfo = data;
                console.log('User Info:', userInfo);
                fetchBoardData();
            },
            error: function(xhr, status, error) {
                console.error('Error fetching user info:', error);
                if (xhr.status === 401) {
                    alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                    window.location.href = '/login';
                }
            }
        });

        // 게시글 정보를 가져오는 함수
        function fetchBoardData() {
            if (boardId) {
                $.ajax({
                    url: `/api/boards/${boardId}`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    success: function(data) {
                        console.log('Board Details:', data);
                        $('#boardTitle').text(data.title);
                        $('#boardWriter').text(extractUserName(data.writer)); // 이름만 사용
                        $('#boardContent').html(data.content);

                        if (data.imagePath) {
                            const imagePath = data.imagePath.startsWith('http') ? data.imagePath : `${window.location.origin}${data.imagePath}`;
                            $('#boardImage').attr('src', imagePath).show();
                        }

                        // 사용자 이름이 작성자와 같으면 버튼 표시
                        if (userInfo && userInfo.name === extractUserName(data.writer)) {
                            $('#deleteButton').show();
                            $('#editButton').show().attr('href', `/boards/edit/${boardId}`);
                        }

                        $('#deleteButton').click(function() {
                            if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
                                $.ajax({
                                    url: `/api/boards/${boardId}`,
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': `Bearer ${token}`
                                    },
                                    success: function() {
                                        alert('게시글이 삭제되었습니다.');
                                        window.location.href = '/boards';
                                    },
                                    error: function(xhr, status, error) {
                                        console.error('Error:', error);
                                        alert('게시글 삭제에 실패했습니다.');
                                    }
                                });
                            }
                        });
                    },
                    error: function(xhr, status, error) {
                        console.error('Error:', error);
                        alert('게시글을 불러오는데 실패했습니다.');
                    }
                });
            } else {
                alert('유효하지 않은 게시글 ID입니다.');
                window.location.href = '/boards';
            }
        }
    });

    function extractUserName(writerString) {
        const nameMatch = writerString.match(/name=([^,]+)/);
        return nameMatch ? nameMatch[1] : '알 수 없음';
    }