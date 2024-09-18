document.addEventListener('DOMContentLoaded', function() {
    // 모달 및 버튼 요소 가져오기
    var modals = {
        branchModal: document.getElementById("branchModal"),
        commitModal: document.getElementById("commitModal"),
        prModal: document.getElementById("prModal"),
        mergeModal: document.getElementById("mergeModal"),
        messageModal: document.getElementById("messageModal"),
        helpModal: document.getElementById("helpModal"),
        logoutModal: document.getElementById("logoutModal"),
        searchModal: document.getElementById("searchModal"),
        messageDetailModal: document.getElementById("messageDetailModal")
    };

    var buttons = {
        branchButton: document.getElementById("branchButton"),
        commitButton: document.getElementById("commitButton"),
        prButton: document.getElementById("prButton"),
        mergeButton: document.getElementById("mergeButton"),
        messageButton: document.querySelector('.sidebar-icon[title="Messages"]'),
        helpButton: document.querySelector('.menu a:last-child'),
        chatgptButton: document.getElementById("chatgptButton"),
        userProfileButton: document.getElementById("userProfileButton"),
        searchButton: document.getElementById("searchButton"),
        homeButton: document.querySelector('.sidebar-icon[title="Home"]')
    };

    // 메시지 관련 요소
    const receivedMessageList = document.getElementById('receivedMessageList');
    const sentMessageList = document.getElementById('sentMessageList');
    const newMessageForm = document.getElementById('newMessageForm');
    const messageTabs = document.querySelectorAll('.message-tab');
    const messageContents = document.querySelectorAll('.message-content');
    const notification = document.getElementById('messageNotification');

    // 검색 관련 요소들
    var searchInput = document.getElementById("searchInput");
    var searchSubmit = document.getElementById("searchSubmit");
    var searchResults = document.getElementById("searchResults");

    // 비교 프로젝트 구조 토글 기능
    var toggleComparisonStructure = document.getElementById('toggleComparisonStructure');
    var comparisonStructure = document.getElementById('comparisonStructure');

    if (toggleComparisonStructure && comparisonStructure) {
        toggleComparisonStructure.onclick = function() {
            if (comparisonStructure.style.display === 'none') {
                comparisonStructure.style.display = 'block';
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                comparisonStructure.style.display = 'none';
                this.innerHTML = '<i class="fas fa-eye"></i>';
            }
        };
    }

    if (buttons.homeButton) {
        buttons.homeButton.addEventListener('click', function() {
            window.location.href = '/';
        });
    }

    // 메시지 모달 닫기 버튼 기능
    const messageModal = document.getElementById('messageModal');
    const messageModalCloseBtn = messageModal.querySelector('.close');

    if (messageModalCloseBtn) {
        messageModalCloseBtn.addEventListener('click', function() {
            messageModal.style.display = "none";
            // 모달 내용 초기화
            document.getElementById('receivedMessageList').innerHTML = '';
            document.getElementById('sentMessageList').innerHTML = '';
            document.getElementById('newMessageForm').reset();
            // 탭 초기화
            document.querySelector('.message-tab.active').classList.remove('active');
            document.querySelector('.message-tab[data-tab="received"]').classList.add('active');
            document.querySelector('.message-content.active').classList.remove('active');
            document.getElementById('received').classList.add('active');
        });
    }

    // 모달 닫기 버튼 기능
    var spans = document.getElementsByClassName("close");
    for (let i = 0; i < spans.length; i++) {
        spans[i].onclick = function() {
            var modal = this.closest('.modal');
            if (modal) {
                modal.style.display = "none";
                document.body.style.overflow = 'auto'; // 스크롤 다시 활성화
            }
        };
    }

    // 모달 열기 버튼 기능
    for (let key in buttons) {
        if (buttons[key] && modals[key.replace("Button", "Modal")]) {
            buttons[key].onclick = function() {
                modals[key.replace("Button", "Modal")].style.display = "block";
                document.body.style.overflow = 'hidden'; // 스크롤 비활성화
                if (key === 'messageButton') {
                    loadMessages('received');
                }
            };
        }
    }

    // 메시지 탭 기능
    messageTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            messageTabs.forEach(t => t.classList.remove('active'));
            messageContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            var content = document.getElementById(tab.dataset.tab);
            if (content) content.classList.add('active');
            if (tab.dataset.tab === 'received' || tab.dataset.tab === 'sent') {
                loadMessages(tab.dataset.tab);
            }
        });
    });

    if (newMessageForm) {
        newMessageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendMessage();
        });
    }

    // ChatGPT 버튼 클릭 시 웹사이트 열기
    if (buttons.chatgptButton) {
        buttons.chatgptButton.addEventListener('click', () => {
            window.open('https://chat.openai.com/', '_blank');
        });
    }

    // 유저 프로필 버튼 클릭 시 로그아웃 모달 열기
    if (buttons.userProfileButton && modals.logoutModal) {
        buttons.userProfileButton.onclick = function() {
            modals.logoutModal.style.display = "block";
        };
    }

    // 검색 기능
    if (searchSubmit) {
        searchSubmit.onclick = function() {
            var query = searchInput.value.trim().toLowerCase();
            if (query === '') {
                Swal.fire('검색 오류', '검색어를 입력하세요.', 'error');
                return;
            }

            var codePanels = document.querySelectorAll('.code-panel pre code');
            var results = [];
            codePanels.forEach(function(panel, index) {
                var code = panel.textContent.toLowerCase();
                var lines = code.split('\n');
                var matchingLines = lines.filter(function(line) {
                    return line.includes(query);
                });

                if (matchingLines.length > 0) {
                    results.push({
                        panel: index + 1,
                        matches: matchingLines
                    });
                }
            });

            if (results.length > 0) {
                searchResults.innerHTML = '<h3>검색 결과:</h3>';
                results.forEach(function(result) {
                    searchResults.innerHTML += `<h4>코드 패널 ${result.panel}:</h4>`;
                    result.matches.forEach(function(match) {
                        searchResults.innerHTML += `<pre>${match}</pre>`;
                    });
                });
            } else {
                searchResults.innerHTML = '<p>일치하는 결과가 없습니다.</p>';
            }
        };
    }

    // 검색 모달 관련 추가 코드
    if (modals.searchModal) {
        var searchModalCloseBtn = modals.searchModal.querySelector('.close');
        if (searchModalCloseBtn) {
            searchModalCloseBtn.onclick = function() {
                modals.searchModal.style.display = "none";
                document.body.style.overflow = 'auto';
                // 검색 입력 필드와 결과 초기화
                if (searchInput) searchInput.value = "";
                if (searchResults) searchResults.innerHTML = "";
            };
        }
    }

    // 사용자 정보를 가져오는 함수
    function fetchUserInfo() {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.error('No access token found');
            return;
        }

        fetch('/api/user/info', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                // 로고 부분에 사용자 이름 표시
                const logoElement = document.querySelector('.logo');
                if (logoElement) {
                    logoElement.textContent = `${data.name}의 레포지토리`;
                }
            })
            .catch(error => {
                console.error('Error fetching user info:', error);
            });
    }

    fetchUserInfo();

    // 로그아웃 버튼 기능 추가
    var logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            // 로그아웃 API 호출
            fetch('/api/auth/logout', {
                method: 'GET',
                credentials: 'include', // 이 줄이 추가되어 쿠키도 전송됨
            })
                .then(response => {
                    if (response.ok) {
                        // 로그아웃 성공 시 홈페이지로 리다이렉트
                        Swal.fire('로그아웃 성공', '성공적으로 로그아웃 되었습니다.', 'success').then(() => {
                            window.location.href = '/';
                        });
                    } else {
                        throw new Error('Logout failed');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire('로그아웃 오류', '로그아웃 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
                });
        });
    }

    // 메시지 로드 함수
    function loadMessages(type) {
        const url = `/api/messages/${type}`;
        fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        })
            .then(response => response.json())
            .then(messages => {
                const list = type === 'received' ? receivedMessageList : sentMessageList;
                list.innerHTML = '';
                messages.forEach(message => {
                    const li = document.createElement('li');
                    li.textContent = `${message.senderEmail}: ${message.content.substring(0, 20)}...`;
                    li.onclick = () => showMessageDetail(message.id, type);
                    list.appendChild(li);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    // 메시지 상세 보기 함수
    function showMessageDetail(id, type) {
        const url = `/api/messages/${type}/read?id=${id}`;
        fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        })
            .then(response => response.json())
            .then(message => {
                const detailDiv = document.getElementById('messageDetail');
                detailDiv.innerHTML = `
                    <p><strong>보낸 사람:</strong> ${message.senderEmail}</p>
                    <p><strong>받는 사람:</strong> ${message.receiverEmail}</p>
                    <p><strong>내용:</strong> ${message.content}</p>
                    <p><strong>날짜:</strong> ${new Date(message.createdDate).toLocaleString()}</p>
                `;
                modals.messageDetailModal.style.display = "block";

                // 삭제 버튼 이벤트 리스너
                document.getElementById('deleteMessage').onclick = () => deleteMessage(id, type);
            })
            .catch(error => console.error('Error:', error));
    }

    // 메시지 전송 함수
    function sendMessage() {
        const receiverEmail = document.getElementById('receiverEmail').value;
        const content = document.getElementById('messageContent').value;

        fetch('/api/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({ receiverEmail, content })
        })
            .then(response => response.json())
            .then(data => {
                Swal.fire('메시지 전송 성공', '메시지가 성공적으로 전송되었습니다.', 'success');
                newMessageForm.reset();
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire('메시지 전송 오류', '메시지 전송 중 오류가 발생했습니다.', 'error');
            });
    }

    // 메시지 삭제 함수
    function deleteMessage(id, type) {
        const url = `/api/messages/delete?id=${id}&box=${type}`;
        fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        })
            .then(response => response.json())
            .then(data => {
                Swal.fire('메시지 삭제 성공', '메시지가 성공적으로 삭제되었습니다.', 'success');
                modals.messageDetailModal.style.display = "none";
                loadMessages(type);
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire('메시지 삭제 오류', '메시지 삭제 중 오류가 발생했습니다.', 'error');
            });
    }

    // 새 메시지 확인 함수
    function checkNewMessages() {
        fetch('/api/messages/received', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        })
            .then(response => response.json())
            .then(messages => {
                const unreadMessages = messages.filter(message => !message.readCondition);
                if (unreadMessages.length > 0) {
                    notification.style.display = 'block';
                    notification.textContent = `새로운 메시지 ${unreadMessages.length}개가 있습니다.`;
                    setTimeout(() => {
                        notification.style.display = 'none';
                    }, 5000);
                }
            })
            .catch(error => console.error('Error checking new messages:', error));
    }

    // 주기적으로 새 메시지 확인
    setInterval(checkNewMessages, 30000); // 30초마다 확인

    // 초기 로드
    checkNewMessages();
});
