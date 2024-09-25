window.projectInfo = (function() {
    const state = {
        teamId: null,
        teamName: '',
        projectId: null,
        projectName: '',
        description: '',
        latestCommitId: null,
        isInitialized: false,
        commitInfo: [],
    };

    let onProjectInfoChange = null;

    async function initialize() {
        loadFromValues();
        console.log('HTML 요소의 값을 통해 로드된 프로젝트 정보:', state);

        // 최초 저장 시 세션 스토리지에서 프로젝트 ID 가져오기
        if (!state.isInitialized) {
            const sessionProjectId = sessionStorage.getItem('projectId');
            if (sessionProjectId) {
                setProjectId(sessionProjectId);
            }
        }

        if (state.teamId && !state.teamName) {
            await fetchTeamInfo();
        }

        if (state.projectId) {
            await fetchProjectMetadata();
        } else {
            console.warn('프로젝트 ID가 설정되지 않았습니다.');
        }
    }

    function loadFromValues() {
        state.teamId = document.getElementById('teamId').value || null;
        state.teamName = document.getElementById('teamName').value || '';
        state.projectId = document.getElementById('projectId').value || null;
        state.projectName = document.getElementById('projectName').value || '';
        state.description = document.getElementById('description').value || '';
        state.latestCommitId = document.getElementById('latestCommitId').value || null;
        state.isInitialized = document.getElementById('isInitialized').value === 'true';
        const commitInfoValue = document.getElementById('commitInfo').value;
        try {
            state.commitInfo = commitInfoValue ? JSON.parse(commitInfoValue) : [];
        } catch (e) {
            console.error('commitInfo 파싱 오류:', e);
            state.commitInfo = [];
        }
    }

    function saveToValues() {
        document.getElementById('teamId').value = state.teamId || '';
        document.getElementById('teamName').value = state.teamName || '';
        document.getElementById('projectId').value = state.projectId || '';
        document.getElementById('projectName').value = state.projectName || '';
        document.getElementById('description').value = state.description || '';
        document.getElementById('latestCommitId').value = state.latestCommitId || '';
        document.getElementById('isInitialized').value = state.isInitialized;
        document.getElementById('commitInfo').value = JSON.stringify(state.commitInfo);
    }

    function setProjectInfo(projectData) {
        Object.assign(state, projectData);
        saveToValues();
        console.log('프로젝트 정보 설정:', state);
        if (onProjectInfoChange) {
            onProjectInfoChange();
        }
    }

    function getProjectId() {
        return state.projectId;
    }

    function setProjectId(id) {
        state.projectId = id;
        document.getElementById('projectId').value = id;
        saveToValues();
        console.log(`프로젝트 ID 설정: ${id}`);
        if (onProjectInfoChange) {
            onProjectInfoChange();
        }
    }

    async function fetchTeamInfo() {
        try {
            const teamInfo = await window.api.fetchWithTokenJSON(`/api/team/group/${state.teamId}`);
            state.teamName = teamInfo.teamName;
            saveToValues();
            console.log('팀 정보 가져오기 완료:', teamInfo);
        } catch (error) {
            console.error('팀 정보 가져오기 실패:', error);
        }
    }

    function setLatestCommitId(id) {
        state.latestCommitId = id;
        document.getElementById('latestCommitId').value = id;
        saveToValues();
        console.log(`최신 커밋 ID 설정: ${id}`);
        if (onProjectInfoChange) {
            onProjectInfoChange();
        }
    }

    async function fetchProjectMetadata() {
        try {
            const metadata = await window.api.fetchWithTokenJSON(`/api/team/project/metadata?projectId=${state.projectId}`);
            setProjectInfo({
                projectName: metadata.projectName,
                description: metadata.description,
                isInitialized: metadata.commitInfo.length > 0,
                commitInfo: metadata.commitInfo
            });
            if (metadata.commitInfo.length > 0) {
                setLatestCommitId(metadata.commitInfo[0].commitId);
            }
            console.log('프로젝트 메타데이터 가져오기 완료:', metadata);
            updateCommitHistory();
        } catch (error) {
            console.error('프로젝트 메타데이터 가져오기 실패:', error);
        }
    }

    function updateCommitHistory() {
        if (window.commitHistory && state.commitInfo.length > 0) {
            window.commitHistory.clearCommitHistory();
            state.commitInfo.forEach(commit => {
                window.commitHistory.addCommitToHistory(commit);
            });
        }
    }

    function addCommit(commit) {
        state.commitInfo.unshift(commit);
        setLatestCommitId(commit.commitId);
        saveToValues();
        if (window.commitHistory) {
            window.commitHistory.addCommitToHistory(commit);
        }
        if (onProjectInfoChange) {
            onProjectInfoChange();
        }
    }

    async function initializeProject(projectId, files, commitMessage) {
        console.log('initializeProject 호출됨. projectId:', projectId, 'files:', files, 'commitMessage:', commitMessage);

        if (!Array.isArray(files)) {
            console.error('files is not an array:', files);
            throw new Error('파일 목록이 올바르지 않습니다.');
        }

        if (!projectId) {
            throw new Error('프로젝트 ID가 없습니다. 프로젝트를 먼저 선택해주세요.');
        }

        try {
            const result = await window.api.initializeProject(projectId, files, commitMessage);
            setProjectId(projectId);
            setLatestCommitId(result.newCommitId);
            state.isInitialized = true;
            saveToValues();
            await fetchProjectMetadata();
            console.log('프로젝트 초기화 완료:', result);
            if (onProjectInfoChange) {
                onProjectInfoChange();
            }
            return result;
        } catch (error) {
            console.error('프로젝트 초기화 실패:', error);
            throw error;
        }
    }

    return {
        initialize,
        getProjectId,
        setProjectId,
        fetchTeamInfo,
        setLatestCommitId,
        fetchProjectMetadata,
        addCommit,
        initializeProject,
        get isInitialized() { return state.isInitialized; },
        set onProjectInfoChange(callback) { onProjectInfoChange = callback; },
        getLatestCommitId: () => state.latestCommitId,
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    window.projectInfo.initialize();
});