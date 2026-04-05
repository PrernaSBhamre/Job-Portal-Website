import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Tag, 
  Space, 
  Button, 
  Typography, 
  Tooltip, 
  Card, 
  Badge, 
  Empty, 
  message,
  Tabs,
  Skeleton
} from 'antd';
import { 
  MailOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  MessageOutlined,
  UserOutlined 
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/messages');
      setMessages(data);
    } catch (err) {
      message.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleResolve = async (id) => {
    try {
      await api.put(`/admin/messages/${id}/resolve`);
      message.success('Message resolved');
      fetchMessages();
    } catch (err) {
      message.error('Resolution failed');
    }
  };

  const columns = [
    {
      title: 'Sender Info',
      key: 'sender',
      render: (_, record) => (
        <Space size={12}>
          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-violet-400 border border-zinc-700">
            <UserOutlined />
          </div>
          <div className="flex flex-col">
            <Text strong className="text-zinc-100">{record.name}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Message Content',
      key: 'content',
      width: '40%',
      render: (_, record) => (
        <div className="flex flex-col py-2 gap-1">
          <Space>
            <Text strong className="text-violet-400 capitalize">{record.subject}</Text>
            {record.type && record.type !== 'inquiry' && (
              <Tag color="cyan" className="text-[9px] font-black uppercase border-0 bg-opacity-20 px-1.5 leading-tight">
                {record.type.replace('_', ' ')}
              </Tag>
            )}
          </Space>
          <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }} className="text-zinc-400 mb-0 italic">
            "{record.message}"
          </Paragraph>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <Badge 
          status={s === 'resolved' ? 'success' : 'processing'} 
          text={s === 'resolved' ? 'Resolved' : 'Unresolved'} 
          className={s === 'resolved' ? 'text-emerald-400' : 'text-amber-400'}
        />
      ),
    },
    {
      title: 'Sent On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <Text type="secondary">{dayjs(date).format('MMM DD, YYYY')}</Text>,
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        record.status === 'unresolved' && (
          <Button 
            type="primary" 
            ghost 
            size="small" 
            icon={<CheckCircleOutlined />} 
            onClick={() => handleResolve(record._id)}
            className="border-violet-500 text-violet-400 hover:text-white hover:bg-violet-600"
          >
            Mark Resolved
          </Button>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/50">
        <div>
          <Title level={3} style={{ margin: 0, color: '#fff' }}>Support Messages</Title>
          <Text type="secondary" className="text-zinc-500 font-medium">Address platform inquiries and resolve support tickets.</Text>
        </div>
      </div>

      <Card className="bg-zinc-950 border-zinc-800/50 rounded-2xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Tabs 
          onChange={(key) => setStatus(key)}
          className="admin-tabs px-6 pt-4"
          items={[
            { key: 'all', label: 'All Messages' },
            { key: 'unresolved', label: 'Unresolved' },
            { key: 'resolved', label: 'Resolved' },
          ]}
        />
        <div className="p-6">
          <Table 
            columns={columns} 
            dataSource={messages.filter(m => status === 'all' || m.status === status)} 
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 8, className: "admin-pagination px-4" }}
            className="admin-table-dark border-t border-zinc-800/50"
            locale={{ emptyText: <Empty description="No messages found" /> }}
          />
        </div>
      </Card>
    </div>
  );
};

export default AdminMessagesPage;
