// 기존 모달 관련 코드
var compareModal = document.getElementById("comparison-modal");
var reviewModal = document.getElementById("review-modal");
var compareBtn = document.getElementById("compare-btn");
var reviewBtn = document.getElementById("review-btn");
var closeBtns = document.getElementsByClassName("close");

// 브랜치 콘텐츠 관련 요소 추가
var branchContent = document.getElementById("branchContent");
var branchToggleBtn = document.getElementById("branchToggleBtn");
var closeBranchBtn = branchContent.querySelector('.close-btn');

function openModal(modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeModal(modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
}

// 기존 모달 이벤트 리스너
compareBtn.onclick = function() {
    openModal(compareModal);
}

reviewBtn.onclick = function() {
    openModal(reviewModal);
}

for (var i = 0; i < closeBtns.length; i++) {
    closeBtns[i].onclick = function() {
        closeModal(compareModal);
        closeModal(reviewModal);
    }
}

window.onclick = function(event) {
    if (event.target == compareModal) {
        closeModal(compareModal);
    }
    if (event.target == reviewModal) {
        closeModal(reviewModal);
    }
    if (event.target == branchContent) {
        closeModal(branchContent);
    }
}

// 브랜치 콘텐츠 관련 이벤트 리스너 추가
branchToggleBtn.addEventListener('click', function() {
    openModal(branchContent);
});

closeBranchBtn.addEventListener('click', function() {
    closeModal(branchContent);
});