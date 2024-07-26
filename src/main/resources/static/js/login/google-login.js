document.addEventListener("DOMContentLoaded", function() {
    const accessTokenElement = document.getElementById('accessTokenElement');
    const accessToken = accessTokenElement ? accessTokenElement.getAttribute('data-access-token') : null;

    if (accessToken != null) {
        localStorage.setItem('accessToken', accessToken);
        location.href = '/';
    }
});