document.addEventListener("DOMContentLoaded", function() {
    // Ensure elements exist before adding event listeners
    const file1 = document.getElementById('file1');
    const file2 = document.getElementById('file2');
    const compareBtn = document.getElementById('compare-btn');
    const saveChangesBtn = document.getElementById('save-changes-btn');
    const loginForm = document.getElementById('login-form');
    const reviewBtn = document.getElementById('review-btn'); // Review button

    if (file1) {
        file1.addEventListener('change', async function() {
            var fileName = this.files[0].name;
            document.getElementById('file1-name').textContent = fileName;
            await uploadFile(this, 'original');
        });
    }

    if (file2) {
        file2.addEventListener('change', async function() {
            var fileName = this.files[0].name;
            document.getElementById('file2-name').textContent = fileName;
            await readFile(this, 'changed');
        });
    }

    if (compareBtn) {
        compareBtn.addEventListener('click', async function() {
            await compareFiles();
        });
    }

    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', async function() {
            await saveChanges();
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (response.status === 200) {
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
                document.getElementById('login-message').textContent = 'Login successful!';
                document.getElementById('login-message').style.color = 'green';
                window.location.href = '/';
            } else {
                document.getElementById('login-message').textContent = data.msg;
                document.getElementById('login-message').style.color = 'red';
            }
        });
    }

    if (reviewBtn) {
        reviewBtn.addEventListener('click', async function() {
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

        reader.onload = function(event) {
            var content = event.target.result;
            if (type === 'changed') {
                document.getElementById('changed-file-content').innerText = content;
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
        var changedContent = document.getElementById('changed-file-content').innerText;
        var differencesContent = document.getElementById('comparison-result').innerHTML;
        var fileName = document.getElementById('file2-name').textContent;
        var filenameSuffix = document.getElementById('filename-suffix').value;

        try {
            let response = await fetch('/save_changes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: fileName + filenameSuffix, content: changedContent, differences: differencesContent }),
            });
            let data = await response.json();
            var resultMessageElement = document.getElementById('result-message');
            resultMessageElement.textContent = data.result;

            if (data.result === "File saved successfully.") {
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

    function addDirectoryToggle() {
        var toggler = document.getElementsByClassName("directory");
        for (var i = 0; i < toggler.length; i++) {
            var directoryPath = toggler[i].getAttribute("data-path");

            if (!toggler[i].classList.contains("bound")) {
                toggler[i].classList.add("bound");
                toggler[i].addEventListener("click", async function() {
                    var nested = this.querySelector(".nested");
                    if (nested) {
                        nested.classList.toggle("active");
                        this.classList.toggle("directory-open");

                        if (nested.innerHTML === "") {
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
                files[i].addEventListener("click", async function() {
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
document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.file-button').forEach(button => {
            button.addEventListener('click', async function() {
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