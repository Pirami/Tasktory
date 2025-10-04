import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import axios from 'axios';

const WBSGenerator = () => {
  const [formData, setFormData] = useState({
    project_id: '',
    proposal_content: '',
    rfp_content: '',
    project_goals: '',
    team_members: [],
  });

  const [projects, setProjects] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [wbsResult, setWbsResult] = useState(null);
  const [error, setError] = useState(null);

  const [newMember, setNewMember] = useState({
    name: '',
    experience_years: '',
    skills: '',
    skill_level: 'Junior',
  });

  useEffect(() => {
    // 프로젝트 목록 로드
    setProjects([
      { id: 1, name: 'AI 기반 데이터 분석 플랫폼' },
      { id: 2, name: '클라우드 마이그레이션' },
      { id: 3, name: 'MLOps 파이프라인 구축' },
    ]);
  }, []);

  const handleAddMember = () => {
    if (newMember.name && newMember.experience_years && newMember.skills) {
      const member = {
        ...newMember,
        experience_years: parseInt(newMember.experience_years),
        skills: newMember.skills.split(',').map(s => s.trim()),
      };
      setFormData({
        ...formData,
        team_members: [...formData.team_members, member],
      });
      setNewMember({
        name: '',
        experience_years: '',
        skills: '',
        skill_level: 'Junior',
      });
    }
  };

  const handleRemoveMember = (index) => {
    setFormData({
      ...formData,
      team_members: formData.team_members.filter((_, i) => i !== index),
    });
  };

  const handleGenerateWBS = async () => {
    if (!formData.project_id || !formData.proposal_content || !formData.rfp_content || !formData.project_goals) {
      setError('모든 필수 필드를 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await axios.post('/api/v1/projects/generate-mcp-wbs', formData);
      setWbsResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'WBS 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        <AutoAwesomeIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        WBS 자동 생성
      </Typography>

      <Grid container spacing={3}>
        {/* 입력 폼 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                프로젝트 정보 입력
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>프로젝트 선택</InputLabel>
                <Select
                  value={formData.project_id}
                  label="프로젝트 선택"
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="제안서 내용"
                multiline
                rows={4}
                value={formData.proposal_content}
                onChange={(e) => setFormData({ ...formData, proposal_content: e.target.value })}
                sx={{ mb: 2 }}
                placeholder="프로젝트 제안서의 주요 내용을 입력하세요..."
              />

              <TextField
                fullWidth
                label="RFP 내용"
                multiline
                rows={4}
                value={formData.rfp_content}
                onChange={(e) => setFormData({ ...formData, rfp_content: e.target.value })}
                sx={{ mb: 2 }}
                placeholder="RFP(Request for Proposal)의 주요 요구사항을 입력하세요..."
              />

              <TextField
                fullWidth
                label="프로젝트 목표"
                multiline
                rows={3}
                value={formData.project_goals}
                onChange={(e) => setFormData({ ...formData, project_goals: e.target.value })}
                sx={{ mb: 3 }}
                placeholder="프로젝트의 주요 목표와 성공 기준을 입력하세요..."
              />

              {/* 팀 멤버 추가 */}
              <Typography variant="h6" gutterBottom>
                팀 멤버 정보
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="이름"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="경력 (년)"
                    type="number"
                    value={newMember.experience_years}
                    onChange={(e) => setNewMember({ ...newMember, experience_years: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="기술 스택 (쉼표로 구분)"
                    value={newMember.skills}
                    onChange={(e) => setNewMember({ ...newMember, skills: e.target.value })}
                    placeholder="Python, React, Docker..."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>숙련도</InputLabel>
                    <Select
                      value={newMember.skill_level}
                      label="숙련도"
                      onChange={(e) => setNewMember({ ...newMember, skill_level: e.target.value })}
                    >
                      <MenuItem value="Junior">Junior</MenuItem>
                      <MenuItem value="Mid">Mid</MenuItem>
                      <MenuItem value="Senior">Senior</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                variant="outlined"
                onClick={handleAddMember}
                disabled={!newMember.name || !newMember.experience_years || !newMember.skills}
                sx={{ mb: 2 }}
              >
                팀 멤버 추가
              </Button>

              {/* 추가된 팀 멤버 목록 */}
              {formData.team_members.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    추가된 팀 멤버 ({formData.team_members.length}명)
                  </Typography>
                  <List dense>
                    {formData.team_members.map((member, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${member.name} (${member.experience_years}년차)`}
                          secondary={`${member.skills.join(', ')} - ${member.skill_level}`}
                        />
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRemoveMember(index)}
                        >
                          삭제
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleGenerateWBS}
                disabled={isGenerating}
                sx={{ mt: 3 }}
              >
                {isGenerating ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    WBS 생성 중...
                  </>
                ) : (
                  <>
                    <AutoAwesomeIcon sx={{ mr: 1 }} />
                    WBS 자동 생성
                  </>
                )}
              </Button>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 결과 표시 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                생성된 WBS
              </Typography>

              {wbsResult ? (
                <Box>
                  {wbsResult.status === 'success' ? (
                    <Box>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        WBS가 성공적으로 생성되었습니다!
                      </Alert>

                      {/* 프로젝트 개요 */}
                      <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1">프로젝트 개요</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2">
                            {wbsResult.wbs_data?.project_overview || '개요 정보가 없습니다.'}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>

                      {/* 배송품목 및 작업 */}
                      {wbsResult.wbs_data?.deliverables?.map((deliverable, index) => (
                        <Accordion key={index}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1">
                              {deliverable.name}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                              {deliverable.description}
                            </Typography>
                            {deliverable.tasks?.map((task, taskIndex) => (
                              <Box key={taskIndex} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <AssignmentIcon sx={{ mr: 1, fontSize: 16 }} />
                                  <Typography variant="subtitle2">
                                    {task.task_name}
                                  </Typography>
                                  <Chip
                                    label={task.priority}
                                    color={getPriorityColor(task.priority)}
                                    size="small"
                                    sx={{ ml: 'auto' }}
                                  />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  담당자: {task.assigned_to}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  필요 기술: {task.required_skill}
                                </Typography>
                                {task.skill_match_reason && (
                                  <Typography variant="caption" color="text.secondary">
                                    할당 이유: {task.skill_match_reason}
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </AccordionDetails>
                        </Accordion>
                      ))}

                      {/* 요약 정보 */}
                      {wbsResult.wbs_data?.summary && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            요약 정보
                          </Typography>
                          <Typography variant="body2">
                            총 작업 수: {wbsResult.wbs_data.summary.total_tasks}개
                          </Typography>
                          {wbsResult.wbs_data.summary.team_assignment_summary && (
                            <Typography variant="body2">
                              팀 할당: {wbsResult.wbs_data.summary.team_assignment_summary}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Alert severity="error">
                      WBS 생성에 실패했습니다: {wbsResult.error}
                    </Alert>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AssignmentIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    프로젝트 정보를 입력하고 WBS를 생성해보세요.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WBSGenerator;
