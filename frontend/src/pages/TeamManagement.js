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
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Engineering as EngineeringIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { teamAPI } from '../services/api';

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [projectTemplates, setProjectTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    experience_years: 0,
    skills: [],
    skill_level: 'Junior',
    availability: true,
    hourly_rate: '',
    notes: '',
  });

  const skillLevels = ['Junior', 'Mid', 'Senior', 'Expert'];
  const departments = ['개발팀', '기획팀', '디자인팀', 'QA팀', 'DevOps팀', '기타'];
  const positions = ['개발자', '기획자', '디자이너', 'QA엔지니어', 'DevOps엔지니어', 'PM', '기타'];
  const commonSkills = [
    'Python', 'JavaScript', 'React', 'Node.js', 'Java', 'C++', 'C#',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'SQL',
    'MongoDB', 'PostgreSQL', 'Redis', 'Elasticsearch', 'Machine Learning',
    'AI', 'Data Science', 'Frontend', 'Backend', 'Full Stack'
  ];

  useEffect(() => {
    fetchTeamMembers();
    fetchProjectTemplates();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.getTeamMembers();
      setTeamMembers(response.data);
    } catch (error) {
      console.error('팀원 목록 조회 실패:', error);
      showSnackbar('팀원 목록을 불러오는데 실패했습니다', 'error');
    } finally {
      setLoading(false);
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

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        email: member.email,
        position: member.position,
        department: member.department || '',
        experience_years: member.experience_years,
        skills: member.skills || [],
        skill_level: member.skill_level,
        availability: member.availability,
        hourly_rate: member.hourly_rate || '',
        notes: member.notes || '',
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        email: '',
        position: '',
        department: '',
        experience_years: 0,
        skills: [],
        skill_level: 'Junior',
        availability: true,
        hourly_rate: '',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMember(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillAdd = (skill) => {
    if (!formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleSkillRemove = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        hourly_rate: formData.hourly_rate ? parseInt(formData.hourly_rate) : null,
      };

      if (editingMember) {
        await teamAPI.updateTeamMember(editingMember.id, submitData);
        showSnackbar('팀원 정보가 수정되었습니다');
      } else {
        await teamAPI.createTeamMember(submitData);
        showSnackbar('새 팀원이 추가되었습니다');
      }

      handleCloseDialog();
      fetchTeamMembers();
    } catch (error) {
      console.error('팀원 저장 실패:', error);
      showSnackbar('팀원 저장에 실패했습니다', 'error');
    }
  };

  const handleDelete = async (memberId) => {
    if (window.confirm('정말로 이 팀원을 삭제하시겠습니까?')) {
      try {
        await teamAPI.deleteTeamMember(memberId);
        showSnackbar('팀원이 삭제되었습니다');
        fetchTeamMembers();
      } catch (error) {
        console.error('팀원 삭제 실패:', error);
        showSnackbar('팀원 삭제에 실패했습니다', 'error');
      }
    }
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'Junior': return 'default';
      case 'Mid': return 'primary';
      case 'Senior': return 'secondary';
      case 'Expert': return 'error';
      default: return 'default';
    }
  };

  const getDepartmentIcon = (department) => {
    switch (department) {
      case '개발팀': return <EngineeringIcon />;
      case '기획팀': return <BusinessIcon />;
      case '디자인팀': return <PersonIcon />;
      case 'QA팀': return <SchoolIcon />;
      case 'DevOps팀': return <EngineeringIcon />;
      default: return <PersonIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          팀원 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          새 팀원 추가
        </Button>
      </Box>

      {/* 통계 카드 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{teamMembers.length}</Typography>
                  <Typography color="textSecondary">총 팀원</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EngineeringIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {teamMembers.filter(m => m.availability).length}
                  </Typography>
                  <Typography color="textSecondary">활성 멤버</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {teamMembers.filter(m => m.skill_level === 'Senior' || m.skill_level === 'Expert').length}
                  </Typography>
                  <Typography color="textSecondary">시니어급</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {new Set(teamMembers.map(m => m.department)).size}
                  </Typography>
                  <Typography color="textSecondary">부서 수</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 팀원 목록 테이블 */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            팀원 목록
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>이름</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell>부서/직책</TableCell>
                  <TableCell>경력</TableCell>
                  <TableCell>기술 스택</TableCell>
                  <TableCell>숙련도</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>액션</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getDepartmentIcon(member.department)}
                        <Typography sx={{ ml: 1 }}>{member.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{member.department}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {member.position}
                      </Typography>
                    </TableCell>
                    <TableCell>{member.experience_years}년</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {member.skills?.slice(0, 3).map((skill) => (
                          <Chip key={skill} label={skill} size="small" />
                        ))}
                        {member.skills?.length > 3 && (
                          <Chip label={`+${member.skills.length - 3}`} size="small" variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.skill_level}
                        color={getSkillLevelColor(member.skill_level)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.availability ? '활성' : '비활성'}
                        color={member.availability ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(member)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(member.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* 팀원 추가/수정 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMember ? '팀원 정보 수정' : '새 팀원 추가'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="이름"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="이메일"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>부서</InputLabel>
                <Select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>직책</InputLabel>
                <Select
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                >
                  {positions.map((pos) => (
                    <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="경력 (년)"
                type="number"
                value={formData.experience_years}
                onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>숙련도</InputLabel>
                <Select
                  value={formData.skill_level}
                  onChange={(e) => handleInputChange('skill_level', e.target.value)}
                >
                  {skillLevels.map((level) => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="시간당 비용 (선택사항)"
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.checked)}
                  />
                }
                label="프로젝트 참여 가능"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                기술 스택
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {formData.skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onDelete={() => handleSkillRemove(skill)}
                    color="primary"
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {commonSkills
                  .filter(skill => !formData.skills.includes(skill))
                  .map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      onClick={() => handleSkillAdd(skill)}
                      variant="outlined"
                    />
                  ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="메모"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingMember ? '수정' : '추가'}
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

export default TeamManagement;
