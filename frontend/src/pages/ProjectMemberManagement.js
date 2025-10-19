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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Snackbar,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { teamAPI, projectAPI } from '../services/api';

const ProjectMemberManagement = () => {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 폼 상태
  const [formData, setFormData] = useState({
    project_id: '',
    team_member_id: '',
    role: '',
    responsibility: '',
    allocation_percentage: 100,
    start_date: '',
    end_date: '',
  });

  const roles = [
    '프로젝트 매니저', '개발 리드', '시니어 개발자', '주니어 개발자',
    '프론트엔드 개발자', '백엔드 개발자', '풀스택 개발자', 'DevOps 엔지니어',
    'QA 엔지니어', 'UI/UX 디자이너', '기획자', '데이터 분석가', '기타'
  ];

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('프로젝트 목록 조회 실패:', error);
      showSnackbar('프로젝트 목록을 불러오는데 실패했습니다', 'error');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await teamAPI.getTeamMembers();
      setTeamMembers(response.data);
    } catch (error) {
      console.error('팀원 목록 조회 실패:', error);
      showSnackbar('팀원 목록을 불러오는데 실패했습니다', 'error');
    }
  };

  const fetchProjectMembers = async (projectId) => {
    try {
      setLoading(true);
      const response = await teamAPI.getProjectMembers(projectId);
      setProjectMembers(response.data);
    } catch (error) {
      console.error('프로젝트 멤버 조회 실패:', error);
      showSnackbar('프로젝트 멤버를 불러오는데 실패했습니다', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleProjectSelect = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project);
    fetchProjectMembers(projectId);
  };

  const handleOpenDialog = () => {
    if (!selectedProject) {
      showSnackbar('먼저 프로젝트를 선택해주세요', 'warning');
      return;
    }
    setEditMode(false);
    setEditingMember(null);
    setFormData({
      project_id: selectedProject.id,
      team_member_id: '',
      role: '',
      responsibility: '',
      allocation_percentage: 100,
      start_date: '',
      end_date: '',
    });
    setOpenDialog(true);
  };

  const handleEditMember = (member) => {
    setEditMode(true);
    setEditingMember(member);
    setFormData({
      project_id: selectedProject.id,
      team_member_id: member.team_member_id,
      role: member.role,
      responsibility: member.responsibility || '',
      allocation_percentage: member.allocation_percentage,
      start_date: member.start_date ? new Date(member.start_date).toISOString().split('T')[0] : '',
      end_date: member.end_date ? new Date(member.end_date).toISOString().split('T')[0] : '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // 시작일이나 종료일이 변경되면 할당 비율 자동 계산
      if ((field === 'start_date' || field === 'end_date') && 
          newData.start_date && newData.end_date && 
          selectedProject?.start_date && selectedProject?.end_date) {
        const calculatedPercentage = calculateAllocationPercentage(
          newData.start_date,
          newData.end_date,
          selectedProject.start_date,
          selectedProject.end_date
        );
        newData.allocation_percentage = calculatedPercentage;
      }
      
      return newData;
    });
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      };

      if (editMode) {
        await teamAPI.updateProjectMember(selectedProject.id, editingMember.id, submitData);
        showSnackbar('프로젝트 멤버 정보가 수정되었습니다');
      } else {
        await teamAPI.addProjectMember(selectedProject.id, submitData);
        showSnackbar('프로젝트 멤버가 추가되었습니다');
      }
      
      handleCloseDialog();
      fetchProjectMembers(selectedProject.id);
    } catch (error) {
      console.error('프로젝트 멤버 처리 실패:', error);
      showSnackbar(editMode ? '프로젝트 멤버 수정에 실패했습니다' : '프로젝트 멤버 추가에 실패했습니다', 'error');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('정말로 이 멤버를 프로젝트에서 제거하시겠습니까?')) {
      try {
      await teamAPI.removeProjectMember(selectedProject.id, memberId);
      showSnackbar('프로젝트에서 멤버가 제거되었습니다');
        fetchProjectMembers(selectedProject.id);
      } catch (error) {
        console.error('멤버 제거 실패:', error);
        showSnackbar('멤버 제거에 실패했습니다', 'error');
      }
    }
  };

  const getRoleColor = (role) => {
    if (role.includes('매니저') || role.includes('리드')) return 'error';
    if (role.includes('시니어')) return 'secondary';
    if (role.includes('주니어')) return 'primary';
    return 'default';
  };

  const getAvailabilityColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  const getAvailableMembers = () => {
    if (!selectedProject) return teamMembers;
    
    const assignedMemberIds = projectMembers.map(pm => pm.team_member_id);
    return teamMembers.filter(member => 
      member.availability && !assignedMemberIds.includes(member.id)
    );
  };

  // 할당 비율 자동 계산 함수
  const calculateAllocationPercentage = (memberStartDate, memberEndDate, projectStartDate, projectEndDate) => {
    if (!memberStartDate || !memberEndDate || !projectStartDate || !projectEndDate) {
      return 100; // 기본값
    }

    const memberStart = new Date(memberStartDate);
    const memberEnd = new Date(memberEndDate);
    const projectStart = new Date(projectStartDate);
    const projectEnd = new Date(projectEndDate);

    // 프로젝트 전체 기간 (일)
    const totalProjectDays = Math.ceil((projectEnd - projectStart) / (1000 * 60 * 60 * 24));
    
    // 멤버 투입 기간 (일)
    const memberDays = Math.ceil((memberEnd - memberStart) / (1000 * 60 * 60 * 24));
    
    // 할당 비율 계산 (투입 기간 / 전체 기간 * 100)
    const percentage = Math.round((memberDays / totalProjectDays) * 100);
    
    return Math.min(Math.max(percentage, 0), 100); // 0-100 범위로 제한
  };

  // 프로젝트 기간 정보 표시
  const getProjectDuration = () => {
    if (!selectedProject || !selectedProject.start_date || !selectedProject.end_date) {
      return "미정";
    }
    
    const startDate = new Date(selectedProject.start_date);
    const endDate = new Date(selectedProject.end_date);
    
    return `${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        프로젝트 멤버 관리
      </Typography>

      {/* 프로젝트 선택 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            프로젝트 선택
          </Typography>
          <FormControl fullWidth>
            <InputLabel>프로젝트</InputLabel>
            <Select
              value={selectedProject?.id || ''}
              onChange={(e) => handleProjectSelect(e.target.value)}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {selectedProject && (
        <>
          {/* 프로젝트 정보 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5">{selectedProject.name}</Typography>
                  <Typography color="textSecondary">{selectedProject.description}</Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Typography variant="body2">
                      상태: <Chip label={selectedProject.status} color="primary" size="small" />
                    </Typography>
                    <Typography variant="body2">
                      기간: {getProjectDuration()}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialog}
                >
                  멤버 추가
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* 멤버 목록 */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                프로젝트 멤버 ({projectMembers.length}명)
              </Typography>
              
              {projectMembers.length === 0 ? (
                <Alert severity="info">
                  아직 프로젝트 멤버가 없습니다. 멤버를 추가해주세요.
                </Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>멤버</TableCell>
                        <TableCell>역할</TableCell>
                        <TableCell>담당 업무</TableCell>
                        <TableCell>할당 비율</TableCell>
                        <TableCell>기간</TableCell>
                        <TableCell>액션</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projectMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2 }}>
                                {member.team_member.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body1">
                                  {member.team_member.name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {member.team_member.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={member.role}
                              color={getRoleColor(member.role)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {member.responsibility || '미정'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${member.allocation_percentage}%`}
                              color={getAvailabilityColor(member.allocation_percentage)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="caption">
                                시작: {member.start_date ? new Date(member.start_date).toLocaleDateString() : '미정'}
                              </Typography>
                              <br />
                              <Typography variant="caption">
                                종료: {member.end_date ? new Date(member.end_date).toLocaleDateString() : '미정'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="멤버 정보 수정">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditMember(member)}
                                  color="primary"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="프로젝트에서 제거">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveMember(member.id)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* 멤버 추가/수정 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? '프로젝트 멤버 수정' : '프로젝트 멤버 추가'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>팀원</InputLabel>
                <Select
                  value={formData.team_member_id}
                  onChange={(e) => handleInputChange('team_member_id', e.target.value)}
                  disabled={editMode}
                >
                  {editMode ? (
                    <MenuItem value={formData.team_member_id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                          {teamMembers.find(m => m.id === formData.team_member_id)?.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1">
                            {teamMembers.find(m => m.id === formData.team_member_id)?.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {teamMembers.find(m => m.id === formData.team_member_id)?.position} • {teamMembers.find(m => m.id === formData.team_member_id)?.skill_level}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ) : (
                    getAvailableMembers().map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                            {member.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1">{member.name}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {member.position} • {member.skill_level}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>역할</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="할당 비율 (%)"
                type="number"
                value={formData.allocation_percentage}
                onChange={(e) => handleInputChange('allocation_percentage', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 100 }}
                helperText="투입 기간에 따라 자동 계산됩니다"
                disabled={formData.start_date && formData.end_date && selectedProject?.start_date && selectedProject?.end_date}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="담당 업무"
                multiline
                rows={3}
                value={formData.responsibility}
                onChange={(e) => handleInputChange('responsibility', e.target.value)}
                placeholder="담당할 업무를 자세히 설명해주세요..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="시작일"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="종료일"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? '수정' : '추가'}
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

export default ProjectMemberManagement;
