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

        emailVerifyBtnElement.style.display = 'none';
    }
});