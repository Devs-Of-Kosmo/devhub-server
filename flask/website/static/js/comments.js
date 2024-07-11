document.getElementById('comment-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const comment = document.getElementById('user-comment').value;
    const page = document.getElementById('page').value;

    const response = await fetch('/add_comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            comment: comment,
            page: page
        }),
    });

    const data = await response.json();
    if (data.result === "Comment added successfully") {
        location.reload();
    } else {
        alert('Failed to add comment');
    }
});

document.querySelectorAll('.response-form').forEach(form => {
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const commentId = form.getAttribute('data-id');
        const responseText = form.querySelector('textarea').value;

        const response = await fetch('/add_response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                comment_id: commentId,
                response: responseText
            }),
        });

        const data = await response.json();
        if (data.result === "Response added successfully") {
            location.reload();
        } else {
            alert('Failed to add response');
        }
    });
});
