// main.js

document.addEventListener("DOMContentLoaded", function () {
    const accessToken = localStorage.getItem('accessToken');
    const projectName = sessionStorage.getItem('projectName');
    const projectId = sessionStorage.getItem('projectId');
    const description = sessionStorage.getItem('description');

    const projectNameElement = document.getElementById('project-name');
    const projectDescriptionElement = document.getElementById('project-description');

    if (projectNameElement) {
        projectNameElement.textContent = projectName || 'Project Name';
    }

    if (projectDescriptionElement) {
        projectDescriptionElement.textContent = description || 'Project Description';
    }

    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const branchToggleBtn = document.getElementById('branchToggleBtn');
    const sideContentModal = document.getElementById('sideContentModal');
    const branchContent = document.getElementById('branchContent');
    const closeModalBtn = document.querySelector('.close-btn');
    const closeBranchBtn = document.createElement('span');
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const closeHelpBtn = document.querySelector('.close-help-btn');

    closeBranchBtn.className = 'close-btn';
    closeBranchBtn.innerHTML = '&times;';
    branchContent.appendChild(closeBranchBtn);

    toggleSidebarBtn.addEventListener('click', function (event) {
        event.preventDefault();
        sideContentModal.style.display = "block";
        branchContent.style.display = "none";
    });

    closeModalBtn.addEventListener('click', function () {
        sideContentModal.style.display = "none";
        branchContent.style.display = "none";
        clearCheckIconAndMessage();
        clearCommitSuccessMessage();
    });

    closeBranchBtn.addEventListener('click', function () {
        branchContent.style.display = "none";
    });

    helpBtn.addEventListener('click', function (event) {
        event.preventDefault();
        helpModal.style.display = "block";
    });

    closeHelpBtn.addEventListener('click', function () {
        helpModal.style.display = "none";
    });

    window.addEventListener('click', function (event) {
        if (event.target == sideContentModal || event.target == branchContent || event.target == helpModal) {
            sideContentModal.style.display = "none";
            branchContent.style.display = "none";
            helpModal.style.display = "none";
            clearCheckIconAndMessage();
        }
    });

    branchToggleBtn.addEventListener('click', async function (event) {
        event.preventDefault();
        branchContent.style.display = "block";
        sideContentModal.style.display = "none";

        await fetchProjectMetadata(projectName);
        branchContent.style.zIndex = "1001";
    });

});
