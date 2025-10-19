import axios from 'axios';

// API 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    // 토큰이 있다면 헤더에 추가
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      request: error.request
    });
    if (error.response?.status === 401) {
      // 인증 오류 처리
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 프로젝트 관련 API
export const projectAPI = {
  // 프로젝트 목록 조회
  getProjects: () => api.get('/api/v1/projects/'),
  
  // 프로젝트 생성
  createProject: (data) => api.post('/api/v1/projects/', data),
  
  // 프로젝트 상세 조회
  getProject: (id) => api.get(`/api/v1/projects/${id}`),
  
  // 프로젝트 수정
  updateProject: (id, data) => api.put(`/api/v1/projects/${id}`, data),
  
  // 프로젝트 삭제
  deleteProject: (id) => api.delete(`/api/v1/projects/${id}`),
  
  // WBS 생성
  generateWBS: (data) => api.post('/api/v1/projects/generate-wbs', data),
  
  // MCP WBS 생성
  generateMCPWBS: (data) => api.post('/api/v1/projects/generate-mcp-wbs', data),
  
  // 고도화된 WBS 생성
  generateEnhancedWBS: (data) => api.post('/api/v1/projects/generate-enhanced-wbs', data),
  
  // 프로젝트 팀원 정보 조회
  getProjectTeamMembers: (projectId) => api.get(`/api/v1/team/projects/${projectId}/members`),
  
  // 설계문서 생성
  generateDocuments: (data) => api.post('/api/v1/projects/generate-documents', data),
  
  // 산출물 생성
  generateDeliverables: (data) => api.post('/api/v1/projects/generate-deliverables', data),
  
  // 외부 플랫폼 연동
  exportToJira: (projectId, wbsData) => api.post(`/api/v1/projects/${projectId}/export/jira`, wbsData),
  
  exportToConfluence: (projectId, wbsData) => api.post(`/api/v1/projects/${projectId}/export/confluence`, wbsData),
  
  exportToNotion: (projectId, wbsData) => api.post(`/api/v1/projects/${projectId}/export/notion`, wbsData),
};

// 회의 관련 API
export const meetingAPI = {
  // 회의 목록 조회
  getMeetings: () => api.get('/api/v1/meetings/'),
  
  // 회의 생성
  createMeeting: (data) => api.post('/api/v1/meetings/', data),
  
  // 회의 상세 조회
  getMeeting: (id) => api.get(`/api/v1/meetings/${id}`),
  
  // 회의 수정
  updateMeeting: (id, data) => api.put(`/api/v1/meetings/${id}`, data),
  
  // 회의 삭제
  deleteMeeting: (id) => api.delete(`/api/v1/meetings/${id}`),
  
  // 오디오 파일 업로드
  uploadAudio: (meetingId, file) => {
    const formData = new FormData();
    formData.append('audio_file', file);
    return api.post(`/api/v1/meetings/upload-audio/${meetingId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // 회의 처리 (회의록 생성)
  processMeeting: (meetingId) => api.post(`/api/v1/meetings/process/${meetingId}`),
};

// 문서 관련 API
export const documentAPI = {
  // 문서 목록 조회
  getDocuments: () => api.get('/api/v1/documents/'),
  
  // 문서 생성
  createDocument: (data) => api.post('/api/v1/documents/', data),
  
  // 문서 상세 조회
  getDocument: (id) => api.get(`/api/v1/documents/${id}`),
  
  // 문서 수정
  updateDocument: (id, data) => api.put(`/api/v1/documents/${id}`, data),
  
  // 문서 삭제
  deleteDocument: (id) => api.delete(`/api/v1/documents/${id}`),
  
  // 문서 자동 생성
  generateDocument: (data) => api.post('/api/v1/documents/generate', data),
  
  // 문서 다운로드
  downloadDocument: (id) => api.get(`/api/v1/documents/${id}/download`, {
    responseType: 'blob',
  }),
  
  // 파일 업로드
  uploadFile: (formData) => api.post('/api/v1/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // 문서 내용 조회
  getDocumentContent: (id) => api.get(`/api/v1/documents/${id}/content`),
};

// WBS 관련 API
export const wbsAPI = {
  // WBS 아이템 목록 조회
  getWBSItems: () => api.get('/api/v1/wbs/items'),
  
  // WBS 아이템 생성
  createWBSItem: (data) => api.post('/api/v1/wbs/items', data),
  
  // WBS 아이템 수정
  updateWBSItem: (id, data) => api.put(`/api/v1/wbs/items/${id}`, data),
  
  // WBS 아이템 삭제
  deleteWBSItem: (id) => api.delete(`/api/v1/wbs/items/${id}`),
  
  // WBS 자동 생성
  generateWBS: (data) => api.post('/api/v1/wbs/generate', data),
};


// 팀 관련 API
export const teamAPI = {
  // 팀원 목록 조회
  getTeamMembers: (params) => api.get('/api/v1/team/team-members', { params }),
  
  // 팀원 생성
  createTeamMember: (data) => api.post('/api/v1/team/team-members', data),
  
  // 팀원 상세 조회
  getTeamMember: (id) => api.get(`/api/v1/team/team-members/${id}`),
  
  // 팀원 수정
  updateTeamMember: (id, data) => api.put(`/api/v1/team/team-members/${id}`, data),
  
  // 팀원 삭제
  deleteTeamMember: (id) => api.delete(`/api/v1/team/team-members/${id}`),
  
  // 프로젝트 멤버 목록 조회
  getProjectMembers: (projectId) => api.get(`/api/v1/team/projects/${projectId}/members`),
  
  // 프로젝트 멤버 추가
  addProjectMember: (projectId, data) => api.post(`/api/v1/team/projects/${projectId}/members`, data),
  
  // 프로젝트 멤버 수정
  updateProjectMember: (projectId, memberId, data) => api.put(`/api/v1/team/projects/${projectId}/members/${memberId}`, data),
  
  // 프로젝트 멤버 제거
  removeProjectMember: (projectId, memberId) => api.delete(`/api/v1/team/projects/${projectId}/members/${memberId}`),
  
  // 프로젝트 템플릿 목록 조회
  getProjectTemplates: (params) => api.get('/api/v1/team/project-templates', { params }),
  
  // 프로젝트 템플릿 생성
  createProjectTemplate: (data) => api.post('/api/v1/team/project-templates', data),
  
  // 빠른 프로젝트 생성
  quickCreateProject: (data) => api.post('/api/v1/team/quick-create-project', data),
};

// 시스템 관련 API
export const systemAPI = {
  // 헬스 체크
  healthCheck: () => api.get('/health'),
  
  // 시스템 상태
  getSystemStatus: () => api.get('/api/v1/system/status'),
  
  // 로그 조회
  getLogs: (params) => api.get('/api/v1/system/logs', { params }),
  
  // 백업 생성
  createBackup: () => api.post('/api/v1/system/backup'),
  
  // 백업 목록
  getBackups: () => api.get('/api/v1/system/backups'),
};

// 설정 관련 API
export const settingsAPI = {
  // 설정 조회
  getSettings: () => api.get('/api/v1/settings/'),
  
  // 설정 업데이트
  updateSettings: (data) => api.put('/api/v1/settings/', data),
  
  // 연결 테스트
  testConnection: (service) => api.post('/api/v1/settings/test-connection', { service }),
};

// 파일 업로드 유틸리티
export const uploadFile = async (file, endpoint, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

// 에러 처리 유틸리티
export const handleAPIError = (error) => {
  if (error.response) {
    // 서버에서 응답을 받았지만 오류 상태 코드
    const message = error.response.data?.detail || error.response.data?.message || '서버 오류가 발생했습니다.';
    return { message, status: error.response.status };
  } else if (error.request) {
    // 요청이 전송되었지만 응답을 받지 못함
    return { message: '서버에 연결할 수 없습니다.', status: 0 };
  } else {
    // 요청 설정 중 오류 발생
    return { message: error.message || '알 수 없는 오류가 발생했습니다.', status: 0 };
  }
};

export default api;
