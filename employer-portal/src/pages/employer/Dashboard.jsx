import React from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Empty, Spin } from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  UserOutlined, 
  RiseOutlined 
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import { useQuery } from 'react-query';
import api from '../../api/recruiter';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { data, isLoading, error } = useQuery(['recruiterStats'], () => api.get('/stats'), {
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Loading dashboard stats..." />
      </div>
    );
  }

  const { stats, charts } = data || { 
    stats: { totalJobs: 0, activeJobs: 0, totalApplicants: 0, applicantsToday: 0 },
    charts: { trends: [], jobStatus: [] }
  };

  const lineConfig = {
    data: charts?.trends || [],
    padding: 'auto',
    xField: 'date',
    yField: 'count',
    smooth: true,
    point: { size: 5, shape: 'diamond' },
    label: { style: { fill: '#aaa' } },
  };

  const pieConfig = {
    appendPadding: 10,
    data: charts?.jobStatus || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  const statsCards = [
    { title: 'Total Jobs', value: stats.totalJobs, icon: <FileTextOutlined />, color: '#1890ff' },
    { title: 'Active Jobs', value: stats.activeJobs, icon: <CheckCircleOutlined />, color: '#52c41a' },
    { title: 'Total Applicants', value: stats.totalApplicants, icon: <UserOutlined />, color: '#722ed1' },
    { title: 'Applicants Today', value: stats.applicantsToday, icon: <RiseOutlined />, color: '#fa8c16' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-transparent">
        <div>
          <Title level={2} className="m-0">Recruiter Dashboard</Title>
          <Text type="secondary">Welcome back! Here is a summary of your hiring performance.</Text>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        {statsCards.map((item, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card className="dashboard-card border-none shadow-sm" bordered={false}>
              <div className="flex items-center">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                  style={{ backgroundColor: `${item.color}10`, color: item.color, fontSize: '24px' }}
                >
                  {item.icon}
                </div>
                <Statistic title={item.title} value={item.value} valueStyle={{ fontWeight: 'bold' }} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title={<div className="flex items-center"><RiseOutlined className="mr-2" /> Application Trends (Last 7 Days)</div>} 
            className="border-none shadow-sm"
          >
            {charts?.trends?.length > 0 ? (
              <Line {...lineConfig} height={300} />
            ) : (
              <Empty description="No data available for applicant trends yet." className="py-12" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={<div className="flex items-center"><FileTextOutlined className="mr-2" /> Job Status Distribution</div>} 
            className="border-none shadow-sm"
          >
            {charts?.jobStatus?.length > 0 ? (
              <Pie {...pieConfig} height={300} />
            ) : (
              <Empty description="No jobs posted yet." className="py-12" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Applications Placeholder */}
      <Card title="Quick Insights" className="border-none shadow-sm">
        <div className="text-center py-8">
          <Text type="secondary">
            Your most recent applications will appear here once job seekers start applying to your approved listings.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
