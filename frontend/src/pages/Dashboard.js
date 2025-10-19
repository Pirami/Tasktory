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
import { teamAPI, projectAPI } from '../services/api';

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

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, action: '새 프로젝트 생성', project: 'AI 플랫폼 개발', time: '2시간 전' },
    { id: 2, action: 'WBS 생성 완료', project: '데이터 분석 시스템', time: '4시간 전' },
    { id: 3, action: '회의록 자동 생성', project: '클라우드 마이그레이션', time: '6시간 전' },
    { id: 4, action: '문서 자동 생성', project: 'MLOps 파이프라인', time: '1일 전' },
  ]);

  const projectData = [
    { name: '1월', projects: 4 },
    { name: '2월', projects: 6 },
    { name: '3월', projects: 8 },
    { name: '4월', projects: 5 },
    { name: '5월', projects: 7 },
    { name: '6월', projects: 9 },
  ];

  useEffect(() => {
    fetchStats();
    fetchProjectTemplates();
    fetchProjects();
  }, []);

  const fetchStats = async () => {
    try {
      // 실제 API 호출로 대체
      setStats({
        totalProjects: 12,
        activeProjects: 8,
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
    </Box>
  );
};

export default Dashboard;
