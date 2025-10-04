import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
  });

  const statusColors = {
    planning: 'default',
    active: 'primary',
    completed: 'success',
    cancelled: 'error',
  };

  const statusLabels = {
    planning: '계획',
    active: '진행중',
    completed: '완료',
    cancelled: '취소',
  };

  useEffect(() => {
    // 실제 API 호출로 대체
    setProjects([
      {
        id: 1,
        name: 'AI 기반 데이터 분석 플랫폼',
        description: '머신러닝 모델을 활용한 실시간 데이터 분석 시스템 구축',
        status: 'active',
        created_at: '2024-01-15',
        team_size: 8,
        progress: 65,
      },
      {
        id: 2,
        name: '클라우드 마이그레이션',
        description: '온프레미스 시스템을 클라우드 환경으로 이전',
        status: 'planning',
        created_at: '2024-01-20',
        team_size: 5,
        progress: 20,
      },
      {
        id: 3,
        name: 'MLOps 파이프라인 구축',
        description: '머신러닝 모델의 자동화된 배포 및 관리 시스템',
        status: 'completed',
        created_at: '2023-12-10',
        team_size: 6,
        progress: 100,
      },
    ]);
  }, []);

  const columns = [
    {
      field: 'name',
      headerName: '프로젝트명',
      width: 300,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.description}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: '상태',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={statusLabels[params.value]}
          color={statusColors[params.value]}
          size="small"
        />
      ),
    },
    {
      field: 'team_size',
      headerName: '팀 크기',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PeopleIcon sx={{ mr: 1, fontSize: 16 }} />
          {params.value}명
        </Box>
      ),
    },
    {
      field: 'progress',
      headerName: '진행률',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ width: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            {params.value}%
          </Typography>
          <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1 }}>
            <Box
              sx={{
                width: `${params.value}%`,
                height: 8,
                bgcolor: 'primary.main',
                borderRadius: 1,
              }}
            />
          </Box>
        </Box>
      ),
    },
    {
      field: 'created_at',
      headerName: '생성일',
      width: 120,
    },
    {
      field: 'actions',
      headerName: '작업',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="보기">
            <IconButton size="small" onClick={() => handleView(params.row)}>
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="편집">
            <IconButton size="small" onClick={() => handleEdit(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="삭제">
            <IconButton size="small" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingProject(null);
    setFormData({ name: '', description: '', status: 'planning' });
    setOpenDialog(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
    });
    setOpenDialog(true);
  };

  const handleView = (project) => {
    // 프로젝트 상세 보기 로직
    console.log('View project:', project);
  };

  const handleDelete = (projectId) => {
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      setProjects(projects.filter(p => p.id !== projectId));
    }
  };

  const handleSave = () => {
    if (editingProject) {
      // 편집
      setProjects(projects.map(p =>
        p.id === editingProject.id
          ? { ...p, ...formData }
          : p
      ));
    } else {
      // 새 프로젝트 추가
      const newProject = {
        id: Math.max(...projects.map(p => p.id)) + 1,
        ...formData,
        created_at: new Date().toISOString().split('T')[0],
        team_size: 0,
        progress: 0,
      };
      setProjects([...projects, newProject]);
    }
    setOpenDialog(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          프로젝트 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          새 프로젝트
        </Button>
      </Box>

      {/* 프로젝트 통계 카드 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">총 프로젝트</Typography>
                  <Typography variant="h4" color="primary">
                    {projects.length}
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
                <ScheduleIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">진행 중</Typography>
                  <Typography variant="h4" color="success.main">
                    {projects.filter(p => p.status === 'active').length}
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
                <PeopleIcon color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">총 팀원</Typography>
                  <Typography variant="h4" color="secondary.main">
                    {projects.reduce((sum, p) => sum + p.team_size, 0)}
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
                <AssignmentIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">완료</Typography>
                  <Typography variant="h4" color="warning.main">
                    {projects.filter(p => p.status === 'completed').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 프로젝트 목록 */}
      <Card>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={projects}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            sx={{
              border: 0,
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f0f0f0',
              },
            }}
          />
        </Box>
      </Card>

      {/* 프로젝트 생성/편집 다이얼로그 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProject ? '프로젝트 편집' : '새 프로젝트 생성'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="프로젝트명"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="설명"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>상태</InputLabel>
            <Select
              value={formData.status}
              label="상태"
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="planning">계획</MenuItem>
              <MenuItem value="active">진행중</MenuItem>
              <MenuItem value="completed">완료</MenuItem>
              <MenuItem value="cancelled">취소</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleSave} variant="contained">
            {editingProject ? '수정' : '생성'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;
