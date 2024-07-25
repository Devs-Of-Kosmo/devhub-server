document.addEventListener("DOMContentLoaded", function() {
    var body = document.body;
    var menuTrigger = body.querySelector('.menu-trigger');

    if (menuTrigger) {
        menuTrigger.addEventListener('click', function() {
            body.classList.toggle('menu-active');
        });
    }
});