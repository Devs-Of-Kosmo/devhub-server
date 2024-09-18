// 전역 변수 초기화
window.uploadedFiles = [];
window.comparisonFiles = [];
window.isFileUploaded = false;
window.isComparisonFileUploaded = false;

// 차이점 라인 번호 저장
window.differingLines = {
    original: [],
    comparison: []
};

document.addEventListener('DOMContentLoaded', function() {
    const fileUpload = document.getElementById('fileUpload');
    const uploadButton = document.getElementById('uploadButton');
    const comparisonFileUpload = document.getElementById('comparisonFileUpload');
    const comparisonUploadButton = document.getElementById('comparisonUploadButton');
    const fileTree = document.getElementById('fileTree');
    const fileContent = document.getElementById('fileContent');
    const comparisonContent = document.getElementById('comparisonContent');
    const codeDiffButton = document.getElementById('codeDiffButton');
    const reviewResult = document.getElementById('reviewResult');

    // 파일 업로드 이벤트 리스너
    if (fileUpload) {
        fileUpload.addEventListener('change', function(event) {
            window.uploadedFiles = Array.from(event.target.files);
            updateFileTree(fileTree, window.uploadedFiles, false);
            window.isFileUploaded = true;
            checkUploadStatus();
        });
    }

    // 비교 파일 업로드 이벤트 리스너
    if (comparisonFileUpload) {
        comparisonFileUpload.addEventListener('change', function(event) {
            window.comparisonFiles = Array.from(event.target.files);
            updateFileTree(comparisonContent, window.comparisonFiles, true);
            window.isComparisonFileUploaded = true;
            checkUploadStatus();
        });
    }

    // 업로드 버튼 클릭 시 파일 선택 창 열기
    if (uploadButton) {
        uploadButton.addEventListener('click', function() {
            fileUpload.click();
        });
    }

    // 비교 파일 업로드 버튼 클릭 시 파일 선택 창 열기
    if (comparisonUploadButton) {
        comparisonUploadButton.addEventListener('click', function() {
            comparisonFileUpload.click();
        });
    }

    // 업로드 상태 확인 함수
    function checkUploadStatus() {
        if (window.isFileUploaded && window.isComparisonFileUploaded) {
            codeDiffButton.disabled = false; // 코드 비교 버튼 활성화
        } else {
            codeDiffButton.disabled = true; // 코드 비교 버튼 비활성화
        }
    }

    // 코드 차이 비교 버튼 클릭 시 비교 실행
    if (codeDiffButton) {
        codeDiffButton.addEventListener('click', function() {
            if (uploadedFiles.length === 0 || comparisonFiles.length === 0) {
                Swal.fire('오류', '두 개 이상의 파일을 선택해야 합니다.', 'error');
                return;
            }

            compareFiles(uploadedFiles[0], comparisonFiles[0]);
        });
    }

    // 파일 트리 업데이트 함수
    function updateFileTree(container, files, isComparison) {
        container.innerHTML = '';
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
                li.addEventListener('click', () => showFileContent(value, isComparison));
            } else {
                li.textContent = key;
                li.classList.add('folder');
                li.appendChild(createTreeElement(value, isComparison));
            }
            ul.appendChild(li);
        }
        return ul;
    }

    // 파일 내용 표시 함수 (라인별로 표시)
    function showFileContent(file, isComparison) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const container = isComparison ? comparisonContent : fileContent;
            container.innerHTML = `<h3>${file.name}</h3><pre><code>${escapeHtml(content)}</code></pre>`;
            hljs.highlightAll();
        };
        reader.readAsText(file);
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

    // 파일 비교 함수 (개선된 버전)
    function compareFiles(originalFile, comparisonFile) {
        Promise.all([readFileContent(originalFile), readFileContent(comparisonFile)])
            .then(([originalContent, comparisonContent]) => {
                const originalLines = originalContent.split('\n');
                const comparisonLines = comparisonContent.split('\n');
                let result = '';

                const maxLines = Math.max(originalLines.length, comparisonLines.length);

                for (let i = 0; i < maxLines; i++) {
                    const originalLine = originalLines[i] || '';
                    const comparisonLine = comparisonLines[i] || '';

                    if (originalLine !== comparisonLine) {
                        result += `
                        <div class="diff-line">
                            <div class="diff-arrow">➡️</div>
                            <div class="original-line">${escapeHtml(originalLine)}</div>
                            <div class="comparison-line">${escapeHtml(comparisonLine)}</div>
                        </div>`;
                    }
                }

                // 결과 표시
                reviewResult.innerHTML = `
                    <h2>코드 비교 결과</h2>
                    <div class="diff-container">
                        ${result || '<div class="no-diff">차이가 없습니다.</div>'}
                    </div>
                `;

                // CSS 스타일 적용 (한 번만 추가되도록 검사)
                if (!document.getElementById('diff-styles')) {
                    const style = document.createElement('style');
                    style.id = 'diff-styles';
                    style.textContent = `
                    .diff-container {
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 14px;
                        line-height: 1.5;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        overflow-x: auto;
                        background-color: #f9f9f9;
                        padding: 10px;
                    }
                    .diff-line {
                        display: flex;
                        padding: 8px;
                        border-bottom: 1px solid #eee;
                        align-items: flex-start;
                        background-color: #fff3cd; /* 밝은 노란색 배경 */
                    }
                    .diff-line:last-child {
                        border-bottom: none;
                    }
                    .diff-arrow {
                        margin-right: 10px;
                        font-size: 24px; /* 화살표 크기 키움 */
                        color: #dc3545;
                        flex-shrink: 0;
                        align-self: flex-start;
                    }
                    .original-line, .comparison-line {
                        flex: 1;
                        padding: 2px 10px;
                        white-space: pre-wrap;
                        word-break: break-word;
                        border-radius: 4px;
                        margin-right: 10px;
                        color: #000; /* 텍스트 색상을 검은색으로 설정 */
                        background-color: #ffe6e6; /* 원본 파일은 연한 빨간색 */
                        border: 1px solid #ffcccc;
                    }
                    .comparison-line {
                        background-color: #e6ffe6; /* 비교 파일은 연한 녹색 */
                        border: 1px solid #ccffcc;
                    }
                    .no-diff {
                        padding: 20px;
                        text-align: center;
                        color: #555;
                        font-style: italic;
                    }
                    `;
                    document.head.appendChild(style);
                }
            })
            .catch(error => {
                console.error('Error comparing files:', error);
                Swal.fire('오류', `파일 비교 중 오류가 발생했습니다: ${error.message || JSON.stringify(error)}`, 'error');
            });
    }

    // 파일 내용 읽기 함수
    function readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            reader.onerror = function(e) {
                console.error(`Error reading file: ${file.name}`, e);
                reject(e);
            };
            reader.readAsText(file);
        });
    }
});
