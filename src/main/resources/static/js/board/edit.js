function previewImage(event) {
    var reader = new FileReader();
    reader.onload = function(){
        var output = document.getElementById('edit-preview');
        output.src = reader.result;
        output.style.display = 'block';
    };
    reader.readAsDataURL(event.target.files[0]);
}

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

    // 인증된 사용자 정보 가져오기
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
                    console.log('Current User:', userInfo);

                    const writerIdMatch = data.writer.match(/id=(\d+)/);
                    const writerId = writerIdMatch ? parseInt(writerIdMatch[1]) : null;
                    const writerNameMatch = data.writer.match(/name=([^,]+)/);
                    const writerName = writerNameMatch ? writerNameMatch[1] : '알 수 없음';

                    if (userInfo && writerId === userInfo.userId) {
                        $('#editBoard-id').val(data.id);
                        $('#edit-title').val(data.title);
                        $('#edit-writer').val(writerName);

                        if (data.imagePath) {
                            const imagePath = data.imagePath.startsWith('http') ? data.imagePath : `${window.location.origin}${data.imagePath}`;
                            $('#edit-preview').attr('src', imagePath).show();
                        }

                        ClassicEditor
                            .create(document.querySelector('#edit-content'), {
                                language: 'ko'
                            })
                            .then(editor => {
                                window.editor = editor;
                                editor.setData(data.content);
                            })
                            .catch(error => {
                                console.error(error);
                                Swal.fire({
                                    icon: 'error',
                                    title: '에디터 로드 실패',
                                    text: '에디터를 불러오는 데 실패했습니다.'
                                });
                            });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: '권한 없음',
                            text: '수정 권한이 없습니다.',
                            confirmButtonText: '게시글 목록으로 이동'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.href = '/boards';
                            }
                        });
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: '로딩 실패',
                        text: '게시글을 불러오는데 실패했습니다.'
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

    $('#editBoard-form').on('submit', function(event) {
        event.preventDefault();
        syncEditorData();
        submitForm();
    });
});

function syncEditorData() {
    const editorData = window.editor.getData();
    $('#edit-content').val(editorData);
}

function submitForm() {
    syncEditorData();
    const formData = new FormData($('#editBoard-form')[0]);
    const id = $('#editBoard-id').val();
    const token = localStorage.getItem('accessToken');

    $.ajax({
        url: `/api/boards/${id}`,
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
            Swal.fire({
                icon: 'success',
                title: '수정 완료',
                text: '게시글이 성공적으로 수정되었습니다.',
                confirmButtonText: '게시글 목록으로 이동'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/boards';
                }
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
            console.log('Response Text:', jqXHR.responseText);
            if (jqXHR.status === 401) {
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
            } else {
                Swal.fire({
                    icon: 'error',
                    title: '수정 실패',
                    text: '게시글 수정에 실패했습니다.'
                });
            }
        }
    });
}