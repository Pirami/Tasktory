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
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedTasks: 0,
    teamMembers: 0,
  });

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
    // 실제 API 호출로 대체
    setStats({
      totalProjects: 12,
      activeProjects: 8,
      completedTasks: 156,
      teamMembers: 15,
    });
  }, []);

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
                  <Tooltip />
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

        {/* 빠른 작업 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                빠른 작업
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{ height: 60 }}
                  >
                    새 프로젝트 생성
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<AssignmentIcon />}
                    fullWidth
                    sx={{ height: 60 }}
                  >
                    WBS 자동 생성
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<ScheduleIcon />}
                    fullWidth
                    sx={{ height: 60 }}
                  >
                    회의록 작성
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    startIcon={<AssignmentIcon />}
                    fullWidth
                    sx={{ height: 60 }}
                  >
                    문서 생성
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
