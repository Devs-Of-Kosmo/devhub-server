// fileComparison.js

document.addEventListener("DOMContentLoaded", function () {
    const file1 = document.getElementById('file1');
    const file2 = document.getElementById('file2');
    const compareBtn = document.getElementById('compare-btn');

    if (file2) {
        file2.addEventListener('change', async function () {
            const fileNames = [];
            const contentContainer = document.getElementById('file2-content-display');

            for (let i = 0; i < this.files.length; i++) {
                const file = this.files[i];
                fileNames.push(file.name);
                const reader = new FileReader();

                reader.onload = function (event) {
                    const content = event.target.result;
                    contentContainer.innerHTML += `<pre>${escapeHtml(content)}</pre>`;
                };

                reader.readAsText(file);
            }

            document.getElementById('file2-name').textContent = fileNames.join(', ');
        });
    }

    if (compareBtn) {
        compareBtn.addEventListener('click', async function () {
            await compareFiles();
        });
    }

    async function compareFiles() {
        const originalContentElement = document.getElementById('file-content-display');
        const changedContentElement = document.getElementById('changed-file-content');

        if (!originalContentElement || !changedContentElement) {
            console.error('One or both of the content elements are missing');
            return;
        }

        const originalContent = originalContentElement.innerText;
        const changedContent = changedContentElement.innerText;

        const originalLines = originalContent.split('\n');
        const changedLines = changedContent.split('\n');

        const highlightedOriginal = highlightDifferences(originalLines, changedLines, false);
        const highlightedChanged = highlightDifferences(changedLines, originalLines, true);

        originalContentElement.innerHTML = `${highlightedOriginal}`;
        changedContentElement.innerHTML = `${highlightedChanged}`;
    }

    function highlightDifferences(primaryLines, secondaryLines, isChangedContent) {
        return primaryLines.map((line, index) => {
            const secondaryLine = secondaryLines[index] || '';
            let backgroundColor = '';

            if (line !== secondaryLine) {
                if (!secondaryLine) {
                    backgroundColor = 'rgba(144, 238, 144, 0.3)';
                } else {
                    backgroundColor = 'rgba(173, 216, 230, 0.3)';
                }
            }

            return `<div class="line" style="background-color: ${backgroundColor};">
                        <span class="line-number">${index + 1}</span> ${escapeHtml(line)}
                    </div>`;
        }).join('');
    }

    function displayChangedFileContent(content) {
        const contentContainer = document.getElementById('changed-file-content');
        if (contentContainer) {
            const lines = content.split('\n');
            const numberedLines = lines.map((line, index) => {
                return `<div class="line"><span class="line-number">${index + 1}</span> ${escapeHtml(line)}</div>`;
            }).join('');

            contentContainer.innerHTML = `<pre>${numberedLines}</pre>`;
        }
    }
});
