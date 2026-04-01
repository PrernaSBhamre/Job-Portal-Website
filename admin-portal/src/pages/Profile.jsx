import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Avatar, 
  Typography, 
  Form, 
  Input, 
  Button, 
  message, 
  Divider, 
  Space, 
  Tabs,
  Skeleton
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  CameraOutlined, 
  SaveOutlined,
  KeyOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import api from '../utils/api';

const { Title, Text } = Typography;

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/profile');
      if (res.data.success) {
        setAdmin(res.data.admin);
        form.setFieldsValue(res.data.admin);
      }
    } catch (err) {
      message.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onUpdateProfile = async (values) => {
    try {
      setLoading(true);
      const res = await api.put('/admin/profile', values);
      if (res.data.success) {
        message.success('Profile updated successfully');
        // Update local storage too to reflect changes in Header
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...values };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setAdmin(updatedUser);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (values) => {
    try {
      setLoading(true);
      const res = await api.put('/admin/change-password', values);
      if (res.data.success) {
        message.success('Password changed successfully');
        passwordForm.resetFields();
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !admin) return <Skeleton active className="p-10" />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Title level={2} className="text-white mb-8 tracking-tight">Admin Profile</Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card className="bg-zinc-950 border-zinc-800/50 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex flex-col items-center text-center py-8">
              <div className="relative group cursor-pointer mb-6">
                <Avatar 
                  size={120} 
                  src={admin?.avatar} 
                  icon={<UserOutlined />} 
                  className="border-4 border-violet-500/20 shadow-2xl shadow-violet-600/10 group-hover:border-violet-500 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraOutlined className="text-white text-2xl" />
                </div>
              </div>
              <Title level={3} style={{ margin: 0, color: '#fff' }}>{admin?.fullname}</Title>
              <Text className="text-violet-400 font-bold uppercase tracking-widest text-[10px] mt-1">{admin?.role}</Text>
              
              <Divider className="border-zinc-800/50 my-6" />
              
              <div className="w-full space-y-4 px-4 text-left">
                <div className="flex items-center gap-3">
                  <MailOutlined className="text-zinc-500" />
                  <Text className="text-zinc-300 text-sm">{admin?.email}</Text>
                </div>
                <div className="flex items-center gap-3">
                  <SafetyOutlined className="text-zinc-500" />
                  <Text className="text-zinc-300 text-sm">Full Administrative Access</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card className="bg-zinc-950 border-zinc-800/50 rounded-3xl shadow-2xl p-2 h-full">
            <Tabs 
              defaultActiveKey="general" 
              className="profile-tabs"
              items={[
                {
                  key: 'general',
                  label: <span className="px-4 font-bold flex items-center gap-2"><UserOutlined /> General Information</span>,
                  children: (
                    <div className="p-6">
                      <Form form={form} layout="vertical" onFinish={onUpdateProfile} className="space-y-4">
                        <Row gutter={24}>
                          <Col span={24}>
                            <Form.Item 
                              name="fullname" 
                              label={<span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Full Name</span>}
                              rules={[{ required: true, message: 'Please enter your name' }]}
                            >
                              <Input prefix={<UserOutlined className="text-violet-500" />} className="zinc-input h-12" placeholder="Admin Name" />
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <Form.Item 
                              name="email" 
                              label={<span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Email Address</span>}
                              rules={[{ required: true, type: 'email', message: 'Valid email is required' }]}
                            >
                              <Input prefix={<MailOutlined className="text-violet-500" />} className="zinc-input h-12" placeholder="admin@example.com" />
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <Form.Item 
                              name="avatar" 
                              label={<span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Avatar URL</span>}
                            >
                              <Input placeholder="https://..." className="zinc-input h-12" />
                            </Form.Item>
                          </Col>
                        </Row>
                        <div className="flex justify-end pt-4">
                          <Button 
                            type="primary" 
                            htmlType="submit" 
                            icon={<SaveOutlined />} 
                            loading={loading}
                            className="bg-violet-600 hover:bg-violet-500 border-0 h-12 px-10 rounded-xl font-bold shadow-lg shadow-violet-600/20"
                          >
                            Save Profile Changes
                          </Button>
                        </div>
                      </Form>
                    </div>
                  )
                },
                {
                  key: 'security',
                  label: <span className="px-4 font-bold flex items-center gap-2"><LockOutlined /> Security & Password</span>,
                  children: (
                    <div className="p-6">
                      <Form form={passwordForm} layout="vertical" onFinish={onChangePassword} className="space-y-4">
                        <Form.Item 
                          name="oldPassword" 
                          label={<span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Current Password</span>}
                          rules={[{ required: true, message: 'Current password is required' }]}
                        >
                          <Input.Password prefix={<LockOutlined className="text-zinc-500" />} className="zinc-input h-12" placeholder="Enter current password" />
                        </Form.Item>
                        
                        <Divider className="border-zinc-800/30" />
                        
                        <Form.Item 
                          name="newPassword" 
                          label={<span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">New Password</span>}
                          rules={[{ required: true, message: 'New password is required' }, { min: 6, message: 'Minimum 6 characters' }]}
                        >
                          <Input.Password prefix={<KeyOutlined className="text-violet-500" />} className="zinc-input h-12" placeholder="Enter new password" />
                        </Form.Item>
                        
                        <div className="flex justify-end pt-4">
                          <Button 
                            type="primary" 
                            htmlType="submit" 
                            icon={<LockOutlined />} 
                            loading={loading}
                            className="bg-zinc-100 text-zinc-950 hover:bg-white border-0 h-12 px-10 rounded-xl font-bold shadow-xl"
                          >
                            Update Credentials
                          </Button>
                        </div>
                      </Form>
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      <style dangerouslySetInnerHTML={{ __html: `
        .zinc-input {
          background-color: #0c0c0e !important;
          border: 1px solid #18181b !important;
          color: white !important;
          border-radius: 12px !important;
        }
        .zinc-input:focus, .zinc-input:hover {
          border-color: #8b5cf6 !important;
          background-color: #000 !important;
        }
        .profile-tabs .ant-tabs-nav::before {
          border-bottom: 1px solid #18181b !important;
        }
        .profile-tabs .ant-tabs-tab {
          padding: 16px 0 !important;
          color: #71717a !important;
        }
        .profile-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #a78bfa !important;
        }
        .profile-tabs .ant-tabs-ink-bar {
          background: #8b5cf6 !important;
          height: 3px !important;
        }
      ` }} />
    </div>
  );
};

export default Profile;
