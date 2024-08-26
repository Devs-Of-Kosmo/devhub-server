document.addEventListener('DOMContentLoaded', () => {
    const updateTime = () => {
        const now = new Date();
        const months = now.getMonth() + 1; // 현재 월 (0부터 시작하므로 1을 더해줌)
        const days = now.getDate(); // 현재 일
        const hours = now.getHours(); // 현재 시간
        const minutes = now.getMinutes(); // 현재 분
        const seconds = now.getSeconds(); // 현재 초

        const monthsElement = document.querySelector('.countdown .months');
        const daysElement = document.querySelector('.countdown .days');
        const hoursElement = document.querySelector('.countdown .hours');
        const minutesElement = document.querySelector('.countdown .minutes');
        const secondsElement = document.querySelector('.countdown .seconds');

        if (monthsElement) monthsElement.innerText = months;
        if (daysElement) daysElement.innerText = days;
        if (hoursElement) hoursElement.innerText = hours;
        if (minutesElement) minutesElement.innerText = minutes;
        if (secondsElement) secondsElement.innerText = seconds;
    };

    setInterval(updateTime, 1000);
    updateTime();
});
