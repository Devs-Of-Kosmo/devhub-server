var questions = [
    {question: "저장소 이름을 입력해주세요"},
    {question: "간단하게 저장소 설명을 적어주세요"}
];

(function() {
    var tTime = 100;  // transition transform time from #register in ms
    var wTime = 200;  // transition width time from #register in ms
    var eTime = 1000; // transition width time from inputLabel in ms

    // init
    var position = 0;

    document.addEventListener('DOMContentLoaded', function() {
        var register = document.getElementById('register');
        var inputField = document.getElementById('inputField');
        var progressButton = document.getElementById('progressButton');
        var progress = document.getElementById('progress');
        var inputContainer = document.getElementById('inputContainer');
        var inputProgress = document.getElementById('inputProgress');

        if (inputField && progressButton && progress && inputContainer && inputProgress) {
            putQuestion();

            progressButton.addEventListener('click', validate);
            inputField.addEventListener('keyup', function(e) {
                transform(0, 0); // ie hack to redraw
                if (e.keyCode == 13) validate();
            });
        } else {
            console.error('One or more elements are not found.');
        }

        // functions

        // load the next question
        function putQuestion() {
            inputField.placeholder = questions[position].question;
            inputField.value = '';
            inputField.type = questions[position].type || 'text';

            // 포커스를 설정하는 부분에 setTimeout 사용
            setTimeout(function() {
                inputField.focus();
            }, 10);

            showCurrent();
        }

        // when all the questions have been answered
        function done() {
            // 입력된 값을 가져옴
            var projectName = questions[0].value;
            var description = questions[1].value;

            console.log("Creating project with name:", projectName, "and description:", description);

            // API 호출
            fetch('/api/personal/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken') // 로컬 스토리지에서 accessToken 가져오기
                },
                body: JSON.stringify({
                    projectName: projectName,
                    description: description
                })
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => { throw new Error(err.message); });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Project created successfully:", data);

                    // 기존 projects 데이터 가져오기
                    var existingProjects = JSON.parse(localStorage.getItem('projects')) || [];

                    // existingProjects가 배열이 아니면 빈 배열로 초기화
                    if (!Array.isArray(existingProjects)) {
                        console.warn('Projects data is not an array. Initializing to empty array.');
                        existingProjects = [];
                    }

                    // 새로운 프로젝트 추가
                    existingProjects.push(data);

                    // 업데이트된 projects를 localStorage에 저장
                    localStorage.setItem('projects', JSON.stringify(existingProjects));

                    // 성공적으로 생성되면 리디렉션
                    window.location.href = 'project_list'; // 리디렉션 URL
                })
                .catch(error => {
                    console.error('Error:', error);
                });

        }

        // when submitting the current question
        function validate() {
            console.log("Validating input:", inputField.value); // 디버깅용 로그 추가

            // set the value of the field into the array
            questions[position].value = inputField.value;

            // check if the pattern matches
            if (!inputField.value.match(questions[position].pattern || /.+/)) {
                console.log("Validation failed for input:", inputField.value); // 디버깅용 로그 추가
                wrong();
            } else {
                ok(function() {
                    // set the progress of the background
                    progress.style.width = ++position * 100 / questions.length + 'vw';

                    // if there is a new question, hide current and load next
                    if (questions[position]) {
                        hideCurrent(putQuestion);
                    } else {
                        hideCurrent(done);
                    }
                });
            }
        }

        // helper functions
        function hideCurrent(callback) {
            console.log("Hiding current question"); // 디버깅용 로그 추가
            inputContainer.style.opacity = 0;
            inputProgress.style.transition = 'none';
            inputProgress.style.width = 0;
            setTimeout(callback, wTime);
        }

        function showCurrent(callback) {
            console.log("Showing current question"); // 디버깅용 로그 추가
            inputContainer.style.opacity = 1;
            inputProgress.style.transition = '';
            inputProgress.style.width = '100%';
            setTimeout(callback, wTime);
        }

        function transform(x, y) {
            console.log("Transform: ", x, y); // 디버깅용 로그 추가
            register.style.transform = 'translate(' + x + 'px ,  ' + y + 'px)';
        }

        function ok(callback) {
            console.log("Input is valid, proceeding to next question"); // 디버깅용 로그 추가
            register.className = '';
            setTimeout(transform, tTime * 0, 0, 10);
            setTimeout(transform, tTime * 1, 0, 0);
            setTimeout(callback, tTime * 2);
        }

        function wrong(callback) {
            console.log("Input is invalid, shaking the input field"); // 디버깅용 로그 추가
            register.className = 'wrong';
            for (var i = 0; i < 6; i++) // shaking motion
                setTimeout(transform, tTime * i, (i % 2 * 2 - 1) * 20, 0);
            setTimeout(transform, tTime * 6, 0, 0);
            setTimeout(callback, tTime * 7);
        }
    });
}());
