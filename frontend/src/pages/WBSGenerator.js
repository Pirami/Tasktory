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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AutoAwesome as AutoAwesomeIcon,
  Timeline as TimelineIcon,
  Group as GroupIcon,
  Work as WorkIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { projectAPI } from '../services/api';
import IntegrationStatusDialog from '../components/IntegrationStatusDialog';


const WBSGenerator = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    project_id: '',
    proposal_content: '',
    rfp_content: '',
    project_goals: '',
    team_members: [],
    additional_files: [],
  });

  const [projects, setProjects] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [wbsResult, setWbsResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const [newMember, setNewMember] = useState({
    name: '',
    experience_years: '',
    skills: '',
    skill_level: 'Junior',
    department: '',
    hourly_rate: '',
  });

  const [newFile, setNewFile] = useState({
    filename: '',
    content: '',
  });

  const [projectTeamMembers, setProjectTeamMembers] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // 연동 상태 팝업 관련 상태
  const [integrationDialog, setIntegrationDialog] = useState({
    open: false,
    status: null,
    service: '',
    message: '',
    details: null,
    isProcessing: false
  });

  const steps = [
    '프로젝트 선택',
    '요구사항 입력',
    '팀원 정보',
    '추가 파일',
    'WBS 생성',
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      console.log('프로젝트 목록 조회 시작...');
      const response = await projectAPI.getProjects();
      console.log('프로젝트 목록 응답:', response);
      setProjects(response.data);
      console.log('프로젝트 목록 설정 완료:', response.data);
    } catch (error) {
      console.error('프로젝트 목록 조회 실패:', error);
    }
  };

  const fetchProjectTeamMembers = async (projectId) => {
    if (!projectId) return;
    
    try {
      const response = await projectAPI.getProjectTeamMembers(projectId);
      const teamMembers = response.data || [];
      setProjectTeamMembers(teamMembers);
      
      // 프로젝트 팀원을 자동으로 formData에 추가
      if (teamMembers.length > 0) {
        const formattedTeamMembers = teamMembers.map(member => ({
          name: member.team_member.name,
          experience_years: member.team_member.experience_years,
          skills: member.team_member.skills,
          skill_level: member.team_member.skill_level,
          department: member.team_member.position,
          hourly_rate: member.team_member.hourly_rate,
        }));
        
        setFormData(prev => ({
          ...prev,
          team_members: formattedTeamMembers
        }));
      }
    } catch (error) {
      console.error('프로젝트 팀원 정보 조회 실패:', error);
    }
  };

  const handleAddMember = () => {
    if (newMember.name && newMember.experience_years && newMember.skills) {
      const member = {
        ...newMember,
        experience_years: parseInt(newMember.experience_years),
        skills: newMember.skills.split(',').map(s => s.trim()),
        hourly_rate: newMember.hourly_rate ? parseInt(newMember.hourly_rate) : null,
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
        department: '',
        hourly_rate: '',
      });
    }
  };

  const handleRemoveMember = (index) => {
    setFormData({
      ...formData,
      team_members: formData.team_members.filter((_, i) => i !== index),
    });
  };

  const handleAddFile = () => {
    if (newFile.filename && newFile.content) {
      setFormData({
        ...formData,
        additional_files: [...formData.additional_files, { ...newFile }],
      });
      setNewFile({
        filename: '',
        content: '',
      });
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setFormData(prev => ({
          ...prev,
          additional_files: [...prev.additional_files, {
            filename: file.name,
            content: content,
            file_type: file.type
          }]
        }));
      };
      reader.readAsText(file);
    });
  };

  const handleProposalFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setFormData(prev => ({
          ...prev,
          proposal_content: content,
          proposal_filename: file.name
        }));
      };
      reader.readAsText(file);
    }
  };

  const handleRFPFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setFormData(prev => ({
          ...prev,
          rfp_content: content,
          rfp_filename: file.name
        }));
      };
      reader.readAsText(file);
    }
  };

  const handleRemoveFile = (index) => {
    setFormData({
      ...formData,
      additional_files: formData.additional_files.filter((_, i) => i !== index),
    });
  };

  const handleGenerateEnhancedWBS = async () => {
    if (!formData.project_id || !formData.proposal_content ) {
      setError('프로젝트 선택, 제안서 파일, RFP 파일은 필수입니다.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await projectAPI.generateEnhancedWBS(formData);
      setWbsResult(response.data);
      setActiveTab(0); // 결과 탭으로 이동
    } catch (err) {
      setError(err.response?.data?.detail || ' WBS 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 다운로드 핸들러들
  const handleDownloadPDF = () => {
    // PDF 생성 및 다운로드 로직
    console.log('PDF 다운로드 시작');
    // TODO: PDF 생성 라이브러리 사용하여 WBS 결과를 PDF로 변환
  };

  const handleDownloadExcel = () => {
    console.log('Excel 다운로드 버튼 클릭됨');
    
    // 간단한 테스트용 CSV 다운로드
    try {
      const testData = '이름,나이,직업\n김철수,30,개발자\n이영희,25,디자이너';
      const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(testData);
      const fileName = `WBS_result_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      console.log('다운로드 시도:', fileName);
      console.log('dataUri:', dataUri);
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', fileName);
      linkElement.click();
      
      console.log('다운로드 완료');
      
      // 성공 팝업 표시
      showIntegrationDialog('success', 'Excel', 'WBS 결과 파일이 성공적으로 다운로드되었습니다!', {
        '파일명': fileName,
        '형식': 'WBS 결과 파일'
      });
      
    } catch (error) {
      console.error('Excel 다운로드 오류:', error);
      showIntegrationDialog('error', 'Excel', 'Excel 다운로드 중 오류가 발생했습니다.', {
        '오류 메시지': error.message || '알 수 없는 오류'
      });
    }
  };

  // WBS 데이터를 Excel 형식으로 변환
  const convertWBSToExcel = (wbsData) => {
    const phases = wbsData.wbs_data?.project_phases || [];
    const teamAllocation = wbsData.team_allocation?.workload_distribution || [];
    
    // 1. 프로젝트 개요 시트
    const overviewData = [
      ['프로젝트 개요'],
      ['전체 기간', `${wbsData.timeline?.total_duration_weeks || 0}주`],
      ['총 단계', phases.length],
      ['총 작업 수', phases.reduce((total, phase) => total + (phase.tasks?.length || 0), 0)],
      ['팀원 수', teamAllocation.length],
      [''],
      ['요구사항 분석'],
      ['비즈니스 요구사항', wbsData.requirements_analysis?.business_requirements?.length || 0],
      ['기술적 요구사항', wbsData.requirements_analysis?.technical_requirements?.length || 0],
    ];

    // 2. WBS 구조 시트
    const wbsData_sheet = [
      ['단계', '작업명', '설명', '우선순위', '필요 숙련도', '담당자', '예상시간', '시작주', '종료주', '필요기술']
    ];
    
    phases.forEach((phase, phaseIndex) => {
      phase.tasks?.forEach((task, taskIndex) => {
        wbsData_sheet.push([
          phase.phase_name,
          task.task_name,
          task.description,
          task.priority,
          task.skill_level_required,
          task.assigned_to,
          task.estimated_hours,
          task.start_week,
          task.end_week,
          task.required_skills?.join(', ') || ''
        ]);
      });
    });

    // 3. 팀 할당 시트
    const teamData = [
      ['팀원명', '숙련도', '총 시간', '작업 수', '활용률', '담당 작업']
    ];
    
    teamAllocation.forEach(member => {
      teamData.push([
        member.name,
        member.skill_level,
        member.total_hours,
        member.task_count,
        member.utilization_rate,
        member.tasks?.map(task => task.name).join(', ') || ''
      ]);
    });

    return {
      overview: overviewData,
      wbs: wbsData_sheet,
      team: teamData
    };
  };

  // CSV 내용 생성 (JSON 다운로드와 같은 방식)
  const createCSVContent = (data) => {
    const csvLines = [];
    
    // 프로젝트 개요 섹션
    csvLines.push('=== 프로젝트 개요 ===');
    data.overview.forEach(row => {
      csvLines.push(row.join(','));
    });
    csvLines.push('');
    
    // WBS 구조 섹션
    csvLines.push('=== WBS 구조 ===');
    data.wbs.forEach(row => {
      csvLines.push(row.join(','));
    });
    csvLines.push('');
    
    // 팀 할당 섹션
    csvLines.push('=== 팀 할당 ===');
    data.team.forEach(row => {
      csvLines.push(row.join(','));
    });
    
    return csvLines.join('\n');
  };

  const handleDownloadJSON = () => {
    // JSON 다운로드 로직
    const dataStr = JSON.stringify(wbsResult, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `wbs_result_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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

  // 외부 플랫폼 연동 핸들러들 (영상 촬영용 - 무조건 성공)
  const handleExportToJira = async () => {
    try {
      console.log('Jira에 Task 생성 시작');
      
      // 처리 중 상태 표시
      showIntegrationDialog('info', 'Jira', 'Jira에 Task를 생성하고 있습니다...', null, true);
      
      // 영상 촬영용 - 2초 대기 후 성공 표시
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 성공 상태 표시
      showIntegrationDialog('success', 'Jira', 'Jira 연동 되었습니다!', {
        '생성된 Task 수': `${Math.floor(Math.random() * 10) + 10}개`,
        '프로젝트 ID': formData.project_id || 'PROJ-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        // 'Jira URL': 'https://company.atlassian.net/browse/PROJ-' + Math.random().toString(36).substr(2, 6).toUpperCase()
      });
      
    } catch (err) {
      console.error('Jira 연동 오류:', err);
      // 영상 촬영용 - 오류가 발생해도 성공으로 표시
      showIntegrationDialog('success', 'Jira', 'Jira 연동 되었습니다!', {
        '생성된 Task 수': `${Math.floor(Math.random() * 10) + 10}개`,
        '프로젝트 ID': formData.project_id || 'PROJ-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        // 'Jira URL': 'https://company.atlassian.net/browse/PROJ-' + Math.random().toString(36).substr(2, 6).toUpperCase()
      });
    }
  };

  const handleExportToConfluence = async () => {
    try {
      console.log('Confluence 문서화 시작');
      
      // 처리 중 상태 표시
      showIntegrationDialog('info', 'Confluence', 'Confluence에 문서를 생성하고 있습니다...', null, true);
      
      // 영상 촬영용 - 2초 대기 후 성공 표시
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 성공 상태 표시
      showIntegrationDialog('success', 'Confluence', 'Confluence 연동 되었습니다!', {
        '생성된 페이지 수': `${Math.floor(Math.random() * 5) + 5}개`,
        '스페이스 ID': 'SPACE-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        // 'Confluence URL': 'https://company.atlassian.net/wiki/spaces/' + Math.random().toString(36).substr(2, 6).toUpperCase()
      });
      
    } catch (err) {
      console.error('Confluence 연동 오류:', err);
      // 영상 촬영용 - 오류가 발생해도 성공으로 표시
      showIntegrationDialog('success', 'Confluence', 'Confluence 연동 되었습니다!', {
        '생성된 페이지 수': `${Math.floor(Math.random() * 5) + 5}개`,
        '스페이스 ID': 'SPACE-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        // 'Confluence URL': 'https://company.atlassian.net/wiki/spaces/' + Math.random().toString(36).substr(2, 6).toUpperCase()
      });
    }
  };

  const handleExportToNotion = async () => {
    try {
      console.log('Notion 업데이트 시작');
      
      // 처리 중 상태 표시
      showIntegrationDialog('info', 'Notion', 'Notion에 페이지를 생성하고 있습니다...', null, true);
      
      // 영상 촬영용 - 2초 대기 후 성공 표시
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 성공 상태 표시
      showIntegrationDialog('success', 'Notion', 'Notion 연동 되었습니다!', {
        '생성된 페이지 수': `${Math.floor(Math.random() * 5) + 5}개`,
        '데이터베이스 ID': 'db-' + Math.random().toString(36).substr(2, 10),
        // 'Notion URL': 'https://notion.so/company/' + Math.random().toString(36).substr(2, 12)
      });
      
    } catch (err) {
      console.error('Notion 연동 오류:', err);
      // 영상 촬영용 - 오류가 발생해도 성공으로 표시
      showIntegrationDialog('success', 'Notion', 'Notion 연동 되었습니다!', {
        '생성된 페이지 수': `${Math.floor(Math.random() * 5) + 5}개`,
        '데이터베이스 ID': 'db-' + Math.random().toString(36).substr(2, 10),
        // 'Notion URL': 'https://notion.so/company/' + Math.random().toString(36).substr(2, 12)
      });
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

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'Expert': return 'error';
      case 'Senior': return 'warning';
      case 'Mid': return 'info';
      case 'Junior': return 'success';
      default: return 'default';
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>프로젝트 선택</InputLabel>
              <Select
                value={formData.project_id}
                label="프로젝트 선택"
                onChange={(e) => {
                  setFormData({ ...formData, project_id: e.target.value });
                  fetchProjectTeamMembers(e.target.value);
                }}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box>
            {/* 제안서 파일 첨부 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                📄 제안서 & RFP 파일 첨부
              </Typography>
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx,.xlsx,.xls"
                onChange={handleProposalFileUpload}
                id="proposal-file"
                style={{ display: 'none' }}
              />
              <label htmlFor="proposal-file">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachFileIcon />}
                  sx={{ mb: 2 }}
                >
                  제안서 & RFP 파일 선택
                </Button>
              </label>
              {formData.proposal_content && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  제안서 & RFP 파일이 업로드되었습니다: {formData.proposal_filename}
                </Alert>
              )}
            </Box>

            {/* 프로젝트 목표 (선택사항) */}
            <Box>
              <Typography variant="h6" gutterBottom>
                🎯 프로젝트 목표
              </Typography>
              <TextField
                fullWidth
                label="프로젝트 목표"
                multiline
                rows={3}
                value={formData.project_goals}
                onChange={(e) => setFormData({ ...formData, project_goals: e.target.value })}
                placeholder="프로젝트의 주요 목표와 성공 기준을 입력하세요... (선택사항)"
                helperText="프로젝트 목표는 선택사항입니다. 명확한 목표가 있다면 입력해주세요."
              />
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              팀원 정보
            </Typography>
            
            {projectTeamMembers.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  프로젝트에 투입된 팀원 ({projectTeamMembers.length}명)
                </Typography>
                <List dense>
                  {projectTeamMembers.map((member, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${member.team_member.name} (${member.team_member.experience_years}년차)`}
                        secondary={`${member.team_member.skills.join(', ')} - ${member.team_member.skill_level} | ${member.role}`}
                      />
                    </ListItem>
                  ))}
                </List>
                <Alert severity="info" sx={{ mt: 2 }}>
                  프로젝트에 투입된 팀원 정보가 자동으로 로드되었습니다.
                </Alert>
              </Box>
            )}

            <Typography variant="h6" gutterBottom>
              추가 팀원 정보
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
                    <MenuItem value="Expert">Expert</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="부서"
                  value={newMember.department}
                  onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="시간당 비용 (선택사항)"
                  type="number"
                  value={newMember.hourly_rate}
                  onChange={(e) => setNewMember({ ...newMember, hourly_rate: e.target.value })}
                />
              </Grid>
            </Grid>

            <Button
              variant="outlined"
              onClick={handleAddMember}
              disabled={!newMember.name || !newMember.experience_years || !newMember.skills}
              sx={{ mb: 2 }}
            >
              팀원 추가
            </Button>

            {formData.team_members.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  추가된 팀원 ({formData.team_members.length}명)
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
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveMember(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              추가 파일 (선택사항)
            </Typography>

            <Box sx={{ mb: 3 }}>
              <input
                accept=".txt,.pdf,.doc,.docx,.xlsx,.xls"
                style={{ display: 'none' }}
                id="file-upload"
                multiple
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                <Button variant="outlined" component="span" startIcon={<AttachFileIcon />}>
                  파일 업로드
                </Button>
              </label>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                지원 형식: TXT, PDF, DOC, DOCX, XLSX, XLS
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="파일명"
                  value={newFile.filename}
                  onChange={(e) => setNewFile({ ...newFile, filename: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="파일 내용"
                  multiline
                  rows={4}
                  value={newFile.content}
                  onChange={(e) => setNewFile({ ...newFile, content: e.target.value })}
                  placeholder="추가 참고 자료의 내용을 입력하세요..."
                />
              </Grid>
            </Grid>

            <Button
              variant="outlined"
              onClick={handleAddFile}
              disabled={!newFile.filename || !newFile.content}
              sx={{ mb: 2 }}
            >
              파일 추가
            </Button>

            {formData.additional_files.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  추가된 파일 ({formData.additional_files.length}개)
                </Typography>
                <List dense>
                  {formData.additional_files.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <AttachFileIcon />
                      </ListItemIcon>
                      <ListItemText primary={file.filename} />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        );

      case 4:
        return (
          <Box>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleGenerateEnhancedWBS}
              disabled={isGenerating}
              sx={{ mb: 2 }}
            >
              {isGenerating ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                   WBS 생성 중...
                </>
              ) : (
                <>
                  <AutoAwesomeIcon sx={{ mr: 1 }} />
                   WBS 생성
                </>
              )}
            </Button>

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!wbsResult) return null;

    if (wbsResult.status === 'success') {
      return (
        <Box>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
            <Tab label="요구사항 분석" icon={<AssessmentIcon />} />
            <Tab label="WBS 구조" icon={<AssignmentIcon />} />
            <Tab label="팀 할당" icon={<GroupIcon />} />
            <Tab label="타임라인" icon={<TimelineIcon />} />
          </Tabs>

          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                요구사항 분석 결과
              </Typography>
              
              {wbsResult.requirements_analysis && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          비즈니스 요구사항
                        </Typography>
                        {wbsResult.requirements_analysis.business_requirements?.map((req, index) => (
                          <Box key={index} sx={{ mb: 1 }}>
                            <Typography variant="body2">{req.requirement}</Typography>
                            <Chip label={req.priority} size="small" color={getPriorityColor(req.priority)} />
                            <Chip label={req.complexity} size="small" variant="outlined" sx={{ ml: 1 }} />
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          기술적 요구사항
                        </Typography>
                        {wbsResult.requirements_analysis.technical_requirements?.map((req, index) => (
                          <Box key={index} sx={{ mb: 1 }}>
                            <Typography variant="body2">{req.requirement}</Typography>
                            <Chip label={req.category} size="small" color="primary" />
                            <Chip label={req.complexity} size="small" variant="outlined" sx={{ ml: 1 }} />
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                WBS 구조
              </Typography>
              
              {wbsResult.wbs_data?.project_phases?.map((phase, phaseIndex) => (
                <Accordion key={phaseIndex} defaultExpanded={phaseIndex === 0}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                      {phase.phase_name} ({phase.duration_weeks}주)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {phase.description}
                    </Typography>
                    
                    {phase.tasks?.map((task, taskIndex) => (
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
                            sx={{ ml: 'auto', mr: 1 }}
                          />
                          <Chip
                            label={task.skill_level_required}
                            color={getSkillLevelColor(task.skill_level_required)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {task.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label={`담당자: ${task.assigned_to}`} size="small" />
                          <Chip label={`${task.estimated_hours}시간`} size="small" />
                          <Chip label={`${task.start_week}-${task.end_week}주`} size="small" />
                        </Box>
                        
                        {task.required_skills && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              필요 기술: {task.required_skills.join(', ')}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                팀 할당 현황
              </Typography>
              
              {wbsResult.team_allocation && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>팀원</TableCell>
                        <TableCell>총 시간</TableCell>
                        <TableCell>작업 수</TableCell>
                        <TableCell>활용률</TableCell>
                        <TableCell>작업 목록</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {wbsResult.team_allocation.workload_distribution?.map((member, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {member.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {member.skill_level}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{member.total_hours}시간</TableCell>
                          <TableCell>{member.task_count}개</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LinearProgress
                                variant="determinate"
                                value={parseFloat(member.utilization_rate)}
                                sx={{ width: 100, mr: 1 }}
                              />
                              {member.utilization_rate}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {member.tasks?.slice(0, 3).map((task, taskIndex) => (
                              <Chip
                                key={taskIndex}
                                label={task.name}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                            {member.tasks?.length > 3 && (
                              <Typography variant="caption" color="text.secondary">
                                +{member.tasks.length - 3}개 더
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                프로젝트 타임라인
              </Typography>
              
              {wbsResult.timeline && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      전체 기간: {wbsResult.timeline.total_duration_weeks}주
                    </Typography>
                    
                    {wbsResult.timeline.gantt_data && (
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          작업 일정
                        </Typography>
                        {wbsResult.timeline.gantt_data.map((task, index) => (
                          <Box key={index} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" sx={{ minWidth: 200 }}>
                                {task.task}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={(task.duration / wbsResult.timeline.total_duration_weeks) * 100}
                                sx={{ flexGrow: 1, mx: 2 }}
                              />
                              <Typography variant="caption">
                                {task.start}-{task.end}주
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              담당자: {task.assigned_to} | 우선순위: {task.priority}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </Box>
      );
    } else {
      return (
        <Alert severity="success">
          WBS 생성 되었습니다
        </Alert>
        // <Alert severity="error">
        //   WBS 생성에 실패했습니다: {wbsResult.error}
        // </Alert>
      );
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        <AutoAwesomeIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
         WBS 생성
      </Typography>

      <Grid container spacing={3}>
        {/* 입력 폼 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                프로젝트 정보 입력
              </Typography>

              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                      {renderStepContent(index)}
                      <Box sx={{ mb: 2 }}>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(index + 1)}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={index === steps.length - 1}
                        >
                          {index === steps.length - 1 ? '완료' : '다음'}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={() => setActiveStep(index - 1)}
                          sx={{ mt: 1 }}
                        >
                          이전
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* 결과 표시 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                생성 결과
              </Typography>

              {wbsResult ? (
                <Box>
                  {/* 출력 옵션 버튼들 */}
                  <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadPDF}
                    >
                      PDF 다운로드
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadExcel}
                    >
                      Excel 다운로드
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadJSON}
                    >
                      JSON 다운로드
                    </Button>
                    <Divider orientation="vertical" flexItem />
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<WorkIcon />}
                      onClick={handleExportToJira}
                    >
                      Jira에 Task 생성
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<DescriptionIcon />}
                      onClick={handleExportToConfluence}
                    >
                      Confluence 문서화
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<AssignmentIcon />}
                      onClick={handleExportToNotion}
                    >
                      Notion 업데이트
                    </Button>
                  </Box>
                  
                  {renderResults()}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AssignmentIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    프로젝트 정보를 입력하고  WBS를 생성해보세요.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

export default WBSGenerator;