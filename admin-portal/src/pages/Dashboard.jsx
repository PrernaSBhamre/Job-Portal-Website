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
  ArrowRightOutlined 
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

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      notification.error({
        message: 'Stats Loading Failed', // Using 'message' as some antd versions still use it, but antd App usually maps it.
        description: err.response?.data?.message || 'Failed to fetch dashboard data.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Users', value: data?.totals?.users, icon: <UserOutlined />, color: '#8b5cf6', trend: '+12%', up: true },
    { title: 'Employers', value: data?.totals?.employers, icon: <ShopOutlined />, color: '#0ea5e9', trend: '+5%', up: true },
    { title: 'Active Jobs', value: data?.totals?.approvedJobs, icon: <FileTextOutlined />, color: '#10b981', trend: '+18%', up: true },
    { title: 'Resources', value: data?.totals?.resources, icon: <BookOutlined />, color: '#f59e0b', trend: '+7%', up: true },
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
    smooth: true,
    padding: 'auto',
    areaStyle: () => ({
      fill: `l(270) 0:#000000 0.5:#8b5cf6 1:#8b5cf6`,
    }),
    color: '#8b5cf6',
  };

  const roleConfig = {
    appendPadding: 10,
    data: data?.roleDistribution || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 14,
      },
    },
    interactions: [{ type: 'element-active' }],
    color: ['#8b5cf6', '#0ea5e9', '#10b981'],
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
