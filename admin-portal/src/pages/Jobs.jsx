import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Space, 
  Button, 
  Input, 
  Select, 
  Card, 
  Typography, 
  Tooltip, 
  Popconfirm, 
  Badge,
  App,
} from 'antd';
import { 
  SearchOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  DeleteOutlined, 
  StarOutlined,
  StarFilled,
  EyeOutlined,
  BlockOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  AlertOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const Jobs = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: 'all'
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/jobs', { params });
      if (res.data.success) {
        setJobs(res.data.jobs);
        setTotal(res.data.pagination.totalJobs);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [params]);

  const handleStatusUpdate = async (id, updates) => {
    try {
      const res = await api.put(`/admin/jobs/${id}/status`, updates);
      if (res.data.success) {
        message.success(res.data.message);
        fetchJobs();
      }
    } catch (err) {
      message.error('Update failed');
    }
  };

  const handleSuspiciousToggle = async (id, isSuspicious) => {
    try {
      const res = await api.put(`/admin/jobs/${id}/status`, { isSuspicious });
      if (res.data.success) {
        message.success(isSuspicious ? 'Job flagged as suspicious' : 'Flag removed');
        fetchJobs();
      }
    } catch (err) {
      message.error('Toggle flag failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/admin/jobs/${id}`);
      if (res.data.success) {
        message.success('Job deleted');
        fetchJobs();
      }
    } catch (err) {
      message.error('Delete failed');
    }
  };

  const columns = [
    {
      title: 'Job Identifier',
      key: 'job',
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <Space>
             <Text strong className="text-zinc-100 text-base tracking-tight hover:text-violet-400 cursor-pointer transition-colors">
               {record.title}
             </Text>
             {record.isFeatured && (
               <Tag color="purple" className="border-0 bg-opacity-20 text-[9px] font-black uppercase tracking-tighter px-1.5 leading-tight">
                 Featured
               </Tag>
             )}
          </Space>
          <Space separator={<div className="w-1 h-1 bg-zinc-800 rounded-full" />} className="text-zinc-500 text-xs font-medium">
             <Space size={4}><ShopOutlined className="text-violet-500/50" /> {record.company?.name || 'Partner Org'}</Space>
             <Space size={4}><EnvironmentOutlined /> {record.location}</Space>
             <Space size={4}><DollarOutlined className="text-violet-500/50" /> {record.salary}</Space>
          </Space>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        let color = 'default';
        if (record.status === 'approved') color = 'purple';
        if (record.status === 'pending') color = 'gold';
        if (record.status === 'rejected') color = 'rose';
        if (record.status === 'closed') color = 'zinc';
        
        return (
          <Space direction="vertical" size={4}>
            <Tag color={color} className="rounded-lg border-0 bg-opacity-10 px-3 uppercase text-[10px] font-black tracking-widest">
              {record.status}
            </Tag>
            {record.isSuspicious && (
              <Tag color="red" className="rounded-lg border-0 bg-opacity-10 px-3 uppercase text-[10px] font-black tracking-widest">
                Suspicious
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Posted By',
      dataIndex: 'created_by',
      key: 'created_by',
      render: (user) => (
        <div className="flex flex-col">
          <Text className="text-zinc-200">{user?.fullname}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{user?.email}</Text>
        </div>
      ),
    },
    {
      title: 'Date Posted',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Text type="secondary">{dayjs(date).format('MMM DD, YYYY')}</Text>
      ),
    },
    {
      title: 'Moderation',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size={16}>
          {record.status === 'pending' && (
            <div className="flex bg-zinc-900/50 p-1 rounded-xl gap-1 border border-zinc-800/50">
              <Tooltip title="Approve">
                <Button 
                  type="text" 
                  size="small"
                  icon={<CheckCircleOutlined className="text-violet-500" />} 
                  onClick={() => handleStatusUpdate(record._id, { status: 'approved' })}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button 
                  type="text" 
                  size="small"
                  icon={<CloseCircleOutlined className="text-rose-500" />} 
                  onClick={() => handleStatusUpdate(record._id, { status: 'rejected' })}
                />
              </Tooltip>
            </div>
          )}

          <Tooltip title={record.isFeatured ? 'Unfeature' : 'Mark as Featured'}>
            <Button 
              type="text" 
              icon={record.isFeatured ? <StarFilled className="text-amber-500" /> : <StarOutlined className="text-zinc-500" />} 
              onClick={() => handleStatusUpdate(record._id, { isFeatured: !record.isFeatured })}
            />
          </Tooltip>

          {record.status === 'approved' && (
             <Tooltip title="Close Job">
                <Button 
                  type="text" 
                  icon={<BlockOutlined className="text-zinc-500" />} 
                  onClick={() => handleStatusUpdate(record._id, { status: 'closed' })}
                />
             </Tooltip>
          )}

          <Tooltip title={record.isSuspicious ? 'Remove Flag' : 'Flag as Suspicious'}>
            <Button 
              type="text" 
              icon={<AlertOutlined className={record.isSuspicious ? 'text-rose-500' : 'text-zinc-500'} />} 
              onClick={() => handleSuspiciousToggle(record._id, !record.isSuspicious)}
            />
          </Tooltip>

          <Popconfirm title="Delete this job forever?" onConfirm={() => handleDelete(record._id)} okText="Yes, delete" cancelText="No" okButtonProps={{ danger: true }}>
            <Button type="text" icon={<DeleteOutlined className="text-zinc-500 hover:text-rose-500" />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/50">
        <div>
          <Title level={3} style={{ margin: 0, color: '#fff' }}>Job Management</Title>
          <Text type="secondary" className="text-zinc-500 font-medium">Review, approve, and oversee job postings across the platform.</Text>
        </div>
        <Space size={16} className="bg-zinc-950 p-1 rounded-xl border border-zinc-800/50">
           <Input 
            placeholder="Search positions..." 
            prefix={<SearchOutlined className="text-violet-500 mr-2" />} 
            className="w-64 bg-zinc-950 border-0 text-white placeholder:text-zinc-600 h-9"
            onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
            allowClear
          />
          <Select 
            defaultValue="all" 
            style={{ width: 140 }} 
            className="zinc-select"
            onChange={(val) => setParams({ ...params, status: val, page: 1 })}
          >
            <Option value="all">All Jobs</Option>
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="closed">Closed</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="suspicious">Suspicious</Option>
          </Select>
        </Space>
      </div>

      <Card 
        className="bg-zinc-950 border-zinc-800/50 rounded-2xl shadow-xl overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        <Table 
          columns={columns} 
          dataSource={jobs} 
          rowKey="_id"
          loading={loading}
          pagination={{
            total: total,
            current: params.page,
            pageSize: params.limit,
            onChange: (page) => setParams({ ...params, page }),
            showTotal: (total) => <span className="text-zinc-500">{total} jobs total</span>,
            className: "admin-pagination px-4"
          }}
          className="admin-table-dark"
        />
      </Card>
    </div>
  );
};

export default Jobs;
