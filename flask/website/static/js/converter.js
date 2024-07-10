document.getElementById('convert-btn').addEventListener('click', async function() {
    const selectedLanguage = document.getElementById('language-select').value;
    const codeInput = document.getElementById('code-input').value;

    try {
        let response = await fetch('/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language: selectedLanguage,
                code: codeInput
            }),
        });
        let data = await response.json();
        document.getElementById('code-output').textContent = data.converted_code;
    } catch (error) {
        console.error('Error:', error);
    }
});