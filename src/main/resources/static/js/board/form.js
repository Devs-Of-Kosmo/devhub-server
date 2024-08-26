function previewImage(event) {
    var reader = new FileReader();
    reader.onload = function(){
        var output = document.getElementById('preview');
        output.src = reader.result;
        output.style.display = 'block';
    };
    reader.readAsDataURL(event.target.files[0]);
}

$(document).ready(function() {
    ClassicEditor
        .create(document.querySelector('#content'), {
            language: 'ko'
        })
        .then(editor => {
            window.editor = editor;
            fetchUserInfo(); // 유저 정보 조회
        })
        .catch(error => {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: '에디터 로드 실패',
                text: '에디터를 불러오는 데 실패했습니다.',
            });
        });

    $('#boardRequest-form').on('submit', function(event) {
        event.preventDefault();
        syncEditorData();
        submitForm();
    });
});

function fetchUserInfo() {
    const token = localStorage.getItem('accessToken');

    $.ajax({
        url: '/api/user/info',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function(data) {
            console.log('User Info:', data);

            if (data.name) {
                $('#writer').val(data.name);
            } else {
                console.error('Username is missing in the response');
                Swal.fire({
                    icon: 'warning',
                    title: '사용자 정보 누락',
                    text: '사용자 이름 정보가 누락되었습니다.',
                });
            }
            initializeForm();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
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
            }
        }
    });
}

function syncEditorData() {
    const editorData = window.editor.getData();
    $('#content').val(editorData);
}

function initializeForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        $('#form-title').text('게시글 수정');
        fetchWithAuth(`/api/boards/${id}`)
            .done(data => {
                console.log('Board Info:', data);
                $('#boardRequest-id').val(data.id);
                $('#title').val(data.title);
                $('#content').val(data.content);
                $('#writer').val(data.writer.name);

                if (data.imagePath) {
                    $('#preview').attr('src', `/images/${data.imagePath}`).show();
                }
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.error('Error:', errorThrown);
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
                }
            });
    } else {
        $('#form-title').text('게시글 작성');
    }
}

function submitForm() {
    syncEditorData();
    const formData = new FormData($('#boardRequest-form')[0]);
    const id = $('#boardRequest-id').val();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/boards/${id}` : '/api/boards';
    const token = localStorage.getItem('accessToken');

    $.ajax({
        url: url,
        method: method,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
            Swal.fire({
                icon: 'success',
                title: '성공',
                text: id ? '게시글이 성공적으로 수정되었습니다.' : '게시글이 성공적으로 작성되었습니다.',
                confirmButtonText: '게시글 목록으로 이동'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/boards';
                }
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
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
                    title: '오류',
                    text: '게시글 저장 중 오류가 발생했습니다.',
                });
            }
        }
    });
}

function fetchWithAuth(url) {
    const token = localStorage.getItem('accessToken');
    return $.ajax({
        url: url,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}