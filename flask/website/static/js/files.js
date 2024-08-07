document.addEventListener("DOMContentLoaded", function () {
    const file1 = document.getElementById('file1');
    const file2 = document.getElementById('file2');
    const compareBtn = document.getElementById('compare-btn');
    const commitBtn = document.getElementById('commit-button');
    const commitMessageInput = document.getElementById('commitMessage');
    const reviewBtn = document.getElementById('review-btn');

    // 로컬 스토리지에서 accessToken 가져오기
    const accessToken = localStorage.getItem('accessToken');

    if (commitBtn) {
        commitBtn.addEventListener('click', async function () {
            const files = file1.files;
            const commitMessage = commitMessageInput.value.trim();
            const personalProjects = JSON.parse(localStorage.getItem('personal_project') || '[]');

            if (!files.length) {
                alert('Please select files to commit.');
                return;
            }

            if (!commitMessage) {
                alert('Please enter a commit message.');
                return;
            }

            // 로컬 스토리지에서 현재 프로젝트 ID 가져오기
            const projects = JSON.parse(localStorage.getItem('projects') || '[]');
            const currentProject = projects[0]; // 첫 번째 프로젝트 선택 (필요 시 로직 수정)

            if (!currentProject || !currentProject.projectId) {
                alert('No project selected.');
                return;
            }

            console.log('Access Token:', accessToken);
            console.log('Project ID:', currentProject.projectId);
            console.log('Files:', files);
            for (let file of files) {
                console.log(`File: ${file.name}, Size: ${file.size}`);
            }
            console.log('Commit Message:', commitMessage);

            try {
                // FormData 객체 생성 및 데이터 추가
                const formData = new FormData();
                for (let file of files) {
                    formData.append('files', file, file.webkitRelativePath); // 상대 경로 포함
                }
                formData.append('commitMessage', commitMessage);

                let apiUrl = 'http://localhost:8080/api/personal/project/init';
                let method = 'POST';

                // 로컬 스토리지에 personal_project가 존재하는지 확인
                if (personalProjects.length > 0) {
                    // 다음 버전 저장 API 호출 준비
                    const latestProject = personalProjects[personalProjects.length - 1];
                    formData.append('fromCommitId', latestProject.newCommitId); // 가장 최근 커밋 ID 사용
                    apiUrl = 'http://localhost:8080/api/personal/project/save';
                } else {
                    // 최초 저장인 경우 projectId 추가
                    formData.append('projectId', currentProject.projectId); // 실제 projectId 사용
                }

                // 스프링부트 서버로 POST 요청 보내기
                const response = await fetch(apiUrl, {
                    method: method,
                    headers: {
                        'Authorization': 'Bearer ' + accessToken // 헤더에 액세스 토큰 포함
                    },
                    body: formData
                });

                const contentType = response.headers.get('content-type');

                if (!response.ok) {
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        alert('Commit failed: ' + errorData.message);
                    } else {
                        const errorText = await response.text();
                        console.error('Commit failed:', errorText);
                        alert('An unexpected error occurred.');
                    }
                    return;
                }

                const newCommitData = await response.json();

                // 로컬 스토리지에 personal_project 리스트로 저장
                personalProjects.push(newCommitData);
                localStorage.setItem('personal_project', JSON.stringify(personalProjects));

                alert('Commit successful!');
                console.log(newCommitData); // 응답 데이터 로그 출력
            } catch (error) {
                console.error('Error committing files:', error);
                alert('An error occurred while committing files.');
            }
        });
    } // commitBtn 이벤트 리스너 블록 닫기

    if (file1) {
        file1.addEventListener('change', async function () {
            var files = this.files;
            try {
                var fileContents = await getFileContents(files);
                displayFileContents(fileContents, 'original');

                // 파일 내용 콘솔에 출력
                console.log('Files:', files);
                for (let file of files) {
                    let content = await readFileContent(file);
                    console.log(`File: ${file.name}, Size: ${file.size}, Content:`, content.slice(0, 100)); // 첫 100자만 출력
                }
            } catch (error) {
                console.error('Error reading files:', error);
                alert('파일을 읽는 도중 오류가 발생했습니다.');
            }
        });
    }

    if (file2) {
        file2.addEventListener('change', async function () {
            var fileName = this.files[0].name;
            document.getElementById('file2-name').textContent = fileName;
            await readFile(this, 'changed');
        });
    }

    if (compareBtn) {
        compareBtn.addEventListener('click', async function () {
            await compareFiles();
        });
    }

    if (reviewBtn) {
        reviewBtn.addEventListener('click', async function () {
            await reviewFiles();
        });
    }

    async function uploadFile(input, type) {
        var formData = new FormData();
        formData.append(input.name, input.files[0]);

        try {
            let response = await fetch('/upload', { method: 'POST', body: formData });
            let data = await response.json();

            if (type === 'original') {
                document.getElementById('original-structure-container').innerHTML = data.combined_structure.original_structure;
                addDirectoryToggle();
                addFileClickEvent();
                // Read the original file content and display it
                var originalFileContent = '';
                for (let file of data.files) {
                    originalFileContent += `<h3>${file.name}</h3><pre>${file.content}</pre>`;
                }
                document.getElementById('original-file-content').innerHTML = originalFileContent;
            } else if (type === 'changed') {
                document.getElementById('changed-file-content').innerText = data.content;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function readFile(input, type) {
        var file = input.files[0];
        var reader = new FileReader();

        reader.onload = function (event) {
            var content = event.target.result;
            if (type === 'changed') {
                document.getElementById('changed-file-content').innerText = content;
            }
        };

        reader.readAsText(file);
    }

    async function displayFileContent(file, type) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var content = event.target.result;
            if (type === 'original') {
                document.getElementById('original-file-content').innerText = content;
            }
        };
        reader.readAsText(file);
    }

    async function compareFiles() {
        var originalContent = document.getElementById('original-file-content').innerText;
        var changedContent = document.getElementById('changed-file-content').innerText;

        try {
            let response = await fetch('/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ original: originalContent, changed: changedContent }),
            });
            let data = await response.json();
            var resultElement = document.getElementById('comparison-result');
            resultElement.innerHTML = data.differences;
            resultElement.classList.add('show');
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function reviewFiles() {
        var originalContent = document.getElementById('original-file-content').innerText;
        var changedContent = document.getElementById('changed-file-content').innerText;

        try {
            let response = await fetch('/review_files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file1: originalContent, file2: changedContent }),
            });
            let data = await response.json();
            var resultElement = document.getElementById('review-result');
            if (data.result === "success") {
                resultElement.innerHTML = `<h3>Review Feedback:</h3><p>${data.review}</p>`;
            } else {
                resultElement.innerHTML = `<p>Error: ${data.result}</p>`;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function saveChanges() {
        var originalContent = Array.from(document.getElementById('original-file-content').querySelectorAll('pre'))
            .map(pre => ({ name: pre.previousSibling.textContent, content: pre.textContent }));
        var changedContent = Array.from(document.getElementById('changed-file-content').querySelectorAll('pre'))
            .map(pre => ({ name: pre.previousSibling.textContent, content: pre.textContent }));

        try {
            let response = await fetch('/save_changes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    original_files: originalContent,
                    changed_files: changedContent
                }),
            });
            let data = await response.json();
            var resultMessageElement = document.getElementById('result-message');
            resultMessageElement.textContent = data.result;

            if (data.result === "Files saved successfully.") {
                resultMessageElement.classList.add('success');
                resultMessageElement.classList.remove('error');
            } else {
                resultMessageElement.classList.add('error');
                resultMessageElement.classList.remove('success');
            }
        } catch (error) {
            var resultMessageElement = document.getElementById('result-message');
            resultMessageElement.textContent = 'Failed to save changes.';
            resultMessageElement.classList.add('error');
            resultMessageElement.classList.remove('success');
            console.error('Error:', error);
        }
    }

    async function reloadOriginalFile(filePath) {
        try {
            let response = await fetch('/file?path=' + encodeURIComponent(filePath));
            let data = await response.json();
            if (data.result === "File loaded successfully") {
                document.getElementById('original-file-content').innerText = data.content;
            } else {
                alert(data.result);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    let openDirectories = {};

    async function getFileContents(files) {
        let fileContents = [];
        for (let file of files) {
            // MIME 타입을 검사하여 텍스트 파일만 읽음
            if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
                try {
                    let content = await readFileContent(file);
                    fileContents.push({ name: file.webkitRelativePath, content: content });
                } catch (error) {
                    console.error('Error reading file:', file.name, error);
                    throw error; // Rethrow the error to handle it in the calling function
                }
            } else {
                console.warn('Skipping non-text file:', file.name);
            }
        }
        return fileContents;
    }

    function displayFileContents(fileContents, type) {
        if (type === 'original') {
            let contentHtml = '';
            fileContents.forEach(file => {
                contentHtml += `<h3>${file.name}</h3><pre>${escapeHtml(file.content)}</pre>`;
            });
            document.getElementById('original-file-content').innerHTML = contentHtml;
        }
    }

    function readFileContent(file) {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = function (event) {
                resolve(event.target.result);
            };
            reader.onerror = function (error) {
                reject(error);
            };
            reader.readAsText(file);
        });
    }

    function addDirectoryToggle() {
        var toggler = document.getElementsByClassName("directory");
        for (var i = 0; i < toggler.length; i++) {
            var directoryPath = toggler[i].getAttribute("data-path");

            if (!toggler[i].classList.contains("bound")) {
                toggler[i].classList.add("bound");
                toggler[i].addEventListener("click", async function (event) {
                    if (event.target.tagName === 'LI') {
                        var nested = this.querySelector(".nested");
                        if (nested) {
                            nested.classList.toggle("active");
                            this.classList.toggle("directory-open");

                            if (!nested.innerHTML) {
                                var path = this.getAttribute("data-path");
                                var type = this.getAttribute("data-type");
                                try {
                                    let response = await fetch(`/subdirectories?path=${encodeURIComponent(path)}&type=${type}`);
                                    let data = await response.json();
                                    if (data.result === "Subdirectories loaded successfully") {
                                        nested.innerHTML = data.subdirectories;
                                        addDirectoryToggle();
                                        addFileClickEvent();
                                        openDirectories[path] = true;
                                        updateOpenDirectories();
                                    } else {
                                        alert(data.result);
                                    }
                                } catch (error) {
                                    console.error('Error:', error);
                                }
                            } else {
                                if (nested.classList.contains("active")) {
                                    openDirectories[directoryPath] = true;
                                } else {
                                    delete openDirectories[directoryPath];
                                }
                                updateOpenDirectories();
                            }
                        }
                    }
                });
            }

            if (openDirectories[directoryPath]) {
                toggler[i].classList.add("directory-open");
                var nested = toggler[i].querySelector(".nested");
                if (nested) {
                    nested.classList.add("active");
                }
            }
        }
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function updateOpenDirectories() {
        var toggler = document.getElementsByClassName("directory");
        for (var i = 0; i < toggler.length; i++) {
            var directoryPath = toggler[i].getAttribute("data-path");
            if (openDirectories[directoryPath]) {
                toggler[i].classList.add("directory-open");
                var nested = toggler[i].querySelector(".nested");
                if (nested) {
                    nested.classList.add("active");
                }
            } else {
                toggler[i].classList.remove("directory-open");
                var nested = toggler[i].querySelector(".nested");
                if (nested) {
                    nested.classList.remove("active");
                }
            }
        }
    }

    function addFileClickEvent() {
        var files = document.getElementsByClassName("file");
        for (var i = 0; i < files.length; i++) {
            if (!files[i].classList.contains("bound")) {
                files[i].classList.add("bound");
                files[i].addEventListener("click", async function () {
                    var filePath = this.getAttribute("data-path");
                    var fileType = this.getAttribute("data-type");
                    try {
                        let response = await fetch('/file?path=' + encodeURIComponent(filePath));
                        let data = await response.json();
                        if (data.result === "File loaded successfully") {
                            if (fileType === 'original') {
                                document.getElementById('original-file-content').innerText = data.content;
                            }
                        } else {
                            alert(data.result);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }
                });
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.file-button').forEach(button => {
        button.addEventListener('click', async function () {
            const fileId = this.getAttribute('data-id');
            try {
                let response = await fetch(`/get_file_content/${fileId}`);
                let data = await response.json();
                if (data.result === "success") {
                    document.getElementById('file-content').innerHTML = `
                        <h2>${data.file.name}</h2>
                        <p><strong>${new Date(data.file.timestamp).toLocaleString()}</strong></p>
                        <p>${data.file.content}</p>
                        <p class="custom-differences">${data.file.differences}</p>
                    `;
                } else {
                    document.getElementById('file-content').innerHTML = `<p>Failed to load file content.</p>`;
                }
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('file-content').innerHTML = `<p>Error loading file content.</p>`;
            }
        });
    });
});
