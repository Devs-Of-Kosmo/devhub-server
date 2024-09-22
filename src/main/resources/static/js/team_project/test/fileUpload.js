// fileUpload.js

// 파일 트리 업데이트 함수 (폴더 구조 포함)
function updateFileTree(container, files, isComparison = false) {
    container.innerHTML = ''; // 기존 파일 트리 초기화
    const structure = createFileStructure(files);
    const treeElement = createTreeElement(structure, isComparison);
    container.appendChild(treeElement);
}

// 파일 구조 생성 함수
function createFileStructure(files) {
    const structure = {};
    files.forEach(file => {
        const parts = file.webkitRelativePath ? file.webkitRelativePath.split('/') : [file.name];
        let current = structure;
        parts.forEach((part, index) => {
            if (!current[part]) {
                current[part] = index === parts.length - 1 ? file : {};
            }
            current = current[part];
        });
    });
    return structure;
}

// 트리 요소 생성 함수
function createTreeElement(obj, isComparison) {
    const ul = document.createElement('ul');
    for (const [key, value] of Object.entries(obj)) {
        const li = document.createElement('li');
        if (value instanceof File) {
            li.textContent = key;
            li.classList.add('file');
            li.addEventListener('click', () => {
                if (value.type.startsWith('image/')) {
                    showImageModal(value);  // 이미지 파일을 모달로 보여줌
                } else {
                    showFileContent(value, isComparison);
                }
            });
        } else {
            li.textContent = key;
            li.classList.add('folder');
            li.appendChild(createTreeElement(value, isComparison));
        }
        ul.appendChild(li);
    }
    return ul;
}

// 파일 내용 표시 함수 (텍스트 파일)
function showFileContent(file, isComparison) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const container = isComparison ? document.getElementById('comparisonContent') : document.getElementById('fileContent');
        container.innerHTML = `<h3>${file.name}</h3><pre><code>${escapeHtml(content)}</code></pre>`;
        hljs.highlightAll(); // Highlight.js가 포함되어 있다고 가정
    };
    reader.readAsText(file);
}

// 이미지 파일을 모달로 보여주는 함수
function showImageModal(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');

        modalTitle.textContent = file.name;  // 모달의 제목을 파일 이름으로 설정
        modalImage.src = e.target.result;    // 모달의 이미지 소스를 설정

        // 모달을 화면 중앙에 띄움
        modal.style.display = 'block';
    };
    reader.readAsDataURL(file);  // 이미지를 Base64 형식으로 읽음
}

// HTML 이스케이프 함수
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Export
window.fileUpload = {
    updateFileTree,
    createFileStructure,
    createTreeElement,
    showFileContent,
    showImageModal,  // 이미지 파일 보기 추가
    escapeHtml
};
