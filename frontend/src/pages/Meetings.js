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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Mic as MicIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: '',
    participants: '',
  });

  useEffect(() => {
    // 실제 API 호출로 대체
    setMeetings([
      {
        id: 1,
        title: '프로젝트 킥오프 미팅',
        description: 'AI 플랫폼 개발 프로젝트 시작 회의',
        date: '2024-01-15',
        participants: ['김개발', '이디자인', '박기획'],
        status: 'completed',
        audio_file: 'meeting_001.wav',
        minutes: '프로젝트 목표 및 일정 확정...',
      },
      {
        id: 2,
        title: '기술 검토 회의',
        description: '아키텍처 설계 및 기술 스택 검토',
        date: '2024-01-20',
        participants: ['김개발', '최아키텍트'],
        status: 'processing',
        audio_file: 'meeting_002.wav',
        minutes: null,
      },
      {
        id: 3,
        title: '진행 상황 점검',
        description: '주간 진행 상황 및 이슈 검토',
        date: '2024-01-25',
        participants: ['김개발', '이디자인', '박기획', '최아키텍트'],
        status: 'scheduled',
        audio_file: null,
        minutes: null,
      },
    ]);
  }, []);

  const statusColors = {
    scheduled: 'default',
    processing: 'warning',
    completed: 'success',
    error: 'error',
  };

  const statusLabels = {
    scheduled: '예정',
    processing: '처리중',
    completed: '완료',
    error: '오류',
  };

  const handleCreateMeeting = () => {
    const meeting = {
      id: Math.max(...meetings.map(m => m.id)) + 1,
      ...newMeeting,
      participants: newMeeting.participants.split(',').map(p => p.trim()),
      status: 'scheduled',
      audio_file: null,
      minutes: null,
    };
    setMeetings([...meetings, meeting]);
    setOpenDialog(false);
    setNewMeeting({ title: '', description: '', date: '', participants: '' });
  };

  const handleUploadAudio = (meetingId, file) => {
    // 실제 파일 업로드 로직
    console.log('Uploading audio for meeting:', meetingId, file);
    setIsProcessing(true);
    
    // 시뮬레이션
    setTimeout(() => {
      setMeetings(meetings.map(m => 
        m.id === meetingId 
          ? { ...m, audio_file: file.name, status: 'processing' }
          : m
      ));
      setIsProcessing(false);
    }, 2000);
  };

  const handleProcessMeeting = async (meetingId) => {
    setIsProcessing(true);
    try {
      // 실제 API 호출
      const response = await axios.post(`/api/v1/meetings/process/${meetingId}`);
      setMeetings(meetings.map(m => 
        m.id === meetingId 
          ? { ...m, status: 'completed', minutes: response.data.minutes }
          : m
      ));
    } catch (error) {
      setMeetings(meetings.map(m => 
        m.id === meetingId 
          ? { ...m, status: 'error' }
          : m
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const AudioUploader = ({ meetingId, onUpload }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: {
        'audio/*': ['.mp3', '.wav', '.m4a', '.ogg']
      },
      onDrop: (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
          onUpload(meetingId, acceptedFiles[0]);
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
        <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="body1">
          {isDragActive ? '파일을 여기에 놓으세요' : '오디오 파일을 드래그하거나 클릭하여 업로드'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          MP3, WAV, M4A, OGG 파일 지원
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          회의 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          새 회의
        </Button>
      </Box>

      {/* 회의 통계 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">총 회의</Typography>
                  <Typography variant="h4" color="primary">
                    {meetings.length}
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
                <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">완료</Typography>
                  <Typography variant="h4" color="success.main">
                    {meetings.filter(m => m.status === 'completed').length}
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
                  <Typography variant="h6">처리중</Typography>
                  <Typography variant="h4" color="warning.main">
                    {meetings.filter(m => m.status === 'processing').length}
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
                <WarningIcon color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">오류</Typography>
                  <Typography variant="h4" color="error.main">
                    {meetings.filter(m => m.status === 'error').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 회의 목록 */}
      <Grid container spacing={3}>
        {meetings.map((meeting) => (
          <Grid item xs={12} md={6} key={meeting.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {meeting.title}
                  </Typography>
                  <Chip
                    label={statusLabels[meeting.status]}
                    color={statusColors[meeting.status]}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {meeting.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    날짜: {meeting.date}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    참석자: {meeting.participants.join(', ')}
                  </Typography>
                </Box>

                {meeting.status === 'processing' && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      회의록 생성 중...
                    </Typography>
                    <LinearProgress />
                  </Box>
                )}

                {meeting.status === 'completed' && meeting.minutes && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      회의록 요약:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      bgcolor: 'grey.50', 
                      p: 2, 
                      borderRadius: 1,
                      maxHeight: 100,
                      overflow: 'auto'
                    }}>
                      {meeting.minutes}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  {!meeting.audio_file && meeting.status === 'scheduled' && (
                    <AudioUploader 
                      meetingId={meeting.id} 
                      onUpload={handleUploadAudio}
                    />
                  )}

                  {meeting.audio_file && meeting.status === 'processing' && (
                    <Button
                      variant="contained"
                      startIcon={<PlayIcon />}
                      onClick={() => handleProcessMeeting(meeting.id)}
                      disabled={isProcessing}
                      size="small"
                    >
                      회의록 생성
                    </Button>
                  )}

                  {meeting.status === 'completed' && (
                    <Button
                      variant="outlined"
                      startIcon={<AssignmentIcon />}
                      size="small"
                    >
                      회의록 보기
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 새 회의 생성 다이얼로그 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>새 회의 생성</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="회의 제목"
            fullWidth
            variant="outlined"
            value={newMeeting.title}
            onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="회의 설명"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newMeeting.description}
            onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="날짜"
            type="date"
            fullWidth
            variant="outlined"
            value={newMeeting.date}
            onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="참석자 (쉼표로 구분)"
            fullWidth
            variant="outlined"
            value={newMeeting.participants}
            onChange={(e) => setNewMeeting({ ...newMeeting, participants: e.target.value })}
            placeholder="김개발, 이디자인, 박기획"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleCreateMeeting} variant="contained">
            생성
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Meetings;
