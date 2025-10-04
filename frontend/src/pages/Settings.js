import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Api as ApiIcon,
  Storage as StorageIcon,
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axios from 'axios';

const Settings = () => {
  const [settings, setSettings] = useState({
    // API 설정
    openai_api_key: '',
    n8n_mcp_server_url: 'http://localhost:5678',
    n8n_mcp_api_key: '',
    n8n_mcp_workflow_id: 'n8n-mcp-llm-workflow',
    
    // 데이터베이스 설정
    database_url: 'sqlite:///./tasktory.db',
    
    // 외부 서비스 연동
    jira_url: '',
    jira_username: '',
    jira_api_token: '',
    confluence_url: '',
    confluence_username: '',
    confluence_api_token: '',
    notion_api_key: '',
    notion_database_id: '',
    
    // 알림 설정
    email_notifications: true,
    slack_notifications: false,
    slack_webhook_url: '',
    
    // 시스템 설정
    auto_backup: true,
    log_level: 'INFO',
    max_file_size: '100MB',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    // 실제 API에서 설정 로드
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get('/api/v1/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put('/api/v1/settings', settings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (service) => {
    try {
      const response = await axios.post('/api/v1/settings/test-connection', { service });
      setTestResult({ service, success: true, message: response.data.message });
    } catch (error) {
      setTestResult({ service, success: false, message: error.response?.data?.detail || '연결 실패' });
    }
    setOpenDialog(true);
  };

  const handleResetSettings = () => {
    if (window.confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
      setSettings({
        openai_api_key: '',
        n8n_mcp_server_url: 'http://localhost:5678',
        n8n_mcp_api_key: '',
        n8n_mcp_workflow_id: 'n8n-mcp-llm-workflow',
        database_url: 'sqlite:///./tasktory.db',
        jira_url: '',
        jira_username: '',
        jira_api_token: '',
        confluence_url: '',
        confluence_username: '',
        confluence_api_token: '',
        notion_api_key: '',
        notion_database_id: '',
        email_notifications: true,
        slack_notifications: false,
        slack_webhook_url: '',
        auto_backup: true,
        log_level: 'INFO',
        max_file_size: '100MB',
      });
    }
  };

  const SettingCard = ({ title, icon, children }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          시스템 설정
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadSettings}
          >
            새로고침
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : '설정 저장'}
          </Button>
        </Box>
      </Box>

      {saveStatus && (
        <Alert 
          severity={saveStatus === 'success' ? 'success' : 'error'} 
          sx={{ mb: 3 }}
        >
          {saveStatus === 'success' ? '설정이 성공적으로 저장되었습니다.' : '설정 저장에 실패했습니다.'}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* API 설정 */}
        <Grid item xs={12} md={6}>
          <SettingCard
            title="API 설정"
            icon={<ApiIcon color="primary" />}
          >
            <TextField
              fullWidth
              label="OpenAI API Key"
              type="password"
              value={settings.openai_api_key}
              onChange={(e) => setSettings({ ...settings, openai_api_key: e.target.value })}
              sx={{ mb: 2 }}
              helperText="GPT-4 모델 사용을 위한 API 키"
            />
            
            <TextField
              fullWidth
              label="n8n MCP Server URL"
              value={settings.n8n_mcp_server_url}
              onChange={(e) => setSettings({ ...settings, n8n_mcp_server_url: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="n8n MCP API Key"
              type="password"
              value={settings.n8n_mcp_api_key}
              onChange={(e) => setSettings({ ...settings, n8n_mcp_api_key: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="n8n MCP Workflow ID"
              value={settings.n8n_mcp_workflow_id}
              onChange={(e) => setSettings({ ...settings, n8n_mcp_workflow_id: e.target.value })}
            />
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => handleTestConnection('n8n')}
                size="small"
              >
                n8n 연결 테스트
              </Button>
            </Box>
          </SettingCard>
        </Grid>

        {/* 데이터베이스 설정 */}
        <Grid item xs={12} md={6}>
          <SettingCard
            title="데이터베이스 설정"
            icon={<StorageIcon color="secondary" />}
          >
            <TextField
              fullWidth
              label="데이터베이스 URL"
              value={settings.database_url}
              onChange={(e) => setSettings({ ...settings, database_url: e.target.value })}
              sx={{ mb: 2 }}
              helperText="SQLite: sqlite:///./tasktory.db 또는 PostgreSQL: postgresql://user:pass@host:port/db"
            />
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => handleTestConnection('database')}
                size="small"
              >
                데이터베이스 연결 테스트
              </Button>
            </Box>
          </SettingCard>
        </Grid>

        {/* Jira 설정 */}
        <Grid item xs={12} md={6}>
          <SettingCard
            title="Jira 연동"
            icon={<ApiIcon color="warning" />}
          >
            <TextField
              fullWidth
              label="Jira URL"
              value={settings.jira_url}
              onChange={(e) => setSettings({ ...settings, jira_url: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="https://your-domain.atlassian.net"
            />
            
            <TextField
              fullWidth
              label="Jira Username"
              value={settings.jira_username}
              onChange={(e) => setSettings({ ...settings, jira_username: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Jira API Token"
              type="password"
              value={settings.jira_api_token}
              onChange={(e) => setSettings({ ...settings, jira_api_token: e.target.value })}
            />
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => handleTestConnection('jira')}
                size="small"
              >
                Jira 연결 테스트
              </Button>
            </Box>
          </SettingCard>
        </Grid>

        {/* Confluence 설정 */}
        <Grid item xs={12} md={6}>
          <SettingCard
            title="Confluence 연동"
            icon={<ApiIcon color="info" />}
          >
            <TextField
              fullWidth
              label="Confluence URL"
              value={settings.confluence_url}
              onChange={(e) => setSettings({ ...settings, confluence_url: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="https://your-domain.atlassian.net"
            />
            
            <TextField
              fullWidth
              label="Confluence Username"
              value={settings.confluence_username}
              onChange={(e) => setSettings({ ...settings, confluence_username: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Confluence API Token"
              type="password"
              value={settings.confluence_api_token}
              onChange={(e) => setSettings({ ...settings, confluence_api_token: e.target.value })}
            />
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => handleTestConnection('confluence')}
                size="small"
              >
                Confluence 연결 테스트
              </Button>
            </Box>
          </SettingCard>
        </Grid>

        {/* Notion 설정 */}
        <Grid item xs={12} md={6}>
          <SettingCard
            title="Notion 연동"
            icon={<ApiIcon color="success" />}
          >
            <TextField
              fullWidth
              label="Notion API Key"
              type="password"
              value={settings.notion_api_key}
              onChange={(e) => setSettings({ ...settings, notion_api_key: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Notion Database ID"
              value={settings.notion_database_id}
              onChange={(e) => setSettings({ ...settings, notion_database_id: e.target.value })}
            />
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => handleTestConnection('notion')}
                size="small"
              >
                Notion 연결 테스트
              </Button>
            </Box>
          </SettingCard>
        </Grid>

        {/* 알림 설정 */}
        <Grid item xs={12} md={6}>
          <SettingCard
            title="알림 설정"
            icon={<NotificationsIcon color="primary" />}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.email_notifications}
                  onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                />
              }
              label="이메일 알림"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.slack_notifications}
                  onChange={(e) => setSettings({ ...settings, slack_notifications: e.target.checked })}
                />
              }
              label="Slack 알림"
            />
            
            {settings.slack_notifications && (
              <TextField
                fullWidth
                label="Slack Webhook URL"
                value={settings.slack_webhook_url}
                onChange={(e) => setSettings({ ...settings, slack_webhook_url: e.target.value })}
                sx={{ mt: 2 }}
              />
            )}
          </SettingCard>
        </Grid>

        {/* 시스템 설정 */}
        <Grid item xs={12}>
          <SettingCard
            title="시스템 설정"
            icon={<SecurityIcon color="secondary" />}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.auto_backup}
                      onChange={(e) => setSettings({ ...settings, auto_backup: e.target.checked })}
                    />
                  }
                  label="자동 백업"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="로그 레벨"
                  value={settings.log_level}
                  onChange={(e) => setSettings({ ...settings, log_level: e.target.value })}
                >
                  <MenuItem value="DEBUG">DEBUG</MenuItem>
                  <MenuItem value="INFO">INFO</MenuItem>
                  <MenuItem value="WARNING">WARNING</MenuItem>
                  <MenuItem value="ERROR">ERROR</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="최대 파일 크기"
                  value={settings.max_file_size}
                  onChange={(e) => setSettings({ ...settings, max_file_size: e.target.value })}
                >
                  <MenuItem value="10MB">10MB</MenuItem>
                  <MenuItem value="50MB">50MB</MenuItem>
                  <MenuItem value="100MB">100MB</MenuItem>
                  <MenuItem value="500MB">500MB</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleResetSettings}
              >
                설정 초기화
              </Button>
            </Box>
          </SettingCard>
        </Grid>
      </Grid>

      {/* 연결 테스트 결과 다이얼로그 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>연결 테스트 결과</DialogTitle>
        <DialogContent>
          {testResult && (
            <Alert severity={testResult.success ? 'success' : 'error'}>
              <Typography variant="body1">
                <strong>{testResult.service.toUpperCase()}</strong> 연결 테스트
              </Typography>
              <Typography variant="body2">
                {testResult.message}
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
