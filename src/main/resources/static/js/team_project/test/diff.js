// diff.js

// 파일 비교 함수
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

            const reviewResult = document.getElementById('reviewResult');
            reviewResult.innerHTML = `
                <h2>코드 비교 결과</h2>
                <div class="diff-container">
                    ${result || '<div class="no-diff">차이가 없습니다.</div>'}
                </div>
            `;

            applyDiffStyles();
        })
        .catch(error => {
            console.error('Error comparing files:', error);
            Swal.fire('오류', `파일 비교 중 오류가 발생했습니다: ${error.message}`, 'error');
        });
}

// 파일 내용 읽기 함수
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsText(file);
    });
}

// 스타일 적용 함수
function applyDiffStyles() {
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
                background-color: #fff3cd;
            }
            .diff-line:last-child {
                border-bottom: none;
            }
            .diff-arrow {
                margin-right: 10px;
                font-size: 24px;
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
                color: #000;
                background-color: #ffe6e6;
                border: 1px solid #ffcccc;
            }
            .comparison-line {
                background-color: #e6ffe6;
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
}

// Export
window.diff = {
    compareFiles,
    readFileContent,
    applyDiffStyles
};
