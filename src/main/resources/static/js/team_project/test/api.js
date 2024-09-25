const api = {
    async fetchWithTokenJSON(url, options = {}) {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('인증 토큰이 없습니다. 로그인 해주세요.');
        }

        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        const method = options.method ? options.method.toUpperCase() : 'GET';
        if (method !== 'GET') {
            options.headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            const responseText = await response.text();
            console.error('Response Error:', response.status, responseText);
            let errorMessage = `서버 에러 (${response.status}): ${responseText}`;
            throw new Error(errorMessage);
        }
        return response.json();
    },

    async fetchWithTokenFormData(url, formData) {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('인증 토큰이 없습니다. 로그인 해주세요.');
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '네트워크 응답이 정상적이지 않습니다.');
        }
        return response.json();
    },

    // 텍스트 응답을 처리하는 함수
    async fetchWithTokenText(url, options = {}) {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('인증 토큰이 없습니다. 로그인 해주세요.');
        }

        // 기본 헤더 설정
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(url, options);
        if (!response.ok) {
            let errorText;
            try {
                errorText = await response.text();
            } catch (e) {
                errorText = '네트워크 응답이 정상적이지 않습니다.';
            }
            throw new Error(errorText || '네트워크 응답이 정상적이지 않습니다.');
        }
        return response.text();
    },

    // 이미지 파일 조회 함수 추가
    async fetchImageFile(commitId, filePath) {
        const encodedFilePath = encodeURIComponent(filePath);
        const url = `/api/team/project/image-file?commitId=${commitId}&filePath=${encodedFilePath}`;
        const token = localStorage.getItem('accessToken');

        if (!token) {
            throw new Error('인증 토큰이 없습니다. 로그인 해주세요.');
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            let errorText;
            try {
                errorText = await response.text();
            } catch (e) {
                errorText = '이미지 파일을 불러오는 중 문제가 발생했습니다.';
            }
            throw new Error(errorText || '네트워크 응답이 정상적이지 않습니다.');
        }

        return response.blob();  // Blob 형식으로 이미지 데이터를 반환
    },

    async fetchWithTokenDownload(url, options = {}) {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('인증 토큰이 없습니다. 로그인 해주세요.');
        }

        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(url, options);
        if (!response.ok) {
            let errorText;
            try {
                errorText = await response.text();
            } catch (e) {
                errorText = '네트워크 응답이 정상적이지 않습니다.';
            }
            throw new Error(errorText || '네트워크 응답이 정상적이지 않습니다.');
        }

        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'downloaded_file';

        if (contentDisposition && contentDisposition.includes('filename=')) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }

        const urlBlob = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlBlob;
        a.download = decodeURIComponent(filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(urlBlob);
    },

    async fetchProjectMetadata(projectId) {
        return this.fetchWithTokenJSON(`/api/team/project/metadata?projectId=${projectId}`);
    },

    async fetchTeamAndProjects() {
        const teamId = sessionStorage.getItem('teamId');
        const teamInfo = await this.fetchWithTokenJSON(`/api/team/group/${teamId}`);
        const projectsData = await this.fetchWithTokenJSON(`/api/team/repo/list/${teamId}`);
        const userData = await this.fetchWithTokenJSON('/api/user/info');
        return { userData, teamId, projectsData, teamInfo };
    },

    async createProject(teamId, projectName, description) {
        return this.fetchWithTokenJSON('/api/team/repo', {
            method: 'POST',
            body: JSON.stringify({ teamId, projectName, description })
        });
    },

    async initializeProject(projectId, files, commitMessage) {
        console.log('API initializeProject 호출됨. files:', files, 'commitMessage:', commitMessage);  // 로깅 추가

        if (!Array.isArray(files)) {
            console.error('files is not an array:', files);
            throw new Error('파일 목록이 올바르지 않습니다.');
        }

        const formData = new FormData();
        formData.append('projectId', projectId);
        formData.append('commitMessage', commitMessage);
        files.forEach(file => formData.append('files', file));

        return this.fetchWithTokenFormData('/api/team/project/init', formData);
    }
};

window.api = api;
