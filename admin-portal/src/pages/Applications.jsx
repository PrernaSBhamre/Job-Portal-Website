import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Space, 
  Card, 
  Typography, 
  Avatar, 
  Tooltip, 
  message,
  Badge,
  Empty,
  Select
} from 'antd';
import { 
  FileTextOutlined, 
  UserOutlined, 
  SafetyCertificateOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExpandOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const Applications = () => {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    status: 'all'
  });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/applications', { params });
      if (res.data.success) {
        setApplications(res.data.applications);
        setTotal(res.data.pagination.totalApplications);
      }
    } catch (err) {
      message.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [params]);

  const columns = [
    {
      title: 'Applicant Identity',
      key: 'applicant',
      render: (_, record) => (
        <Space size={16}>
          <div className="relative">
            <Avatar 
              src={record.applicant?.profilePhoto} 
              icon={<UserOutlined />} 
              className="bg-zinc-900 border-2 border-violet-500/10 shadow-xl" 
              size={48}
            />
          </div>
          <div className="flex flex-col">
            <Text strong className="text-zinc-100 text-base tracking-tight">{record.applicant?.fullname}</Text>
            <Text type="secondary" className="text-zinc-500 font-medium text-xs mt-0.5">{record.applicant?.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Target Position',
      dataIndex: 'job',
      key: 'job',
      render: (job) => (
        <div className="flex flex-col gap-0.5">
          <Text strong className="text-violet-400 font-bold">{job?.title}</Text>
          <Text className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Ref: {job?._id?.slice(-8)}</Text>
        </div>
      ),
    },
    {
      title: 'Funnel Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'accepted') color = 'purple';
        if (status === 'pending') color = 'gold';
        if (status === 'rejected') color = 'rose';
        
        return (
          <Tag color={color} className="rounded-lg border-0 bg-opacity-10 px-3 uppercase text-[10px] font-black tracking-widest">
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Submission Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Space size={4} className="text-zinc-500">
          <ClockCircleOutlined size={12} />
          <Text type="secondary">{dayjs(date).format('MMM DD, YYYY HH:mm')}</Text>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size={12}>
          <Tooltip title="View Details">
            <Button type="text" icon={<ExpandOutlined className="text-zinc-500 hover:text-violet-400" />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/50">
        <div>
          <Title level={3} style={{ margin: 0, color: '#fff' }}>Application Oversight</Title>
          <Text type="secondary" className="text-zinc-500 font-medium">Monitor candidate flow and organizational hiring performance.</Text>
        </div>
        <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800/50">
          <Select 
            defaultValue="all" 
            style={{ width: 220 }} 
            className="zinc-select"
            onChange={(val) => setParams({ ...params, status: val, page: 1 })}
          >
            <Option value="all">Global Application Stream</Option>
            <Option value="pending">Awaiting Review</Option>
            <Option value="accepted">Successful Hires</Option>
            <Option value="rejected">Declined Applications</Option>
          </Select>
        </div>
      </div>

      <Card className="bg-zinc-950 border-zinc-800/50 rounded-2xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={applications} 
          rowKey="_id"
          loading={loading}
          pagination={{
            total: total,
            current: params.page,
            pageSize: params.limit,
            onChange: (page) => setParams({ ...params, page }),
            showTotal: (total) => <span className="text-zinc-500">{total} applications tracked</span>,
            className: "admin-pagination px-4"
          }}
          className="admin-table-dark"
          locale={{ emptyText: <Empty description="No applications found" /> }}
        />
      </Card>
    </div>
  );
};

export default Applications;
