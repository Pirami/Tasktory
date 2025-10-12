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
  FormControlLabel,
  Switch,
  Divider,
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
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  GetApp as GetAppIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { documentAPI } from '../services/api';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [autoGenMessage, setAutoGenMessage] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [newDocument, setNewDocument] = useState({
    title: '',
    type: 'requirements',
    description: '',
    project_id: '',
    custom_type: '',
    custom_project: '',
    use_custom_type: false,
    use_custom_project: false,
  });

  const [projects, setProjects] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);

  const documentTypes = {
    design: '설계문서',
    deliverable: '산출물',
    manual: '매뉴얼',
    test: '테스트문서',
    requirements: '요구사항정의서',
    rfp: 'RFP',
    program_list: '프로그램목록',
    program_design: '프로그램설계서',
  };

  const documentTypeColors = {
    design: 'primary',
    deliverable: 'success',
    manual: 'warning',
    test: 'info',
    requirements: 'secondary',
    rfp: 'secondary',
    program_list: 'success',
    program_design: 'success',
  };

  const documentCategories = {
    input: ['requirements', 'rfp'],
    output: ['program_list', 'program_design'],
    other: ['design', 'deliverable', 'manual', 'test']
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

  const handleCreateDocument = async () => {
    setIsUploading(true);
    try {
      console.log('Starting document creation...');
      
      // 파일 업로드가 있는 경우
      let filePath = null;
      if (attachedFile) {
        console.log('Uploading file:', attachedFile.name);
        const formData = new FormData();
        formData.append('file', attachedFile);
        
        const uploadResponse = await documentAPI.uploadFile(formData);
        filePath = uploadResponse.data.file_path;
        console.log('File uploaded successfully:', filePath);
      }

      // 문서 생성
      const documentData = {
        title: newDocument.title,
        type: newDocument.use_custom_type ? newDocument.custom_type : newDocument.type,
        description: newDocument.description,
        project_id: newDocument.use_custom_project ? null : (newDocument.project_id || null),
        project_name: newDocument.use_custom_project ? newDocument.custom_project : null,
        file_path: filePath,
      };

      console.log('Creating document with data:', documentData);
      console.log('Document data type:', typeof documentData);
      console.log('Document data keys:', Object.keys(documentData));
      
      const response = await documentAPI.createDocument(documentData);
      console.log('Document created successfully:', response.data);
      
      const document = {
        id: response.data.id,
        ...documentData,
        created_at: new Date().toISOString().split('T')[0],
        status: filePath ? 'completed' : 'draft',
      };
      
      setDocuments([...documents, document]);
      
      // 요구사항정의서 생성 시 출력문서 생성
      const documentType = newDocument.use_custom_type ? newDocument.custom_type : newDocument.type;
      if (documentType === 'requirements') {
        console.log('요구사항정의서가 생성되었습니다. 출력문서를 생성합니다...');
        setIsAutoGenerating(true);
        setAutoGenMessage('프로그램 목록과 프로그램 설계서를 생성 중...');
        
        try {
          // 프로그램 목록 생성
          const programListData = {
            title: '프로그램 목록',
            type: 'program_list',
            description: '프로그램 목록',
            project_id: newDocument.use_custom_project ? null : (newDocument.project_id || null),
            project_name: newDocument.use_custom_project ? newDocument.custom_project : null,
            file_path: null,
          };
          
          const programListResponse = await documentAPI.createDocument(programListData);
          const programListDocument = {
            id: programListResponse.data.id,
            ...programListData,
            created_at: new Date().toISOString().split('T')[0],
            status: 'draft',
          };
          
          // 프로그램 설계서 생성
          const programDesignData = {
            title: '프로그램 설계서',
            type: 'program_design',
            description: '프로그램 설계서',
            project_id: newDocument.use_custom_project ? null : (newDocument.project_id || null),
            project_name: newDocument.use_custom_project ? newDocument.custom_project : null,
            file_path: null,
          };
          
          const programDesignResponse = await documentAPI.createDocument(programDesignData);
          const programDesignDocument = {
            id: programDesignResponse.data.id,
            ...programDesignData,
            created_at: new Date().toISOString().split('T')[0],
            status: 'draft',
          };
          
          // 생성된 출력문서들을 문서 목록에 추가
          setDocuments(prevDocs => [...prevDocs, programListDocument, programDesignDocument]);
          
          console.log('출력문서 생성 완료:', {
            programList: programListDocument,
            programDesign: programDesignDocument
          });
          
          setAutoGenMessage('✅ 프로그램 목록과 프로그램 설계서가 생성되었습니다!');
          
        } catch (autoGenError) {
          console.error('출력문서 생성 실패:', autoGenError);
          setAutoGenMessage('❌ 출력문서 생성에 실패했습니다. 수동으로 생성해주세요.');
          // 생성 실패해도 원본 문서 생성은 성공했으므로 계속 진행
        } finally {
          setIsAutoGenerating(false);
          // 3초 후 메시지 자동 제거
          setTimeout(() => {
            setAutoGenMessage('');
          }, 3000);
        }
      }
      
      setOpenDialog(false);
      setNewDocument({ 
        title: '', 
        type: 'requirements', 
        description: '', 
        project_id: '',
        custom_type: '',
        custom_project: '',
        use_custom_type: false,
        use_custom_project: false,
      });
      setAttachedFile(null);
    } catch (error) {
      console.error('Document creation failed:', error);
      console.error('Error details:', {
        response: error.response,
        data: error.response?.data,
        status: error.response?.status
      });
      let errorMessage = '알 수 없는 오류';
      
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail);
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data);
      }
      
      console.error('문서 생성 오류 상세:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      alert('문서 생성에 실패했습니다: ' + errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateDocument = async (documentId) => {
    setIsGenerating(true);
    try {
      const document = documents.find(d => d.id === documentId);
      const response = await documentAPI.generateDocument({
        document_id: documentId,
        project_id: document.project_id,
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

  const handleFileUpload = (file) => {
    setAttachedFile(file);
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  const handleViewDocument = async (document) => {
    setViewingDocument(document);
    setViewDialogOpen(true);
    
    // 문서 내용 로드
    if (document.content) {
      setDocumentContent(document.content);
    } else if (document.file_path) {
      try {
        // 파일 내용을 읽어오는 API 호출 (백엔드에서 구현 필요)
        const response = await documentAPI.getDocumentContent(document.id);
        setDocumentContent(response.data.content || '파일 내용을 불러올 수 없습니다.');
      } catch (error) {
        console.error('문서 내용 로드 실패:', error);
        setDocumentContent('문서 내용을 불러오는데 실패했습니다.');
      }
    } else {
      setDocumentContent('문서 내용이 없습니다.');
    }
  };

  const handleDownloadFile = async (doc) => {
    if (!doc.file_path) {
      alert('다운로드할 파일이 없습니다. 먼저 파일을 첨부해주세요.');
      return;
    }
    
    try {
      console.log('다운로드 시작:', doc.id, doc.file_path);
      const response = await documentAPI.downloadDocument(doc.id);
      console.log('다운로드 응답:', response);
      
      // 파일 다운로드 처리 - DOM 조작을 더 안전하게
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      // DOM 요소 생성
      const downloadLink = window.document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = doc.file_path.split('/').pop();
      downloadLink.style.display = 'none';
      
      // DOM에 추가하고 클릭
      window.document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // 정리
      window.document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(url);
      
      console.log('다운로드 완료');
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      console.error('오류 상세:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      alert('파일 다운로드에 실패했습니다: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleOpenFile = async (doc) => {
    if (!doc.file_path) return;
    
    try {
      console.log('파일 열기 시작:', doc.id, doc.file_path);
      const response = await documentAPI.downloadDocument(doc.id);
      console.log('파일 열기 응답:', response);
      
      // 파일을 새 창에서 열기
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // 메모리 정리 (5초 후)
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 5000);
      
      console.log('파일 열기 완료');
    } catch (error) {
      console.error('파일 열기 실패:', error);
      console.error('오류 상세:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      alert('파일을 열 수 없습니다: ' + (error.response?.data?.detail || error.message));
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
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls'],
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
          PDF, DOC, DOCX, TXT, MD, XLSX, XLS 파일 지원
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

      {/* 자동 생성 상태 알림 */}
      {(isAutoGenerating || autoGenMessage) && (
        <Alert 
          severity={isAutoGenerating ? "info" : (autoGenMessage.includes('✅') ? "success" : "error")}
          sx={{ mb: 3 }}
        >
          {isAutoGenerating && <CircularProgress size={16} sx={{ mr: 1 }} />}
          {autoGenMessage}
        </Alert>
      )}

      {/* 문서 통계 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
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
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FolderIcon color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">입력문서</Typography>
                  <Typography variant="h4" color="secondary.main">
                    {documents.filter(doc => documentCategories.input.includes(doc.type)).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AutoAwesomeIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">출력문서</Typography>
                  <Typography variant="h4" color="success.main">
                    {documents.filter(doc => documentCategories.output.includes(doc.type)).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 입력 문서 섹션 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 3 }}>
        <Typography variant="h5">
          📥 입력 문서
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => {
            setNewDocument({ 
              title: '', 
              type: 'requirements', 
              description: '', 
              project_id: '',
              custom_type: '',
              custom_project: '',
              use_custom_type: false,
              use_custom_project: false,
            });
            setOpenDialog(true);
          }}
        >
          입력 문서 추가
        </Button>
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {documents.filter(doc => documentCategories.input.includes(doc.type)).map((document) => (
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
                    프로젝트: {document.project_name || projects.find(p => p.id === document.project_id)?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    생성일: {document.created_at}
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
                        onClick={() => handleViewDocument(document)}
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

      {/* 출력 문서 섹션 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          📤 출력 문서
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => {
            setNewDocument({ 
              title: '', 
              type: 'program_list', 
              description: '', 
              project_id: '',
              custom_type: '',
              custom_project: '',
              use_custom_type: false,
              use_custom_project: false,
            });
            setOpenDialog(true);
          }}
        >
          출력 문서 추가
        </Button>
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {documents.filter(doc => documentCategories.output.includes(doc.type)).map((document) => (
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
                    프로젝트: {document.project_name || projects.find(p => p.id === document.project_id)?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    생성일: {document.created_at}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    size="small"
                    onClick={() => handleViewDocument(document)}
                  >
                    보기
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    size="small"
                    onClick={() => handleDownloadFile(document)}
                  >
                    다운로드
                  </Button>

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

      {/* 기타 문서 섹션 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          📄 기타 문서
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setNewDocument({ 
              title: '', 
              type: 'design', 
              description: '', 
              project_id: '',
              custom_type: '',
              custom_project: '',
              use_custom_type: false,
              use_custom_project: false,
            });
            setOpenDialog(true);
          }}
        >
          기타 문서 추가
        </Button>
      </Box>
      <Grid container spacing={3}>
        {documents.filter(doc => documentCategories.other.includes(doc.type)).map((document) => (
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
                    프로젝트: {document.project_name || projects.find(p => p.id === document.project_id)?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    생성일: {document.created_at}
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
                        onClick={() => handleViewDocument(document)}
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
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
            required
          />
          
          {/* 문서 유형 선택 */}
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={newDocument.use_custom_type}
                  onChange={(e) => setNewDocument({ ...newDocument, use_custom_type: e.target.checked })}
                />
              }
              label="문서 유형 직접 입력"
            />
            
            {newDocument.use_custom_type ? (
              <TextField
                margin="dense"
                label="문서 유형"
                fullWidth
                variant="outlined"
                value={newDocument.custom_type}
                onChange={(e) => setNewDocument({ ...newDocument, custom_type: e.target.value })}
                placeholder="예: 요구사항 명세서, 기술 설계서 등"
                required
              />
            ) : (
              <FormControl fullWidth>
                <InputLabel>문서 유형</InputLabel>
                <Select
                  value={newDocument.type}
                  label="문서 유형"
                  onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value })}
                >
                  <MenuItem value="requirements">요구사항정의서</MenuItem>
                  <MenuItem value="rfp">RFP</MenuItem>
                  <MenuItem value="program_list">프로그램목록</MenuItem>
                  <MenuItem value="program_design">프로그램설계서</MenuItem>
                  <MenuItem value="design">설계문서</MenuItem>
                  <MenuItem value="deliverable">산출물</MenuItem>
                  <MenuItem value="manual">매뉴얼</MenuItem>
                  <MenuItem value="test">테스트문서</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>

          {/* 프로젝트 선택 */}
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={newDocument.use_custom_project}
                  onChange={(e) => setNewDocument({ ...newDocument, use_custom_project: e.target.checked })}
                />
              }
              label="프로젝트 직접 입력"
            />
            
            {newDocument.use_custom_project ? (
              <TextField
                margin="dense"
                label="프로젝트명"
                fullWidth
                variant="outlined"
                value={newDocument.custom_project}
                onChange={(e) => setNewDocument({ ...newDocument, custom_project: e.target.value })}
                placeholder="새 프로젝트명을 입력하세요"
                required
              />
            ) : (
              <FormControl fullWidth>
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
            )}
          </Box>

          <TextField
            margin="dense"
            label="문서 설명"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newDocument.description}
            onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
            sx={{ mb: 2 }}
          />

          <Divider sx={{ my: 2 }} />

          {/* 파일 첨부 섹션 */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            <AttachFileIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            문서 첨부
          </Typography>

          {attachedFile ? (
            <Box sx={{ mb: 2 }}>
              <Alert 
                severity="success" 
                action={
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={handleRemoveFile}
                  >
                    <CloseIcon />
                  </IconButton>
                }
              >
                첨부된 파일: {attachedFile.name} ({(attachedFile.size / 1024 / 1024).toFixed(2)} MB)
              </Alert>
            </Box>
          ) : (
            <FileUploader onUpload={handleFileUpload} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button 
            onClick={handleCreateDocument} 
            variant="contained"
            disabled={isUploading || !newDocument.title}
          >
            {isUploading ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                생성중...
              </>
            ) : (
              '문서 생성'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 문서 보기 다이얼로그 */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {viewingDocument?.title}
            </Typography>
            <IconButton onClick={() => setViewDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewingDocument && (
            <Box>
              {/* 문서 정보 */}
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  문서 정보
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>유형:</strong> {documentTypes[viewingDocument.document_type] || viewingDocument.document_type}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>상태:</strong> 
                      <Chip 
                        label={viewingDocument.status === 'completed' ? '완료' : '초안'} 
                        color={viewingDocument.status === 'completed' ? 'success' : 'default'}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>설명:</strong> {viewingDocument.description || '설명 없음'}
                    </Typography>
                  </Grid>
                  {viewingDocument.project_name && (
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>프로젝트:</strong> {viewingDocument.project_name}
                      </Typography>
                    </Grid>
                  )}
                  {viewingDocument.file_path && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          <strong>첨부 파일:</strong>
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AttachFileIcon />}
                          onClick={() => handleOpenFile(viewingDocument)}
                          sx={{ textTransform: 'none' }}
                        >
                          {viewingDocument.file_path.split('/').pop()}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<GetAppIcon />}
                          onClick={() => handleDownloadFile(viewingDocument)}
                          sx={{ minWidth: 'auto', px: 1 }}
                        >
                          다운로드
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* 문서 내용 */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  문서 내용
                </Typography>
                <Box 
                  sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'grey.300', 
                    borderRadius: 1,
                    bgcolor: 'white',
                    minHeight: 300,
                    maxHeight: 500,
                    overflow: 'auto'
                  }}
                >
                  <Typography 
                    variant="body2" 
                    component="pre" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem'
                    }}
                  >
                    {documentContent || '문서 내용을 불러오는 중...'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Documents;
