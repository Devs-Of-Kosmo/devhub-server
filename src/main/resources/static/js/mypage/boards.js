// 사용자 정보를 가져오는 함수
function fetchUserInfo() {
    return new Promise((resolve, reject) => {
        window.ajaxWithToken('/api/user/info')
            .done(function(userInfo) {
                console.log('User info fetched:', userInfo);
                resolve(userInfo);
            })
            .fail(function(error) {
                console.error('Error fetching user info:', error);
                reject(error);
            });
    });
}

// 게시글 목록을 가져오고 UI를 업데이트하는 함수
function fetchAndUpdateBoardPosts() {
    if (typeof window.ajaxWithToken !== 'function') {
        console.error('ajaxWithToken is not defined');
        return;
    }

    fetchUserInfo()
        .then(userInfo => {
            if (!userInfo || !userInfo.userId) {
                throw new Error('Invalid user information');
            }
            console.log('Fetching board posts for user ID:', userInfo.userId);
            return window.ajaxWithToken(`/api/boards/myboards/${userInfo.userId}`);
        })
        .then(posts => {
            console.log('Received posts:', posts);
            // 게시글 수 업데이트
            const postsCount = posts.length;
            $('#posts-count').text(postsCount);

            // 게시판 기록 탭 내용 업데이트
            const securityTab = $('#security');
            let boardContent = '<h5>내 게시글 목록</h5><ul class="list-group">';

            posts.forEach(post => {
                const createdAt = new Date(post.createdAt).toLocaleString(); // 작성 시간 포맷팅
                boardContent += `
                    <li class="list-group-item">
                        <h6>제목 : ${post.title}</h6>
                        <p>내용 : ${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</p>
                    </li>
                `;
            });

            boardContent += '</ul>';
            securityTab.html(boardContent);
        })
        .catch(error => {
            console.error('Error in fetchAndUpdateBoardPosts:', error);
            $('#posts-count').text('0');
            $('#security').html('<p>게시글을 불러오는 중 오류가 발생했습니다.</p>');
        });
}

// 페이지 로드 시 함수 실행
$(document).ready(function() {
    console.log('boards.js ready');
    // script.js가 먼저 로드되고 ajaxWithToken이 정의된 후에 실행되도록 지연
    setTimeout(fetchAndUpdateBoardPosts, 500);  // 지연 시간을 500ms로 유지

    // 게시판 기록 탭 클릭 시 데이터 새로고침
    $('a[href="#security"]').on('click', fetchAndUpdateBoardPosts);
});