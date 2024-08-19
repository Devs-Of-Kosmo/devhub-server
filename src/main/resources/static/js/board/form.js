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
            });

        $('#boardRequest-form').on('submit', function(event) {
            event.preventDefault();
            syncEditorData();
            submitForm();
        });
    });

    function fetchUserInfo() {
        const token = localStorage.getItem('accessToken'); // JWT 토큰을 로컬 스토리지에서 가져옴

        $.ajax({
            url: '/api/user/info',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function(data) {
                console.log('User Info:', data);

                // 유저 정보를 기반으로 작성자 필드 자동 채움 및 읽기 전용 설정
                if (data.name) {
                    $('#writer').val(data.name);
                } else {
                    console.error('Username is missing in the response');
                }
                initializeForm();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error:', errorThrown);
                if (jqXHR.status === 401) {
                    alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                    window.location.href = '/login';
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
                    console.log('Board Info:', data); // 응답 데이터 콘솔 출력
                    $('#boardRequest-id').val(data.id);
                    $('#title').val(data.title);
                    $('#content').val(data.content);
                    $('#writer').val(data.writer.name); // 작성자 이름만 사용

                    if (data.imagePath) {
                        $('#preview').attr('src', `/images/${data.imagePath}`).show();
                    }
                })
                .fail((jqXHR, textStatus, errorThrown) => {
                    console.error('Error:', errorThrown);
                    if (jqXHR.status === 401) {
                        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                        window.location.href = '/login';
                    }
                });
        } else {
            $('#form-title').text('게시글 작성');
        }
    }

    function submitForm() {
        syncEditorData(); // 에디터 데이터 동기화
        const formData = new FormData($('#boardRequest-form')[0]);
        const id = $('#boardRequest-id').val();
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/boards/${id}` : '/api/boards';
        const token = localStorage.getItem('accessToken'); // JWT 토큰을 로컬 스토리지에서 가져옴

        $.ajax({
            url: url,
            method: method,
            headers: {
                'Authorization': `Bearer ${token}` // 헤더에 JWT 토큰 추가
            },
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {
                window.location.href = '/boards';
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error:', errorThrown);
                if (jqXHR.status === 401) {
                    alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                    window.location.href = '/login';
                }
            }
        });
    }

    function fetchWithAuth(url) {
        const token = localStorage.getItem('accessToken'); // JWT 토큰을 로컬 스토리지에서 가져옴
        return $.ajax({
            url: url,
            headers: {
                'Authorization': `Bearer ${token}` // 헤더에 JWT 토큰 추가
            }
        });
    }