import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown, Space, Typography } from 'antd';
import {
  DesktopOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;

const EmployerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'http://localhost:5000/pages/auth/login.html';
  };

  const menuItems = [
    {
      key: '/employer/dashboard',
      icon: <DesktopOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/employer/jobs',
      icon: <FileOutlined />,
      label: 'My Jobs',
    },
    {
      key: '/employer/applicants',
      icon: <TeamOutlined />,
      label: 'All Applicants',
    },
    {
      key: '/employer/company',
      icon: <BankOutlined />,
      label: 'Company Profile',
    },
    {
      key: '/employer/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: 'Profile',
        icon: <UserOutlined />,
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
        danger: true,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
        theme="dark"
        className="shadow-xl"
      >
        <div className="flex items-center justify-center py-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            TJ
          </div>
          {!collapsed && <span className="ml-3 text-white font-bold text-lg tracking-tight">Tools & Jobs</span>}
        </div>
        <Menu 
          theme="dark" 
          selectedKeys={[location.pathname]} 
          mode="inline" 
          items={menuItems} 
          onClick={({ key }) => navigate(key)}
          className="mt-4"
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="shadow-sm"
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <Text strong className="text-sm">Recruiter Name</Text>
              <Text type="secondary" className="text-xs">Employer Portal</Text>
            </div>
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <Avatar 
                size="large" 
                icon={<UserOutlined />} 
                className="cursor-pointer bg-blue-500" 
              />
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
            className="shadow-md"
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Tools & Jobs ©{new Date().getFullYear()} Employer Portal. Professional Service.
        </Footer>
      </Layout>
    </Layout>
  );
};

export default EmployerLayout;
