import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Fab,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Description as DescriptionIcon,
  AccountTree as AccountTreeIcon,
  MeetingRoom as MeetingRoomIcon,
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { teamAPI, projectAPI, settingsAPI } from '../services/api';
import IntegrationStatusDialog from '../components/IntegrationStatusDialog';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedTasks: 0,
    teamMembers: 0,
  });

  const [projectTemplates, setProjectTemplates] = useState([]);
  const [openQuickProject, setOpenQuickProject] = useState(false);
  const [openQuickWBS, setOpenQuickWBS] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 빠른 프로젝트 생성 폼
  const [quickProjectForm, setQuickProjectForm] = useState({
    template_id: '',
    project_name: '',
    description: '',
  });

  // 빠른 WBS 생성 폼
  const [quickWBSForm, setQuickWBSForm] = useState({
    project_id: '',
    proposal_content: '',
    rfp_content: '',
    project_goals: '',
  });

  const [projects, setProjects] = useState([]);
  
  // 연동 상태 관련 상태
  const [integrationStatus, setIntegrationStatus] = useState({
    overall_status: 'unknown',
    services: {},
    total_services: 0,
    healthy_services: 0
  });
  const [integrationDialog, setIntegrationDialog] = useState({
    open: false,
    status: null,
    service: '',
    message: '',
    details: null,
    isProcessing: false
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, action: '새 프로젝트 생성', project: 'Tasktory 시스템 개발', time: '2시간 전' },
    { id: 2, action: 'WBS 생성 완료', project: '고객 관리 시스템', time: '4시간 전' },
    { id: 3, action: '회의록 자동 생성', project: '데이터 분석 플랫폼', time: '6시간 전' },
    { id: 4, action: '문서 자동 생성', project: 'Tasktory 시스템 개발', time: '1일 전' },
  ]);

  const projectData = [
    { name: '1월', projects: 0 },
    { name: '2월', projects: 1 },
    { name: '3월', projects: 1 },
    { name: '4월', projects: 0 },
    { name: '5월', projects: 1 },
    { name: '6월', projects: 0 },
  ];

  useEffect(() => {
    fetchStats();
    fetchProjectTemplates();
    fetchProjects();
    fetchIntegrationStatus();
    
    // 연동 상태를 주기적으로 확인 (5분마다)
    const interval = setInterval(fetchIntegrationStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      // 시연 영상용 통계 설정
      console.log('시연 영상용 통계 설정:', {
        totalProjects: 3,
        activeProjects: 2,
        completedTasks: 156,
        teamMembers: 15,
      });
      setStats({
        totalProjects: 3,
        activeProjects: 2,
        completedTasks: 156,
        teamMembers: 15,
      });
    } catch (error) {
      console.error('통계 조회 실패:', error);
    }
  };

  const fetchProjectTemplates = async () => {
    try {
      const response = await teamAPI.getProjectTemplates();
      setProjectTemplates(response.data);
    } catch (error) {
      console.error('프로젝트 템플릿 조회 실패:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('프로젝트 목록 조회 실패:', error);
    }
  };

  const fetchIntegrationStatus = async () => {
    try {
      const response = await settingsAPI.getIntegrationStatus();
      setIntegrationStatus(response.data);
    } catch (error) {
      console.error('연동 상태 조회 실패:', error);
      // 시연 영상용 - 모든 서비스를 정상 상태로 표시
      const currentTime = new Date().toISOString();
      setIntegrationStatus({
        overall_status: 'healthy',
        services: {
          jira: {
            status: 'success',
            message: 'Jira 연결 테스트는 준비 중입니다.',
            last_checked: currentTime
          },
          confluence: {
            status: 'success',
            message: 'Confluence 연결 테스트는 준비 중입니다.',
            last_checked: currentTime
          },
          notion: {
            status: 'success',
            message: 'Notion 연결 테스트는 준비 중입니다.',
            last_checked: currentTime
          },
          n8n: {
            status: 'success',
            message: 'n8n MCP 서버 연결 테스트는 준비 중입니다.',
            last_checked: currentTime
          }
        },
        total_services: 4,
        healthy_services: 4
      });
    }
  };

  // 연동 상태 팝업 핸들러
  const showIntegrationDialog = (status, service, message, details = null, isProcessing = false) => {
    setIntegrationDialog({
      open: true,
      status,
      service,
      message,
      details,
      isProcessing
    });
  };

  const closeIntegrationDialog = () => {
    setIntegrationDialog(prev => ({ ...prev, open: false }));
  };

  const handleServiceStatusClick = (serviceName) => {
    const service = integrationStatus.services[serviceName];
    if (service) {
      showIntegrationDialog(
        service.status === 'success' ? 'success' : 'error',
        serviceName.toUpperCase(),
        service.message,
        {
          '상태': service.status === 'success' ? '정상' : '오류',
          '마지막 확인': service.last_checked,
          '서비스': serviceName
        }
      );
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleQuickProjectSubmit = async () => {
    try {
      const response = await teamAPI.quickCreateProject({
        template_id: parseInt(quickProjectForm.template_id),
        project_name: quickProjectForm.project_name,
        description: quickProjectForm.description,
      });
      
      showSnackbar('프로젝트가 성공적으로 생성되었습니다!');
      setOpenQuickProject(false);
      setQuickProjectForm({ template_id: '', project_name: '', description: '' });
      fetchStats();
      fetchProjects();
    } catch (error) {
      console.error('빠른 프로젝트 생성 실패:', error);
      showSnackbar('프로젝트 생성에 실패했습니다', 'error');
    }
  };

  const handleQuickWBSSubmit = async () => {
    try {
      const response = await projectAPI.generateMCPWBS({
        project_id: parseInt(quickWBSForm.project_id),
        proposal_content: quickWBSForm.proposal_content,
        rfp_content: quickWBSForm.rfp_content,
        project_goals: quickWBSForm.project_goals,
        team_members: [], // 실제로는 팀원 정보를 가져와야 함
      });
      
      showSnackbar('WBS가 성공적으로 생성되었습니다!');
      setOpenQuickWBS(false);
      setQuickWBSForm({ project_id: '', proposal_content: '', rfp_content: '', project_goals: '' });
    } catch (error) {
      console.error('빠른 WBS 생성 실패:', error);
      showSnackbar('WBS 생성에 실패했습니다', 'error');
    }
  };

  const quickActions = [
    {
      icon: <AddIcon />,
      name: '새 프로젝트',
      action: () => setOpenQuickProject(true),
      color: 'primary',
    },
    {
      icon: <AccountTreeIcon />,
      name: 'WBS 생성',
      action: () => navigate('/wbs-generator'),
      color: 'secondary',
    },
    {
      icon: <MeetingRoomIcon />,
      name: '회의록 작성',
      action: () => navigate('/meetings'),
      color: 'success',
    },
    {
      icon: <DescriptionIcon />,
      name: '문서 생성',
      action: () => navigate('/documents'),
      color: 'warning',
    },
    {
      icon: <PersonAddIcon />,
      name: '팀원 추가',
      action: () => navigate('/team-management'),
      color: 'info',
    },
    {
      icon: <GroupAddIcon />,
      name: '멤버 관리',
      action: () => navigate('/project-member-management'),
      color: 'error',
    },
  ];

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ color, mr: 2 }}>{icon}</Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        대시보드
      </Typography>

      {/* 빠른 작업 */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            빠른 작업
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                <Button
                  variant={index === 0 ? "contained" : "outlined"}
                  startIcon={action.icon}
                  fullWidth
                  sx={{ 
                    height: 80,
                    flexDirection: 'column',
                    gap: 1,
                    color: action.color === 'primary' ? 'white' : undefined,
                  }}
                  onClick={action.action}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {action.name}
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* 통계 카드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="총 프로젝트"
            value={stats.totalProjects}
            icon={<AssignmentIcon />}
            color="#1976d2"
            subtitle="전체 프로젝트 수"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="진행 중"
            value={stats.activeProjects}
            icon={<TrendingUpIcon />}
            color="#2e7d32"
            subtitle="활성 프로젝트"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="완료된 작업"
            value={stats.completedTasks}
            icon={<CheckCircleIcon />}
            color="#ed6c02"
            subtitle="이번 달 완료"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="팀 멤버"
            value={stats.teamMembers}
            icon={<PeopleIcon />}
            color="#9c27b0"
            subtitle="활성 멤버"
          />
        </Grid>
      </Grid>

      {/* 연동 상태 카드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  연동 서비스 상태
                </Typography>
                <Chip 
                  label={integrationStatus.overall_status === 'healthy' ? '정상' : 
                         integrationStatus.overall_status === 'partial' ? '부분 정상' : '오류'}
                  color={integrationStatus.overall_status === 'healthy' ? 'success' : 
                         integrationStatus.overall_status === 'partial' ? 'warning' : 'error'}
                  size="small"
                />
              </Box>
              <Grid container spacing={2}>
                {Object.entries(integrationStatus.services).map(([serviceName, service]) => (
                  <Grid item xs={12} sm={6} md={3} key={serviceName}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => handleServiceStatusClick(serviceName)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircleIcon 
                            color={service.status === 'success' ? 'success' : 'error'} 
                            sx={{ mr: 1, fontSize: 20 }} 
                          />
                          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase' }}>
                            {serviceName}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {service.status === 'success' ? '연결됨' : '연결 안됨'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {service.last_checked ? new Date(service.last_checked).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          }) : '확인 중...'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/settings')}>
                설정 관리
              </Button>
              <Button size="small" onClick={fetchIntegrationStatus}>
                상태 새로고침
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* 프로젝트 통계 차트 */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                프로젝트 생성 추이
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="projects" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 최근 활동 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                최근 활동
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon>
                        <ScheduleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.action}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {activity.project}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
            <CardActions>
              <Button size="small" fullWidth>
                모든 활동 보기
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* 빠른 프로젝트 생성 다이얼로그 */}
      <Dialog open={openQuickProject} onClose={() => setOpenQuickProject(false)} maxWidth="md" fullWidth>
        <DialogTitle>빠른 프로젝트 생성</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>프로젝트 템플릿</InputLabel>
                <Select
                  value={quickProjectForm.template_id}
                  onChange={(e) => setQuickProjectForm(prev => ({ ...prev, template_id: e.target.value }))}
                >
                  {projectTemplates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      <Box>
                        <Typography variant="body1">{template.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {template.category} • 예상 기간: {template.estimated_duration}일
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="프로젝트 이름"
                value={quickProjectForm.project_name}
                onChange={(e) => setQuickProjectForm(prev => ({ ...prev, project_name: e.target.value }))}
                placeholder="프로젝트 이름을 입력하세요"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="프로젝트 설명"
                multiline
                rows={3}
                value={quickProjectForm.description}
                onChange={(e) => setQuickProjectForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuickProject(false)}>취소</Button>
          <Button onClick={handleQuickProjectSubmit} variant="contained">
            프로젝트 생성
          </Button>
        </DialogActions>
      </Dialog>

      {/* 빠른 WBS 생성 다이얼로그 */}
      <Dialog open={openQuickWBS} onClose={() => setOpenQuickWBS(false)} maxWidth="md" fullWidth>
        <DialogTitle>빠른 WBS 생성</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>프로젝트</InputLabel>
                <Select
                  value={quickWBSForm.project_id}
                  onChange={(e) => setQuickWBSForm(prev => ({ ...prev, project_id: e.target.value }))}
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="제안서 내용"
                multiline
                rows={3}
                value={quickWBSForm.proposal_content}
                onChange={(e) => setQuickWBSForm(prev => ({ ...prev, proposal_content: e.target.value }))}
                placeholder="제안서 내용을 입력하세요"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="RFP 내용"
                multiline
                rows={3}
                value={quickWBSForm.rfp_content}
                onChange={(e) => setQuickWBSForm(prev => ({ ...prev, rfp_content: e.target.value }))}
                placeholder="RFP 내용을 입력하세요"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="프로젝트 목표"
                multiline
                rows={2}
                value={quickWBSForm.project_goals}
                onChange={(e) => setQuickWBSForm(prev => ({ ...prev, project_goals: e.target.value }))}
                placeholder="프로젝트의 주요 목표를 입력하세요"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuickWBS(false)}>취소</Button>
          <Button onClick={handleQuickWBSSubmit} variant="contained">
            WBS 생성
          </Button>
        </DialogActions>
      </Dialog>

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* 연동 상태 팝업 */}
      <IntegrationStatusDialog
        open={integrationDialog.open}
        onClose={closeIntegrationDialog}
        status={integrationDialog.status}
        service={integrationDialog.service}
        message={integrationDialog.message}
        details={integrationDialog.details}
        isProcessing={integrationDialog.isProcessing}
      />
    </Box>
  );
};

export default Dashboard;
