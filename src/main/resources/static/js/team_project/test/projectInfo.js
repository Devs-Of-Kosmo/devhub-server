const projectInfo = {
    teamId: null,
    teamName: '',
    projectId: null,
    projectName: '',
    description: '',
    latestCommitId: null,
    isInitialized: false,
    commitInfo: [],
    onProjectInfoChange: null,

    async initialize() {
        this.loadFromLocalStorage();
        console.log('로컬 스토리지에서 로드된 프로젝트 정보:', this);

        const sessionProjectId = sessionStorage.getItem('projectId');
        if (sessionProjectId && !this.projectId) {
            this.setProjectId(sessionProjectId);
        }

        if (this.teamId && !this.teamName) {
            await this.fetchTeamInfo();
        }

        if (this.projectId) {
            await this.fetchProjectMetadata();
        } else {
            console.warn('프로젝트 ID가 설정되지 않았습니다.');
        }
    },

    loadFromLocalStorage() {
        const storedInfo = localStorage.getItem('projectInfo');
        if (storedInfo) {
            const parsedInfo = JSON.parse(storedInfo);
            Object.assign(this, parsedInfo);
        }
    },

    saveToLocalStorage() {
        localStorage.setItem('projectInfo', JSON.stringify({
            teamId: this.teamId,
            teamName: this.teamName,
            projectId: this.projectId,
            projectName: this.projectName,
            description: this.description,
            latestCommitId: this.latestCommitId,
            isInitialized: this.isInitialized,
            commitInfo: this.commitInfo
        }));
    },

    setProjectInfo(projectData) {
        Object.assign(this, projectData);
        this.saveToLocalStorage();
        console.log('프로젝트 정보 설정:', this);
        if (this.onProjectInfoChange) {
            this.onProjectInfoChange();
        }
    },

    getProjectId() {
        return this.projectId;
    },

    setProjectId(id) {
        this.projectId = id;
        sessionStorage.setItem('projectId', id);
        this.saveToLocalStorage();
        console.log(`프로젝트 ID 설정: ${id}`);
        if (this.onProjectInfoChange) {
            this.onProjectInfoChange();
        }
    },

    async fetchTeamInfo() {
        try {
            const teamInfo = await window.api.fetchWithTokenJSON(`/api/team/group/${this.teamId}`);
            this.teamName = teamInfo.teamName;
            this.saveToLocalStorage();
            console.log('팀 정보 가져오기 완료:', teamInfo);
        } catch (error) {
            console.error('팀 정보 가져오기 실패:', error);
        }
    },

    setLatestCommitId(id) {
        this.latestCommitId = id;
        this.saveToLocalStorage();
        console.log(`최신 커밋 ID 설정: ${id}`);
        if (this.onProjectInfoChange) {
            this.onProjectInfoChange();
        }
    },

    async fetchProjectMetadata() {
        try {
            const metadata = await window.api.fetchWithTokenJSON(`/api/team/project/metadata?projectId=${this.projectId}`);
            this.setProjectInfo({
                projectName: metadata.projectName,
                description: metadata.description,
                isInitialized: metadata.commitInfo.length > 0,
                commitInfo: metadata.commitInfo
            });
            if (metadata.commitInfo.length > 0) {
                this.setLatestCommitId(metadata.commitInfo[0].commitId);
            }
            console.log('프로젝트 메타데이터 가져오기 완료:', metadata);
            this.updateCommitHistory();
        } catch (error) {
            console.error('프로젝트 메타데이터 가져오기 실패:', error);
        }
    },

    updateCommitHistory() {
        if (window.commitHistory && this.commitInfo.length > 0) {
            window.commitHistory.clearCommitHistory();
            this.commitInfo.forEach(commit => {
                window.commitHistory.addCommitToHistory(commit);
            });
        }
    },

    addCommit(commit) {
        this.commitInfo.unshift(commit);
        this.saveToLocalStorage();
        if (window.commitHistory) {
            window.commitHistory.addCommitToHistory(commit);
        }
        if (this.onProjectInfoChange) {
            this.onProjectInfoChange();
        }
    },

    async initializeProject(files, commitMessage) {
        if (!this.projectId) {
            throw new Error('프로젝트 ID가 없습니다. 프로젝트를 먼저 선택해주세요.');
        }
        try {
            const result = await window.api.initializeProject(this.projectId, files, commitMessage);
            this.setLatestCommitId(result.newCommitId);
            this.isInitialized = true;
            await this.fetchProjectMetadata();
            console.log('프로젝트 초기화 완료:', result);
            if (this.onProjectInfoChange) {
                this.onProjectInfoChange();
            }
            return result;
        } catch (error) {
            console.error('프로젝트 초기화 실패:', error);
            throw error;
        }
    }
};

window.projectInfo = projectInfo;

document.addEventListener('DOMContentLoaded', () => {
    projectInfo.initialize();
});

// Export
window.projectInfo = projectInfo;

