import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';

const IntegrationStatusDialog = ({ 
  open, 
  onClose, 
  status, 
  service, 
  message, 
  details = null,
  isProcessing = false 
}) => {
  const getStatusIcon = () => {
    if (isProcessing) return <CircularProgress size={20} />;
    
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getStatusMessage = () => {
    if (isProcessing) {
      return `${service} 연동 처리 중...`;
    }
    
    switch (status) {
      case 'success':
        return `${service} 연동이 성공적으로 완료되었습니다!`;
      case 'error':
        return `${service} 연동 중 오류가 발생했습니다.`;
      case 'warning':
        return `${service} 연동이 부분적으로 완료되었습니다.`;
      default:
        return `${service} 연동 상태를 확인했습니다.`;
    }
  };

  const getServiceIcon = (serviceName) => {
    switch (serviceName?.toLowerCase()) {
      case 'jira':
        return <CloudDoneIcon />;
      case 'confluence':
        return <CloudDoneIcon />;
      case 'notion':
        return <CloudDoneIcon />;
      case 'n8n':
        return <SyncIcon />;
      default:
        return <CloudOffIcon />;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getServiceIcon(service)}
          <Typography variant="h6">
            {service} 연동 상태
          </Typography>
          <Chip 
            icon={getStatusIcon()}
            label={isProcessing ? '처리중' : status === 'success' ? '성공' : status === 'error' ? '실패' : '확인'}
            color={getStatusColor()}
            size="small"
          />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity={getStatusColor()} sx={{ mb: 2 }}>
          <Typography variant="body1" fontWeight="bold">
            {getStatusMessage()}
          </Typography>
          {message && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {message}
            </Typography>
          )}
        </Alert>

        {details && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              상세 정보:
            </Typography>
            <List dense>
              {Object.entries(details).map(([key, value]) => (
                <ListItem key={key}>
                  <ListItemIcon>
                    <InfoIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={key}
                    secondary={typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {status === 'success' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              ✅ 연동이 완료되었습니다. {service}에서 생성된 항목을 확인해보세요.
            </Typography>
          </Alert>
        )}

        {status === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              ❌ 연동에 실패했습니다. 설정을 확인하고 다시 시도해주세요.
            </Typography>
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          확인
        </Button>
        {status === 'error' && (
          <Button onClick={() => window.open('/settings', '_blank')} variant="outlined">
            설정 확인
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default IntegrationStatusDialog;

