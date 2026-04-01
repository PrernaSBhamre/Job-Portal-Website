import React, { useState } from 'react';
import { 
  Card, 
  Switch, 
  Typography, 
  Row, 
  Col, 
  Space, 
  Button, 
  Select, 
  Input, 
  Divider, 
  App,
  Tooltip
} from 'antd';
import { 
  SettingOutlined, 
  GlobalOutlined, 
  SafetyCertificateOutlined, 
  BellOutlined, 
  AppstoreOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  BlockOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Settings = () => {
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    autoVerifyEmployers: true,
    emailNotifications: true,
    jobModeration: true,
    registrationOpen: true,
    platformFee: '0',
    currency: 'USD',
    adminEmail: 'admin@toolsjobs.com'
  });

  const handleToggle = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      notification.success({
        message: 'Settings Saved',
        description: 'System configurations have been updated and are propagating to all nodes.',
        placement: 'bottomRight',
        className: 'admin-notification-dark'
      });
    }, 1000);
  };

  const ConfigSection = ({ icon, title, description, children }) => (
    <Card className="bg-zinc-950 border-zinc-800/50 rounded-3xl overflow-hidden shadow-xl mb-6" styles={{ body: { padding: 0 } }}>
      <div className="flex flex-col md:flex-row gap-6 p-6">
        <div className="w-full md:w-1/3">
          <Space align="start" size={12} className="mb-4">
            <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center text-xl text-violet-500 border border-violet-500/20">
              {icon}
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#fff' }}>{title}</Title>
              <Text type="secondary" className="text-zinc-500 text-xs font-medium uppercase tracking-widest">{description}</Text>
            </div>
          </Space>
          <Paragraph className="text-zinc-500 text-sm italic pr-4">
            Customize how this module behaves across the entire platform.
          </Paragraph>
        </div>
        <Divider orientation="vertical" className="h-auto border-zinc-800/50 hidden md:block" />
        <div className="flex-1 space-y-6">
          {children}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Title level={2} className="text-white tracking-tight" style={{ margin: 0 }}>System Settings</Title>
          <Text type="secondary" className="text-zinc-500 font-medium">Global configurations and rules for the Tools & Jobs Ecosystem.</Text>
        </div>
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          size="large"
          loading={loading}
          onClick={handleSave}
          className="bg-violet-600 hover:bg-violet-500 border-0 shadow-lg shadow-violet-600/20 px-8 rounded-xl font-bold h-12"
        >
          Propagate All Changes
        </Button>
      </div>

      <ConfigSection 
        icon={<GlobalOutlined />} 
        title="Platform Governance" 
        description="Global Operation Rules"
      >
        <div className="flex items-center justify-between">
          <Space orientation="vertical" size={0}>
            <Text strong className="text-zinc-100">Maintenance Mode</Text>
            <Text className="text-zinc-500 text-xs">Puts the site in read-only mode for maintenance.</Text>
          </Space>
          <Switch 
            checked={settings.maintenanceMode} 
            onChange={(val) => handleToggle('maintenanceMode', val)}
            className="violet-switch"
          />
        </div>
        <Divider className="border-zinc-800/30 my-0" />
        <div className="flex items-center justify-between">
          <Space orientation="vertical" size={0}>
            <Text strong className="text-zinc-100">Account Registrations</Text>
            <Text className="text-zinc-500 text-xs">If disabled, new users cannot create accounts.</Text>
          </Space>
          <Switch 
            checked={settings.registrationOpen} 
            onChange={(val) => handleToggle('registrationOpen', val)}
            className="violet-switch"
          />
        </div>
      </ConfigSection>

      <ConfigSection 
        icon={<SafetyCertificateOutlined />} 
        title="Trust & Verification" 
        description="Security Thresholds"
      >
        <div className="flex items-center justify-between">
          <Space orientation="vertical" size={0}>
            <Text strong className="text-zinc-100">Auto-verify Employers</Text>
            <Text className="text-zinc-500 text-xs">Automatically verify companies upon registration.</Text>
          </Space>
          <Switch 
            checked={settings.autoVerifyEmployers} 
            onChange={(val) => handleToggle('autoVerifyEmployers', val)}
            className="violet-switch"
          />
        </div>
        <Divider className="border-zinc-800/30 my-0" />
        <div className="flex items-center justify-between">
          <Space orientation="vertical" size={0}>
            <Text strong className="text-zinc-100">Strict Job Moderation</Text>
            <Text className="text-zinc-500 text-xs">Every job post requires manual admin approval.</Text>
          </Space>
          <Switch 
            checked={settings.jobModeration} 
            onChange={(val) => handleToggle('jobModeration', val)}
            className="violet-switch"
          />
        </div>
      </ConfigSection>

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <ConfigSection 
            icon={<ThunderboltOutlined />} 
            title="Monetization" 
            description="Fee Configuration"
          >
            <Space direction="vertical" className="w-full" size={16}>
              <div>
                <Text type="secondary" className="text-xs font-bold uppercase mb-2 block tracking-wider">Currency</Text>
                <Select className="zinc-select w-full h-11" defaultValue="USD">
                  <Option value="USD">USD - US Dollar</Option>
                  <Option value="INR">INR - Indian Rupee</Option>
                  <Option value="EUR">EUR - Euro</Option>
                </Select>
              </div>
              <div>
                 <Text type="secondary" className="text-xs font-bold uppercase mb-2 block tracking-wider">Platform Referral Fee (%)</Text>
                 <Input className="zinc-input h-11" defaultValue="0" />
              </div>
            </Space>
          </ConfigSection>
        </Col>
        <Col xs={24} lg={12}>
          <ConfigSection 
            icon={<BellOutlined />} 
            title="Notifications" 
            description="Alert Thresholds"
          >
            <Space direction="vertical" className="w-full" size={16}>
               <div className="flex items-center justify-between">
                <Text strong className="text-zinc-100">Internal Alerts</Text>
                <Switch checked className="violet-switch" />
              </div>
              <div className="flex items-center justify-between">
                <Text strong className="text-zinc-100">User Email Streams</Text>
                <Switch checked={settings.emailNotifications} onChange={(val) => handleToggle('emailNotifications', val)} className="violet-switch" />
              </div>
              <div>
                 <Text type="secondary" className="text-xs font-bold uppercase mb-2 block tracking-wider">Primary System Contact</Text>
                 <Input className="zinc-input h-11" placeholder="admin@toolsjobs.com" defaultValue={settings.adminEmail} />
              </div>
            </Space>
          </ConfigSection>
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
        }
        .zinc-select .ant-select-selector {
          background-color: #0c0c0e !important;
          border: 1px solid #18181b !important;
          border-radius: 12px !important;
          color: white !important;
        }
        .violet-switch.ant-switch-checked {
          background: #8b5cf6 !important;
        }
        .admin-notification-dark {
          background-color: #0c0c0e !important;
          border: 1px solid #27272a !important;
          border-radius: 16px !important;
        }
        .admin-notification-dark .ant-notification-notice-message {
          color: #fff !important;
        }
        .admin-notification-dark .ant-notification-notice-description {
          color: #a1a1aa !important;
        }
      ` }} />
    </div>
  );
};

export default Settings;
