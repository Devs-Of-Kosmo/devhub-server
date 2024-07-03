document.addEventListener('DOMContentLoaded', () => {
    const updateTime = () => {
        const now = new Date();
        const days = now.getDate(); // 현재 일
        const hours = now.getHours(); // 현재 시간
        const minutes = now.getMinutes(); // 현재 분
        const seconds = now.getSeconds(); // 현재 초

        document.querySelector('.countdown .days').innerText = days;
        document.querySelector('.countdown .hours').innerText = hours;
        document.querySelector('.countdown .minutes').innerText = minutes;
        document.querySelector('.countdown .seconds').innerText = seconds;
    };

    setInterval(updateTime, 1000);
    updateTime();
});
