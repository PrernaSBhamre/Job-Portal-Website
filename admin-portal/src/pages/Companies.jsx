import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Space, 
  Button, 
  Input, 
  Card, 
  Typography, 
  Avatar, 
  Tooltip, 
  Popconfirm, 
  message,
  Badge,
  Empty
} from 'antd';
import { 
  SearchOutlined, 
  CheckCircleOutlined, 
  StopOutlined, 
  DeleteOutlined, 
  GlobalOutlined,
  ShopOutlined,
  LinkOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Companies = () => {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/companies', { params });
      if (res.data.success) {
        setCompanies(res.data.companies);
        setTotal(res.data.pagination.totalCompanies);
      }
    } catch (err) {
      message.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [params]);

  const handleStatusUpdate = async (id, updates) => {
    try {
      const res = await api.put(`/admin/companies/${id}/status`, updates);
      if (res.data.success) {
        message.success(res.data.message);
        fetchCompanies();
      }
    } catch (err) {
      message.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/admin/companies/${id}`);
      if (res.data.success) {
        message.success('Company deleted');
        fetchCompanies();
      }
    } catch (err) {
      message.error('Delete failed');
    }
  };

  const columns = [
    {
      title: 'Partner Organization',
      key: 'company',
      render: (_, record) => (
        <Space size={16}>
          <Avatar 
            src={record.logo} 
            icon={<ShopOutlined />} 
            className="bg-zinc-900 border-2 border-violet-500/10 shadow-xl" 
            shape="square"
            size={56}
          />
          <div className="flex flex-col gap-0.5">
            <Text strong className="text-zinc-100 text-base tracking-tight">{record.name}</Text>
            <Space size={12} className="text-zinc-500 text-[11px] font-medium uppercase tracking-wider">
              <Space size={4}><EnvironmentOutlined className="text-violet-500/50" /> {record.location || 'Remote'}</Space>
              {record.website && (
                <a href={record.website} target="_blank" rel="noreferrer" className="text-violet-400 hover:text-violet-300 transition-colors">
                  <LinkOutlined /> Official Site
                </a>
              )}
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: 'Business Vertical',
      dataIndex: 'industry',
      key: 'industry',
      render: (industry) => <Tag color="zinc" className="border-0 bg-zinc-900 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{industry || 'General'}</Tag>,
    },
    {
      title: 'Trust Verified',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (verified) => (
        <Tag color={verified ? 'purple' : 'orange'} className="rounded-lg border-0 bg-opacity-10 px-3 uppercase text-[10px] font-black tracking-widest">
          {verified ? 'Official' : 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'userId',
      key: 'userId',
      render: (user) => (
        <div className="flex flex-col">
          <Text className="text-zinc-200">{user?.fullname}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>{user?.email}</Text>
        </div>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <Text type="secondary">{dayjs(date).format('MMM DD, YYYY')}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size={12}>
          <Tooltip title={record.isVerified ? 'Unverify' : 'Verify Company'}>
            <Button 
              type="text" 
              icon={record.isVerified ? <StopOutlined className="text-amber-500" /> : <CheckCircleOutlined className="text-emerald-500" />} 
              onClick={() => handleStatusUpdate(record._id, { isVerified: !record.isVerified })}
            />
          </Tooltip>
          <Popconfirm title="Delete company and its jobs?" onConfirm={() => handleDelete(record._id)} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
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
          <Title level={3} style={{ margin: 0, color: '#fff' }}>Company Oversight</Title>
          <Text type="secondary" className="text-zinc-500 font-medium">Authorize and verify organizational partners on the network.</Text>
        </div>
        <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800/50">
          <Input 
            placeholder="Search partners..." 
            prefix={<SearchOutlined className="text-violet-500 mr-2" />} 
            className="w-80 bg-zinc-950 border-0 text-white placeholder:text-zinc-600 h-9"
            onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
            allowClear
          />
        </div>
      </div>

      <Card className="bg-zinc-950 border-zinc-800/50 rounded-2xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={companies} 
          rowKey="_id"
          loading={loading}
          pagination={{
            total: total,
            current: params.page,
            pageSize: params.limit,
            onChange: (page) => setParams({ ...params, page }),
            className: "admin-pagination px-4"
          }}
          className="admin-table-dark"
          locale={{ emptyText: <Empty description="No companies found" /> }}
        />
      </Card>
    </div>
  );
};

export default Companies;
