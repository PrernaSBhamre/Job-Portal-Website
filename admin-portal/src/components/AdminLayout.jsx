import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown, Space, Typography } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  FileTextOutlined,
  MessageOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  BookOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Drawer } from 'antd';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const location = useLocation();
  const {
    token: { colorPrimary, colorBgBase },
  } = theme.useToken();

  React.useEffect(() => {
    const handleUserUpdate = () => {
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };
    window.addEventListener('userUpdate', handleUserUpdate);
    return () => window.removeEventListener('userUpdate', handleUserUpdate);
  }, []);

  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'http://localhost:5000/pages/auth/login.html';
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <Link to="/users">Users</Link>,
    },
    {
      key: '/jobs',
      icon: <FileTextOutlined />,
      label: <Link to="/jobs">Job Management</Link>,
    },
    {
      key: '/companies',
      icon: <ShopOutlined />,
      label: <Link to="/companies">Employers/Companies</Link>,
    },
    {
      key: '/applications',
      icon: <SafetyCertificateOutlined />,
      label: <Link to="/applications">Applications Status</Link>,
    },
    {
      key: '/resources',
      icon: <BookOutlined />,
      label: <Link to="/resources">Resources Manager</Link>,
    },
    {
      key: '/messages',
      icon: <MessageOutlined />,
      label: <Link to="/messages">Support Messages</Link>,
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">My Profile</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">System Settings</Link>,
    },
  ];

  const userMenu = {
    items: [
      { key: 'profile', label: <Link to="/profile">My Profile</Link>, icon: <UserOutlined /> },
      { key: 'settings', label: <Link to="/settings">Settings</Link>, icon: <SettingOutlined /> },
      { type: 'divider' },
      { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, onClick: handleLogout, danger: true },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="md"
        collapsedWidth={0}
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
        width={280}
        className="border-r border-zinc-800/100 sidebar-premium hidden md:block"
        style={{ background: '#09090b' }}
      >
        <div className="flex items-center px-8 py-12 gap-4">
          <div className="w-11 h-11 bg-violet-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-600/30">
            <ShopOutlined className="text-white text-2xl" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <Text className="text-white font-black text-xl leading-none tracking-tight">Tools <span className="text-violet-500">&</span></Text>
              <Text className="text-zinc-500 font-bold text-lg leading-none mt-1">Jobs Portal</Text>
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="px-4 space-y-2 mt-4"
          style={{ background: 'transparent' }}
        />
      </Sider>
      <Layout>
        <Header className="px-6 flex items-center justify-between border-b border-zinc-800/50" style={{ background: '#09090b' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileVisible(true);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="text-zinc-400 hover:text-white"
          />
          
          <Space size={20}>
            <Button type="text" icon={<BellOutlined />} className="text-zinc-400" />
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <Space className="cursor-pointer hover:bg-zinc-800/50 p-1 px-2 rounded-lg transition-colors">
                <Avatar src={user.profilePhoto} icon={<UserOutlined />} className="bg-violet-600" />
                <div className="hidden md:block text-left leading-tight">
                  <div className="text-sm font-medium text-white">{user.fullname}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">{user.role}</div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          className="md:m-6 m-2 md:p-6 p-4 min-h-[280px] bg-transparent rounded-xl"
          style={{
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>

      <Drawer
        placement="left"
        onClose={() => setMobileVisible(false)}
        open={mobileVisible}
        width={280}
        styles={{ body: { padding: 0 } }}
        className="sidebar-premium-drawer"
        headerStyle={{ display: 'none' }}
      >
        <div style={{ background: '#09090b', height: '100%', borderRight: '1px solid #18181b' }}>
          <div className="flex items-center px-8 py-10 gap-4 mb-4">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
              <ShopOutlined className="text-white text-xl" />
            </div>
            <div className="flex flex-col">
              <Text className="text-white font-bold text-lg leading-none">Tools & Jobs</Text>
              <Text className="text-zinc-500 text-xs mt-1">Admin Portal</Text>
            </div>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={() => setMobileVisible(false)}
            className="px-4 space-y-1"
            style={{ background: 'transparent' }}
          />
        </div>
      </Drawer>
    </Layout>
  );
};

export default AdminLayout;
