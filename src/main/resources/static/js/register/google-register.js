document.addEventListener("DOMContentLoaded", function() {
    const hideEmailElement = document.getElementById('emailElement');
    const hideNameElement = document.getElementById('nameElement');
    const email = hideEmailElement ? hideEmailElement.getAttribute('data-email') : null;
    const name = hideNameElement ? hideNameElement.getAttribute('data-name') : null;

    if (email != null && name != null) {
        let nameElement = document.getElementById('name');
        let emailElement = document.getElementById('email');
        let emailVerifyBtnElement = document.getElementById('emailVerifyBtn');

        nameElement.value = name;
        emailElement.value = email;
        emailElement.style.backgroundColor = "#919191";
        emailElement.readOnly = true;

        // 이미 인증된 이메일이라면 인증 필드를 숨기고 인증 완료 메시지를 표시
        verificationCodeSection.style.display = 'none';
        emailVerifiedMessage.style.display = 'block';
    }
});
