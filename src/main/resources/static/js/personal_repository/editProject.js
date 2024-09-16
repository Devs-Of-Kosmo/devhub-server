// editProject.js

document.addEventListener("DOMContentLoaded", function () {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.querySelector('.close-settings-btn');

    const editProjectBtn = document.getElementById('editProjectBtn');
    const editProjectModal = document.getElementById('editProjectModal');
    const closeEditModalBtn = document.querySelector('.close-edit-modal-btn');
    const saveChangesBtn = document.getElementById('saveChangesBtn');

    const changedProjectNameInput = document.getElementById('changedProjectName');
    const changedDescriptionInput = document.getElementById('changedDescription');

    const projectNameElement = document.getElementById('project-name');
    const projectDescriptionElement = document.getElementById('project-description');

    const accessToken = localStorage.getItem('accessToken');
    const projectName = sessionStorage.getItem('projectName');
    const projectId = sessionStorage.getItem('projectId');
    const description = sessionStorage.getItem('description');

    if (projectNameElement) {
        projectNameElement.textContent = projectName || 'Project Name';
    }

    if (projectDescriptionElement) {
        projectDescriptionElement.textContent = description || 'Project Description';
    }

    settingsBtn.addEventListener('click', function (event) {
        event.preventDefault();
        settingsModal.style.display = "block";
    });

    closeSettingsBtn.addEventListener('click', function () {
        settingsModal.style.display = "none";
    });

    window.addEventListener('click', function (event) {
        if (event.target == settingsModal) {
            settingsModal.style.display = "none";
        }
    });

    editProjectBtn.addEventListener('click', function (event) {
        event.preventDefault();
        editProjectModal.style.display = "block";
        changedProjectNameInput.value = projectName || '';
        changedDescriptionInput.value = description || '';
        settingsModal.style.display = "none";
    });

    closeEditModalBtn.addEventListener('click', function () {
        editProjectModal.style.display = "none";
        clearCommitSuccessMessage();
        clearCommitMessage();
    });

    window.addEventListener('click', function (event) {
        if (event.target == editProjectModal) {
            editProjectModal.style.display = "none";
            clearCommitSuccessMessage();
            clearCommitMessage();
        }
    });

    saveChangesBtn.addEventListener('click', async function () {
        const changedProjectName = changedProjectNameInput.value.trim();
        const changedDescription = changedDescriptionInput.value.trim();

        if (!changedProjectName || !changedDescription) {
            Swal.fire({
                title: '입력 부족',
                text: '프로젝트 이름과 설명을 모두 입력하세요.',
                icon: 'warning',
                confirmButtonText: '확인'
            });
            return;
        }

        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`http://localhost:8080/api/personal/repo?ts=${timestamp}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                body: JSON.stringify({
                    projectId: projectId,
                    changedProjectName: changedProjectName,
                    changedDescription: changedDescription
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update project');
            }

            const responseData = await response.json();
            console.log('프로젝트 업데이트 성공:', responseData);

            sessionStorage.setItem('projectName', responseData.projectNameAfterChange);
            sessionStorage.setItem('description', responseData.descriptionAfterChange);

            projectNameElement.textContent = responseData.projectNameAfterChange;
            projectDescriptionElement.textContent = responseData.descriptionAfterChange;

            Swal.fire({
                title: '업데이트 완료!',
                text: '프로젝트 정보가 성공적으로 업데이트되었습니다.',
                icon: 'success',
                confirmButtonText: '확인'
            }).then(() => {
                editProjectModal.style.display = "none";
            });
        } catch (error) {
            console.error('Error updating project:', error);
            Swal.fire({
                title: '업데이트 실패',
                text: '프로젝트 정보 업데이트에 실패했습니다.',
                icon: 'error',
                confirmButtonText: '확인'
            });
        }
    });

    async function deleteRepository(projectId) {
        const accessToken = localStorage.getItem('accessToken');
        const confirmDelete = await Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: `이 작업은 되돌릴 수 없습니다. 프로젝트를 삭제하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '네, 삭제합니다',
            cancelButtonText: '아니요, 취소합니다'
        });

        if (confirmDelete.isConfirmed) {
            try {
                const timestamp = new Date().getTime();
                const response = await fetch(`http://localhost:8080/api/personal/repo/${projectId}?ts=${timestamp}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });

                if (response.status === 204) {
                    Swal.fire({
                        title: '삭제 완료!',
                        text: '프로젝트가 성공적으로 삭제되었습니다.',
                        icon: 'success',
                        confirmButtonText: '확인'
                    }).then(() => {
                        window.location.href = 'http://localhost:8080/project_list';
                    });
                } else {
                    const errorText = await response.text();
                    console.error('Failed to delete repository:', errorText);
                    Swal.fire({
                        title: '삭제 실패',
                        text: '프로젝트 삭제에 실패했습니다.',
                        icon: 'error',
                        confirmButtonText: '확인'
                    });
                }
            } catch (error) {
                console.error('Error deleting repository:', error);
                Swal.fire({
                    title: '오류 발생',
                    text: '프로젝트 삭제 중 오류가 발생했습니다.',
                    icon: 'error',
                    confirmButtonText: '확인'
                });
            }
        }
    }

    document.querySelector('.delete-repo-btn').addEventListener('click', function () {
        const projectId = sessionStorage.getItem('projectId');
        if (projectId) {
            deleteRepository(projectId);
        } else {
            Swal.fire({
                title: '오류',
                text: '프로젝트 ID를 찾을 수 없습니다.',
                icon: 'error',
                confirmButtonText: '확인'
            });
        }
    });
});
