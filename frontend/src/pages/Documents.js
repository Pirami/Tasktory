import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  AutoAwesome as AutoAwesomeIcon,
  FolderOpen as FolderIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    type: 'design',
    description: '',
    project_id: '',
  });

  const [projects, setProjects] = useState([]);

  const documentTypes = {
    design: '설계문서',
    deliverable: '산출물',
    manual: '매뉴얼',
    test: '테스트문서',
  };

  const documentTypeColors = {
    design: 'primary',
    deliverable: 'success',
    manual: 'warning',
    test: 'info',
  };

  useEffect(() => {
    // 프로젝트 목록 로드
    setProjects([
      { id: 1, name: 'AI 기반 데이터 분석 플랫폼' },
      { id: 2, name: '클라우드 마이그레이션' },
      { id: 3, name: 'MLOps 파이프라인 구축' },
    ]);

    // 문서 목록 로드
    setDocuments([
      {
        id: 1,
        title: '시스템 아키텍처 설계서',
        type: 'design',
        description: 'AI 플랫폼의 전체 시스템 아키텍처 및 설계',
        project_id: 1,
        created_at: '2024-01-15',
        status: 'completed',
        file_path: '/documents/architecture_v1.0.pdf',
      },
      {
        id: 2,
        title: 'API 명세서',
        type: 'design',
        description: 'REST API 엔드포인트 및 스펙 정의',
        project_id: 1,
        created_at: '2024-01-18',
        status: 'completed',
        file_path: '/documents/api_spec_v1.0.pdf',
      },
      {
        id: 3,
        title: '사용자 매뉴얼',
        type: 'manual',
        description: '최종 사용자를 위한 시스템 사용 가이드',
        project_id: 1,
        created_at: '2024-01-20',
        status: 'generating',
        file_path: null,
      },
      {
        id: 4,
        title: '테스트 케이스 문서',
        type: 'test',
        description: '단위 테스트 및 통합 테스트 케이스',
        project_id: 2,
        created_at: '2024-01-22',
        status: 'completed',
        file_path: '/documents/test_cases_v1.0.pdf',
      },
    ]);
  }, []);

  const handleCreateDocument = () => {
    const document = {
      id: Math.max(...documents.map(d => d.id)) + 1,
      ...newDocument,
      created_at: new Date().toISOString().split('T')[0],
      status: 'draft',
      file_path: null,
    };
    setDocuments([...documents, document]);
    setOpenDialog(false);
    setNewDocument({ title: '', type: 'design', description: '', project_id: '' });
  };

  const handleGenerateDocument = async (documentId) => {
    setIsGenerating(true);
    try {
      const document = documents.find(d => d.id === documentId);
      const response = await axios.post('/api/v1/documents/generate', {
        document_id: documentId,
        project_id: document.document_id,
        document_type: document.type,
      });
      
      setDocuments(documents.map(d => 
        d.id === documentId 
          ? { ...d, status: 'completed', file_path: response.data.file_path }
          : d
      ));
    } catch (error) {
      console.error('Document generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteDocument = (documentId) => {
    if (window.confirm('정말로 이 문서를 삭제하시겠습니까?')) {
      setDocuments(documents.filter(d => d.id !== documentId));
    }
  };

  const FileUploader = ({ onUpload }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'text/plain': ['.txt'],
        'text/markdown': ['.md'],
      },
      onDrop: (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
          onUpload(acceptedFiles[0]);
        }
      }
    });

    return (
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <DocumentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="body1">
          {isDragActive ? '파일을 여기에 놓으세요' : '문서 파일을 드래그하거나 클릭하여 업로드'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          PDF, DOC, DOCX, TXT, MD 파일 지원
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          문서 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          새 문서
        </Button>
      </Box>

      {/* 문서 통계 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DocumentIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">총 문서</Typography>
                  <Typography variant="h4" color="primary">
                    {documents.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FolderIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">설계문서</Typography>
                  <Typography variant="h4" color="success.main">
                    {documents.filter(d => d.type === 'design').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AutoAwesomeIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">자동생성</Typography>
                  <Typography variant="h4" color="warning.main">
                    {documents.filter(d => d.status === 'generating').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DocumentIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">완료</Typography>
                  <Typography variant="h4" color="info.main">
                    {documents.filter(d => d.status === 'completed').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 문서 목록 */}
      <Grid container spacing={3}>
        {documents.map((document) => (
          <Grid item xs={12} md={6} key={document.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {document.title}
                  </Typography>
                  <Chip
                    label={documentTypes[document.type]}
                    color={documentTypeColors[document.type]}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {document.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    프로젝트: {projects.find(p => p.id === document.project_id)?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    생성일: {document.created_at}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    상태: {
                      document.status === 'draft' ? '초안' :
                      document.status === 'generating' ? '생성중' :
                      document.status === 'completed' ? '완료' : '알 수 없음'
                    }
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  {document.status === 'draft' && (
                    <Button
                      variant="contained"
                      startIcon={<AutoAwesomeIcon />}
                      onClick={() => handleGenerateDocument(document.id)}
                      disabled={isGenerating}
                      size="small"
                    >
                      {isGenerating ? (
                        <>
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                          생성중...
                        </>
                      ) : (
                        '자동 생성'
                      )}
                    </Button>
                  )}

                  {document.status === 'completed' && document.file_path && (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        size="small"
                      >
                        보기
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        size="small"
                      >
                        다운로드
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    size="small"
                  >
                    편집
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteDocument(document.id)}
                    size="small"
                  >
                    삭제
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 새 문서 생성 다이얼로그 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>새 문서 생성</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="문서 제목"
            fullWidth
            variant="outlined"
            value={newDocument.title}
            onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>문서 유형</InputLabel>
            <Select
              value={newDocument.type}
              label="문서 유형"
              onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value })}
            >
              <MenuItem value="design">설계문서</MenuItem>
              <MenuItem value="deliverable">산출물</MenuItem>
              <MenuItem value="manual">매뉴얼</MenuItem>
              <MenuItem value="test">테스트문서</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>프로젝트</InputLabel>
            <Select
              value={newDocument.project_id}
              label="프로젝트"
              onChange={(e) => setNewDocument({ ...newDocument, project_id: e.target.value })}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="문서 설명"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newDocument.description}
            onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleCreateDocument} variant="contained">
            생성
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Documents;
