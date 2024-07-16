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
                userEmail = response.email; // 이메일 저장
                $('#login-link').text(userName + '님');
            },
            error: function(error) {
                console.error('사용자 정보를 가져오는데 실패했습니다:', error);
            }
        });
    }

    document.querySelector('#inviteForm').addEventListener('submit', function(event) {
        event.preventDefault();

        if (!userEmail) {
            alert('사용자 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        const receiverEmail = document.querySelector('#receiverEmail').value;
        const messageContent = document.querySelector('#messageContent').value;

        fetch('/api/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            },
            body: JSON.stringify({
                senderEmail: userEmail,
                receiverEmail: receiverEmail,
                content: messageContent
            })
        })
            .then(response => response.json())
            .then(data => {
                alert('메시지가 성공적으로 전송되었습니다!');
                var modal = bootstrap.Modal.getInstance(document.getElementById('inviteModal'));
                modal.hide();
            })
            .catch(error => console.error('Error:', error));
    });

    function loadMessages() {
        if (!userEmail) {
            alert('사용자 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        fetch(`/api/messages/inbox/${userEmail}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data); // 응답 데이터 로그 출력

                if (!Array.isArray(data)) {
                    throw new Error("Invalid response format");
                }
                const messageList = document.getElementById('messageList');
                messageList.innerHTML = '';

                data.forEach(message => {
                    const listItem = document.createElement('li');
                    listItem.className = 'list-group-item';
                    listItem.textContent = `보낸 사람: ${message.senderEmail}, 내용: ${message.content}, 보낸 시간: ${new Date(message.timestamp).toLocaleString()}`;
                    messageList.appendChild(listItem);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                alert('메시지를 불러오는데 실패했습니다. 다시 시도해주세요.');
            });
    }

    $('#messageModal').on('show.bs.modal', loadMessages);
});
