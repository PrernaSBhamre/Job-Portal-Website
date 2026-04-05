import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Space, Skeleton, Empty, Button, Tooltip, App } from 'antd';
import { 
  UserOutlined, 
  SafetyCertificateOutlined, 
  FileTextOutlined, 
  ShopOutlined, 
  RiseOutlined, 
  FallOutlined, 
  SyncOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  AuditOutlined,
  DollarOutlined,
  AlertOutlined 
} from '@ant-design/icons';
import { Area, Pie } from '@ant-design/plots';
import api from '../utils/api';
import dayjs from 'dayjs';
import { BookOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds for specific "Dynamic" behavior
    const interval = setInterval(() => {
      fetchStats(true); // pass true to skip full loading state if desired
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async (isPoll = false) => {
    try {
      if (!isPoll) setLoading(true);
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setData(res.data);
        if (isPoll && (res.data.fraudDetection?.newlyFlaggedUsers > 0 || res.data.fraudDetection?.newlyFlaggedJobs > 0)) {
          notification.warning({
            title: 'New Security Alerts',
            description: `Detected ${res.data.fraudDetection.newlyFlaggedUsers} suspicious users and ${res.data.fraudDetection.newlyFlaggedJobs} suspicious jobs.`
          });
        }
      }
    } catch (err) {
      if (!isPoll) {
        notification.error({
          title: 'Stats Loading Failed',
          description: err.response?.data?.message || 'Failed to fetch dashboard data.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: data?.totals?.users, icon: <UserOutlined />, color: '#8b5cf6', trend: '+12%', up: true },
    { title: 'Employers', value: data?.totals?.employers, icon: <ShopOutlined />, color: '#0ea5e9', trend: '+5%', up: true },
    { title: 'Active Jobs', value: data?.totals?.approvedJobs, icon: <FileTextOutlined />, color: '#10b981', trend: '+18%', up: true },
    { title: 'Pending Review', value: data?.totals?.pendingJobs, icon: <ClockCircleOutlined />, color: '#f59e0b', trend: 'Waitlist', up: false },
    { title: 'Applications', value: data?.totals?.applications, icon: <AuditOutlined />, color: '#ec4899', trend: '+24%', up: true },
    { title: 'Revenue Total', value: `$${data?.totals?.totalRevenue?.toLocaleString()}`, icon: <DollarOutlined />, color: '#10b981', trend: 'Lifetime', up: true },
    { title: 'Revenue Today', value: `$${data?.totals?.revenueToday?.toLocaleString()}`, icon: <RiseOutlined />, color: '#8b5cf6', trend: 'Daily', up: true },
    { title: 'Reports', value: data?.totals?.unresolvedReports, icon: <AlertOutlined />, color: '#ef4444', trend: 'Critical', up: false },
  ];

  const recentUserColumns = [
    {
      title: 'User',
      dataIndex: 'fullname',
      key: 'fullname',
      render: (text, record) => (
        <Space>
          <Text strong className="text-zinc-200">{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>({record.email})</Text>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'employer' || role === 'recruiter' ? 'blue' : 'purple'} className="capitalize border-0 bg-opacity-20">
          {role}
        </Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Space>
          {record.isVerified ? <Tag color="success">Verified</Tag> : <Tag color="warning">Pending</Tag>}
          {record.isBlocked && <Tag color="error">Blocked</Tag>}
        </Space>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
  ];

  const trendsConfig = {
    data: data?.trends || [],
    xField: '_id',
    yField: 'count',
    style: {
      fill: 'linear-gradient(-90deg, #000000 0%, #8b5cf6 50%, #8b5cf6 100%)',
      fillOpacity: 0.6,
      lineWidth: 2,
      stroke: '#8b5cf6',
    },
    axis: {
      y: { labelFormatter: (v) => `${v}` },
    },
  };

  const roleConfig = {
    data: data?.roleDistribution || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      text: (d) => `${d.value}`,
      position: 'inside',
      style: {
        fontSize: 14,
        fontWeight: 'bold',
      }
    },
    legend: {
      color: {
        position: 'bottom',
        layout: 'horizontal',
      }
    },
    style: {
      stroke: '#fff',
      inset: 1,
      radius: 10,
    },
  };

  if (loading && !data) return <Skeleton active className="p-10" />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-xl">
        <div>
          <Title level={2} style={{ margin: 0, letterSpacing: '-1px' }}>Dashboard Overview</Title>
          <Text type="secondary" className="text-zinc-500">Welcome back, Admin. Here's what's happening today.</Text>
        </div>
        <Button 
          type="primary" 
          icon={<SyncOutlined spin={loading} />} 
          onClick={fetchStats}
          className="bg-violet-600 hover:bg-violet-500 border-0 h-10 px-6 rounded-lg font-medium shadow-lg shadow-violet-600/20"
        >
          Refresh Stats
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {statCards.map((card, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card className="bg-zinc-950 border-zinc-800/50 hover:border-violet-500/50 transition-all rounded-2xl group overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <Text type="secondary" className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-600 group-hover:text-emerald-400 transition-colors">
                    {card.title}
                  </Text>
                  <div className="text-4xl font-black mt-2 text-white tracking-tighter">
                    {loading ? <Skeleton.Input size="small" active /> : card.value?.toLocaleString() || 0}
                  </div>
                  <div className={`flex items-center gap-1 mt-2 text-sm ${card.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {card.up ? <RiseOutlined /> : <FallOutlined />}
                    <span className="font-semibold">{card.trend}</span>
                    <span className="text-zinc-600 ml-1">vs last month</span>
                  </div>
                </div>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${card.color}15`, color: card.color }}
                >
                  {card.icon}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 opacity-5 group-hover:opacity-10 transition-opacity">
                {card.icon}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={16}>
          <Card 
            title={<Title level={4} style={{ margin: 0, color: '#fff' }}>Job Posting Trends</Title>}
            className="bg-zinc-950 border-zinc-800/50 rounded-2xl h-full shadow-lg"
          >
            {data?.trends?.length > 0 ? (
              <Area {...trendsConfig} height={300} />
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <Empty description="Insufficient trend data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card 
            title={<Title level={4} style={{ margin: 0, color: '#fff' }}>User Composition</Title>}
            className="bg-zinc-950 border-zinc-800/50 rounded-2xl h-full shadow-lg"
          >
             <Pie {...roleConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Action Queues Section */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined className="text-orange-400" />
                <Title level={4} style={{ margin: 0, color: '#fff' }}>Pending Jobs Queue</Title>
              </Space>
            }
            className="bg-zinc-950 border-zinc-800/50 rounded-2xl shadow-lg"
          >
            <Table 
              columns={[
                { title: 'Job Title', dataIndex: 'title', key: 'title', render: (t) => <Text strong className="text-zinc-200">{t}</Text> },
                { title: 'Company', dataIndex: ['company', 'name'], key: 'company' },
                { title: 'Posted', dataIndex: 'createdAt', key: 'createdAt', render: (d) => dayjs(d).fromNow() },
                { title: 'Action', key: 'action', render: (_, r) => <Button type="link" size="small" href={`/admin/jobs?id=${r._id}`}>Review</Button> }
              ]} 
              dataSource={data?.actionQueue?.pendingJobs || []} 
              pagination={false}
              size="small"
              className="admin-table-dark"
              rowKey="_id"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <AlertOutlined className="text-rose-400" />
                <Title level={4} style={{ margin: 0, color: '#fff' }}>Reports Review Queue</Title>
              </Space>
            }
            className="bg-zinc-950 border-zinc-800/50 rounded-2xl shadow-lg"
          >
            <Table 
              columns={[
                { title: 'Subject', dataIndex: 'subject', key: 'subject', render: (t) => <Text strong className="text-zinc-200">{t}</Text> },
                { title: 'Type', dataIndex: 'type', key: 'type', render: (t) => <Tag color="error">{t}</Tag> },
                { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (d) => dayjs(d).format('DD MMM') },
                { title: 'Action', key: 'action', render: (_, r) => <Button type="link" size="small">Resolve</Button> }
              ]} 
              dataSource={data?.actionQueue?.pendingReports || []} 
              pagination={false}
              size="small"
              className="admin-table-dark"
              rowKey="_id"
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <div className="flex justify-between items-center py-2">
            <Title level={4} style={{ margin: 0, color: '#fff' }}>Recent User Activity</Title>
            <Button type="link" className="text-violet-400 flex items-center gap-1 hover:text-violet-300">
              View All <ArrowRightOutlined size={12} />
            </Button>
          </div>
        }
        className="bg-zinc-950 border-zinc-800/50 rounded-2xl shadow-lg"
      >
        <Table 
          columns={recentUserColumns} 
          dataSource={data?.recent?.users || []} 
          pagination={false}
          className="admin-table-dark"
          rowKey="_id"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
