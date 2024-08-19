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
        const token = localStorage.getItem('accessToken'); // JWT 토큰을 로컬 스토리지에서 가져옴
        let userInfo = null;

        if (!token) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login';
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
                    alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                    window.location.href = '/login';
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

                        // writer 정보를 파싱하여 비교(정규식 표현을 위한 문자열 파싱)
                        const writerIdMatch = data.writer.match(/id=(\d+)/);
                        const writerId = writerIdMatch ? parseInt(writerIdMatch[1]) : null;
                        const writerNameMatch = data.writer.match(/name=([^,]+)/);
                        const writerName = writerNameMatch ? writerNameMatch[1] : '알 수 없음';

                        if (userInfo && writerId === userInfo.userId) {
                            $('#editBoard-id').val(data.id);
                            $('#edit-title').val(data.title);
                            $('#edit-writer').val(writerName); // 작성자 이름만 사용

                            if (data.imagePath) {
                                const imagePath = data.imagePath.startsWith('http') ? data.imagePath : `${window.location.origin}${data.imagePath}`;
                                $('#edit-preview').attr('src', imagePath).show();
                            }

                            // 에디터 데이터 설정
                            ClassicEditor
                                .create(document.querySelector('#edit-content'), {
                                    language: 'ko'
                                })
                                .then(editor => {
                                    window.editor = editor;
                                    editor.setData(data.content); // 에디터에 콘텐츠 설정
                                })
                                .catch(error => {
                                    console.error(error);
                                });
                        } else {
                            alert('수정 권한이 없습니다.');
                            window.location.href = '/boards';
                        }
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
        syncEditorData(); // 에디터 데이터 동기화
        const formData = new FormData($('#editBoard-form')[0]);
        const id = $('#editBoard-id').val();
        const token = localStorage.getItem('accessToken'); // JWT 토큰을 로컬 스토리지에서 가져옴

        $.ajax({
            url: `/api/boards/${id}`,
            method: 'PUT',
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
                console.log('Response Text:', jqXHR.responseText);
                if (jqXHR.status === 401) {
                    alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                    window.location.href = '/login';
                } else {
                    alert('게시글 수정에 실패했습니다.');
                }
            }
        });
    }