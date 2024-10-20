// fileComparison.js

document.addEventListener("DOMContentLoaded", function () {
    const file2 = document.getElementById('file2');
    const compareBtn = document.getElementById('compare-btn');

    // file2의 내용을 저장할 전역 변수
    window.file2Content = '';

    if (file2) {
        file2.addEventListener('change', function () {
            const fileNames = [];
            const contentContainer = document.getElementById('file2-content-display');
            contentContainer.innerHTML = ''; // 이전 내용 초기화

            for (let i = 0; i < this.files.length; i++) {
                const file = this.files[i];
                fileNames.push(file.name);

                // 파일 내용 표시 함수 호출
                showFileContent(file, 'file2-content-display', 'file2Content');

                // file2의 내용을 전역 변수에 저장
                const reader = new FileReader();
                reader.onload = function (event) {
                    window.file2Content = event.target.result;
                };
                reader.readAsText(file);
            }

            document.getElementById('file2-name').textContent = fileNames.join(', ');
        });
    }

    if (compareBtn) {
        compareBtn.addEventListener('click', function () {
            compareFiles();
        });
    }

    function compareFiles() {
        const originalContent = window.file1Content;
        const changedContent = window.file2Content;

        if (!originalContent || !changedContent) {
            Swal.fire('오류', '비교할 두 파일의 내용이 필요합니다.', 'error');
            return;
        }

        const originalLines = originalContent.split('\n');
        const changedLines = changedContent.split('\n');

        const originalContentElement = document.getElementById('file-content-display').querySelector('code');
        const changedContentElement = document.getElementById('file2-content-display').querySelector('code');

        // 기존의 내용 백업
        const originalHtmlLines = originalContentElement.innerHTML.split('\n');
        const changedHtmlLines = changedContentElement.innerHTML.split('\n');

        const highlightedOriginal = highlightDifferences(originalHtmlLines, changedHtmlLines);
        const highlightedChanged = highlightDifferences(changedHtmlLines, originalHtmlLines);

        // 변경된 내용 업데이트
        originalContentElement.innerHTML = highlightedOriginal;
        changedContentElement.innerHTML = highlightedChanged;
    }

    function highlightDifferences(primaryHtmlLines, secondaryHtmlLines) {
        return primaryHtmlLines.map((line, index) => {
            const secondaryLine = secondaryHtmlLines[index] || '';
            let className = '';

            if (line !== secondaryLine) {
                className = 'diff-line';
            }

            return `<span class="${className}">${line}</span>`;
        }).join('\n');
    }

    // 파일 내용 표시 함수
    function showFileContent(file, containerId, contentVariableName) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const container = document.getElementById(containerId);

            // 코드 표시 영역 생성
            const extension = file.name.split('.').pop().toLowerCase();
            const language = getLanguageFromExtension(extension);

            // 하이라이트된 코드 얻기
            const highlightedCode = hljs.highlight(content, { language: language }).value;

            container.innerHTML = `
                <h3>${file.name}</h3>
                <pre><code class="hljs language-${language}">${highlightedCode}</code></pre>
            `;

            // 파일 내용을 전역 변수에 저장
            window[contentVariableName] = content;
        };
        reader.readAsText(file);
    }

    // 파일 확장자에 따라 언어 결정 함수
    function getLanguageFromExtension(extension) {
        const languageMap = {
            'js': 'javascript',
            'java': 'java',
            'py': 'python',
            'cpp': 'cpp',
            'c': 'c',
            'html': 'html',
            'css': 'css',
            'txt': 'plaintext',
            // 필요한 언어를 추가하세요
        };
        return languageMap[extension] || 'plaintext';
    }
});
