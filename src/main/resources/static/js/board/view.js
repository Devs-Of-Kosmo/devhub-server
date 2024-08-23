$(document).ready(function() {
    const pathSegments = window.location.pathname.split('/');
    const boardId = pathSegments[pathSegments.length - 1];
    const token = localStorage.getItem('accessToken');
    let userInfo = null;

    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: '로그인 필요',
            text: '로그인이 필요한 서비스입니다.',
            confirmButtonText: '로그인 페이지로 이동'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/login';
            }
        });
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
                Swal.fire({
                    icon: 'error',
                    title: '인증 오류',
                    text: '인증이 만료되었습니다. 다시 로그인해주세요.',
                    confirmButtonText: '로그인 페이지로 이동'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/login';
                    }
                });
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
                    $('#boardWriter').text(extractUserName(data.writer));
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
                        Swal.fire({
                            title: '게시글 삭제',
                            text: "정말로 이 게시글을 삭제하시겠습니까?",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: '삭제',
                            cancelButtonText: '취소'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                $.ajax({
                                    url: `/api/boards/${boardId}`,
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': `Bearer ${token}`
                                    },
                                    success: function() {
                                        Swal.fire({
                                            icon: 'success',
                                            title: '삭제 완료',
                                            text: '게시글이 성공적으로 삭제되었습니다.',
                                            confirmButtonText: '확인'
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                window.location.href = '/boards';
                                            }
                                        });
                                    },
                                    error: function(xhr, status, error) {
                                        console.error('Error:', error);
                                        Swal.fire({
                                            icon: 'error',
                                            title: '삭제 실패',
                                            text: '게시글 삭제에 실패했습니다.',
                                            confirmButtonText: '확인'
                                        });
                                    }
                                });
                            }
                        });
                    });
                },
                error: function(xhr, status, error) {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: '로딩 실패',
                        text: '게시글을 불러오는데 실패했습니다.',
                        confirmButtonText: '확인'
                    });
                }
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: '유효하지 않은 게시글',
                text: '유효하지 않은 게시글 ID입니다.',
                confirmButtonText: '게시글 목록으로 이동'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/boards';
                }
            });
        }
    }
});

function extractUserName(writerString) {
    const nameMatch = writerString.match(/name=([^,]+)/);
    return nameMatch ? nameMatch[1] : '알 수 없음';
}