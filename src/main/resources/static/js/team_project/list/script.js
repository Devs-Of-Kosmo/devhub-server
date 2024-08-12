const MIN_WIDTH = 50;
const MAX_WIDTH = MIN_WIDTH * 2;
const STEP = (MAX_WIDTH - MIN_WIDTH) * 0.05;

let aniID = null;
const dock = document.querySelector(".dock");

const updateWidth = function (nextWidths) {
    window.cancelAnimationFrame(aniID);
    aniID = null;

    let isAllDone = true;
    let newWidth = 0;
    const items = document.querySelectorAll(".item");
    for (let i = 0; i < items.length; i++) {
        const currWidth = items[i].getBoundingClientRect().width;
        const goalWidth = nextWidths[i];
        if (goalWidth < currWidth) {
            newWidth = Math.max(currWidth - STEP, goalWidth);
            isAllDone = false;
        } else if (goalWidth > currWidth) {
            newWidth = Math.min(currWidth + STEP, goalWidth);
            isAllDone = false;
        } else {
            newWidth = goalWidth;
        }
        items[i].style.width = newWidth + "px";
    }

    if (!isAllDone) {
        aniID = window.requestAnimationFrame(() => {
            updateWidth(nextWidths);
        });
    }
};
document.querySelectorAll(".dock .item").forEach(item => {
    item.addEventListener("click", function (event) {
        event.preventDefault(); // 기본 동작 방지
        const folderName = item.getAttribute("data-folder");
        let url;

        switch (folderName) {
            case 'google':
                url = 'https://www.google.com';
                break;
            case 'git':
                url = 'https://github.com';
                break;
            case 'settings':
                url = '/settings'; // 설정 페이지 URL을 적절히 변경하세요
                break;
            case 'codepen':
                url = 'https://codepen.io';
                break;
            case 'postman':
                url = 'https://www.postman.com';
                break;
            default:
                console.error("Folder name not found.");
                return;
        }

        window.open(url, '_blank');
    });
});
dock.addEventListener("mousemove", function (e) {
    const dockTop = e.target.getBoundingClientRect().top;
    const y = e.clientY - dockTop;

    const nextWidths = [];
    const items = document.querySelectorAll(".item");
    for (const item of items) {
        const rect = item.getBoundingClientRect();
        const center = rect.top - dockTop + rect.height / 2;

        const dist = Math.abs(center - y);
        nextWidths.push(Math.max(MAX_WIDTH - dist / 4, MIN_WIDTH));
    }
    updateWidth(nextWidths);
});

dock.addEventListener("mouseleave", function () {
    const items = document.querySelectorAll(".item");
    const nextWidths = [];
    for (const item of items) {
        nextWidths.push(MIN_WIDTH);
    }
    updateWidth(nextWidths);
});

// 폴더 클릭 이벤트 처리
document.querySelectorAll(".dock .item").forEach(item => {
    item.addEventListener("click", function () {
        const folderName = item.getAttribute("data-folder");
        if (folderName) {
            const url = `/team_project_list/${folderName}`;
            window.location.href = url;
        } else {
            console.error("Folder name not found.");
        }
    });
});
