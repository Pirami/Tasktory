import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  FolderOpen as ProjectsIcon,
  AccountTree as WBSIcon,
  MeetingRoom as MeetingsIcon,
  Description as DocumentsIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  GroupAdd as GroupAddIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: '대시보드', icon: <DashboardIcon />, path: '/' },
  { text: '프로젝트', icon: <ProjectsIcon />, path: '/projects' },
  { text: 'WBS 생성', icon: <WBSIcon />, path: '/wbs-generator' },
  { text: '회의 관리', icon: <MeetingsIcon />, path: '/meetings' },
  { text: '문서 관리', icon: <DocumentsIcon />, path: '/documents' },
  { text: '팀원 관리', icon: <PeopleIcon />, path: '/team-management' },
  { text: '멤버 관리', icon: <GroupAddIcon />, path: '/project-member-management' },
  { text: '설정', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginTop: '64px',
          backgroundColor: '#fafafa',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', height: '100%' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#e3f2fd',
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? '#1976d2' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    color: location.pathname === item.path ? '#1976d2' : 'inherit',
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ marginTop: 'auto' }} />
        
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            n8n MCP 서버 기반<br />
            프로젝트 관리 자동화
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
