document.addEventListener('DOMContentLoaded', function() {
    // 로컬스토리지에서 프로젝트 데이터를 가져옵니다.
    var projectsData = localStorage.getItem('projects');
    var projects = [];

    console.log('Raw projectsData:', projectsData); // 로컬스토리지 데이터 확인

    // JSON 파싱을 시도하고, 실패하면 빈 배열로 초기화합니다.
    try {
        projects = JSON.parse(projectsData) || [];
        console.log('Parsed projects:', projects); // 파싱된 데이터 확인

        if (!Array.isArray(projects)) {
            console.warn('Projects data is not an array. Initializing to empty array.');
            projects = [];
        }
    } catch (error) {
        console.error('Error parsing projects data from localStorage:', error);
        projects = [];
    }

    // 카드가 추가될 위치를 선택합니다.
    var cardsWrapper = document.querySelector('.cards-wrapper');

    // 각 프로젝트 데이터를 사용하여 카드를 생성하고 HTML에 추가합니다.
    projects.forEach(function(project, index) {
        if (!project.projectName || !project.description) {
            console.warn(`Invalid project data at index ${index}:`, project);
            return;
        }



        var cardHTML = `
            <div class="card-grid-space">
                <div class="num">${String(index + 1).padStart(2, '0')}</div>
                <a class="card" style="background-color: rgb(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)});">
                    <div>
                        <h1>${project.projectName}</h1>
                        <p>${project.description}</p>
                        <div class="date">저장 시간</div>
                        <div class="tags">
                            <div class="tag">Project</div>
                        </div>
                    </div>
                </a>
            </div>
        `;
        cardsWrapper.insertAdjacentHTML('beforeend', cardHTML);
    });
});
