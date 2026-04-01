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
  Avatar, 
  Tooltip, 
  Popconfirm, 
  message,
  Tabs,
  Badge,
  Dropdown
} from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  CheckCircleOutlined, 
  StopOutlined, 
  DeleteOutlined, 
  EditOutlined,
  FilterOutlined,
  MoreOutlined,
  MailOutlined,
  TeamOutlined,
  ShopOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const Users = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: 'jobSeeker',
    status: 'all'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users', { params });
      if (res.data.success) {
        setUsers(res.data.users);
        setTotal(res.data.pagination.totalUsers);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [params]);

  const handleStatusUpdate = async (id, updates) => {
    try {
      const res = await api.put(`/admin/users/${id}/status`, updates);
      if (res.data.success) {
        message.success(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      message.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/admin/users/${id}`);
      if (res.data.success) {
        message.success('User deleted');
        fetchUsers();
      }
    } catch (err) {
      message.error('Delete failed');
    }
  };

  const columns = [
    {
      title: 'Member Identity',
      key: 'user',
      render: (_, record) => (
        <Space size={16}>
          <div className="relative">
            <Avatar 
              src={record.profilePhoto} 
              icon={<UserOutlined />} 
              className="bg-zinc-900 border-2 border-emerald-500/20 shadow-xl" 
              size={52}
            />
            {record.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center border-2 border-[#000000]">
                <CheckCircleOutlined className="text-[10px] text-white" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <Text strong className="text-zinc-100 text-base tracking-tight">{record.fullname}</Text>
            <Text type="secondary" className="text-zinc-500 font-medium text-xs mt-0.5">{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Trust Status',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (verified) => (
        <Tag color={verified ? 'purple' : 'orange'} className="rounded-lg border-0 bg-opacity-10 px-3 uppercase text-[10px] font-black tracking-widest">
          {verified ? 'Trusted' : 'Unverified'}
        </Tag>
      ),
    },
    {
      title: 'Access Control',
      dataIndex: 'isBlocked',
      key: 'isBlocked',
      render: (blocked) => (
        <Tag color={blocked ? 'red' : 'blue'} className="rounded-lg border-0 bg-opacity-10 px-3 uppercase text-[10px] font-black tracking-widest">
          {blocked ? 'Blocked' : 'Full Access'}
        </Tag>
      ),
    },
    {
      title: 'Registration',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <div className="flex flex-col">
          <Text className="text-zinc-400 font-bold text-xs">{dayjs(date).format('MMM DD, YYYY')}</Text>
          <Text className="text-zinc-600 text-[10px]">{dayjs(date).fromNow()}</Text>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => {
        const actionMenu = {
          items: [
            {
              key: 'verify',
              icon: record.isVerified ? <StopOutlined /> : <CheckCircleOutlined />,
              label: record.isVerified ? 'Unverify' : 'Verify User',
              onClick: () => handleStatusUpdate(record._id, { isVerified: !record.isVerified }),
            },
            {
              key: 'block',
              icon: <StopOutlined />,
              label: record.isBlocked ? 'Unblock' : 'Block User',
              danger: !record.isBlocked,
              onClick: () => handleStatusUpdate(record._id, { isBlocked: !record.isBlocked }),
            },
            {
              type: 'divider',
            },
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              label: 'Delete Forever',
              danger: true,
              onClick: () => handleDelete(record._id)
            },
          ],
        };

        return (
          <Space>
            <Tooltip title="Send Email">
              <Button type="text" icon={<MailOutlined />} className="text-zinc-500" />
            </Tooltip>
            <Dropdown menu={actionMenu} trigger={['click']}>
              <Button type="text" icon={<MoreOutlined />} className="text-zinc-500" />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/50">
        <div>
          <Title level={3} style={{ margin: 0, color: '#fff' }}>User Management</Title>
          <Text type="secondary" className="text-zinc-500 font-medium">Oversee platform members, job seekers and organizational partners.</Text>
        </div>
        <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800/50">
          <Input 
            placeholder="Search members..." 
            prefix={<SearchOutlined className="text-violet-500 mr-2" />} 
            className="w-80 bg-zinc-950 border-0 text-white placeholder:text-zinc-600 h-9"
            onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
            allowClear
          />
        </div>
      </div>

      <Card 
        className="bg-zinc-950 border-zinc-800/50 rounded-2xl shadow-xl overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        <Tabs 
          activeKey={params.role}
          onChange={(key) => setParams({ ...params, role: key, page: 1 })}
          className="admin-tabs px-6 pt-4"
          items={[
            {
              key: 'jobSeeker',
              label: (
                <Space>
                  <TeamOutlined />
                  <span>Job Seekers</span>
                </Space>
              ),
            },
            {
              key: 'employer',
              label: (
                <Space>
                  <ShopOutlined />
                  <span>Employers</span>
                </Space>
              ),
            },
          ]}
        />
        
        <div className="p-6">
          <div className="flex justify-between mb-6">
            <Space size={16}>
              <Text className="text-zinc-400">Filters:</Text>
              <Select 
                defaultValue="all" 
                style={{ width: 140 }} 
                className="zinc-select"
                onChange={(val) => setParams({ ...params, status: val, page: 1 })}
              >
                <Option value="all">All Status</Option>
                <Option value="verified">Verified Only</Option>
                <Option value="unverified">Unverified</Option>
                <Option value="blocked">Blocked</Option>
              </Select>
            </Space>
            <Text type="secondary">{total} Total found</Text>
          </div>

          <Table 
            columns={columns} 
            dataSource={users} 
            rowKey="_id"
            loading={loading}
            pagination={{
              total: total,
              current: params.page,
              pageSize: params.limit,
              onChange: (page) => setParams({ ...params, page }),
              showSizeChanger: true,
              className: "admin-pagination px-4"
            }}
            className="admin-table-dark border-t border-zinc-800/50"
          />
        </div>
      </Card>
    </div>
  );
};

export default Users;
