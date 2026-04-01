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
  Modal, 
  Form, 
  message, 
  Popconfirm,
  Tooltip,
  Empty,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  BookOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  LinkOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CATEGORIES = [
  'Interview Prep',
  'Career Advice',
  'Technical Skills',
  'Soft Skills',
  'Resume Building',
  'Industry Insights'
];

const ResourcesManager = () => {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    category: 'all'
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [form] = Form.useForm();

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/resources', { params });
      if (res.data.success) {
        setResources(res.data.resources);
        setTotal(res.data.pagination.totalResources);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [params]);

  const showModal = (resource = null) => {
    setEditingResource(resource);
    if (resource) {
      form.setFieldsValue(resource);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingResource(null);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      if (editingResource) {
        await api.put(`/admin/resources/${editingResource._id}`, values);
        message.success('Resource updated successfully');
      } else {
        await api.post('/admin/resources', values);
        message.success('Resource created successfully');
      }
      handleCancel();
      fetchResources();
    } catch (err) {
      message.error(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/resources/${id}`);
      message.success('Resource deleted');
      fetchResources();
    } catch (err) {
      message.error('Delete failed');
    }
  };

  const columns = [
    {
      title: 'Resource Details',
      key: 'resource',
      width: '40%',
      render: (_, record) => (
        <Space size={16} align="start">
          <div className="w-12 h-12 bg-violet-600/10 rounded-xl flex items-center justify-center text-xl text-violet-500 border border-violet-500/20">
            <BookOutlined />
          </div>
          <div className="flex flex-col gap-1">
            <Text strong className="text-zinc-100 text-base tracking-tight">{record.title}</Text>
            <Space className="text-zinc-500 text-xs font-medium">
              <Tag color="blue" className="rounded-md border-0 bg-opacity-10 px-2 uppercase text-[9px] font-bold tracking-wider">
                {record.category}
              </Tag>
              <Space size={4}><ClockCircleOutlined className="text-[10px]" /> {record.readTime}</Space>
              <Space size={4}><UserOutlined className="text-[10px]" /> {record.author}</Space>
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: 'Content Excerpt',
      dataIndex: 'content',
      key: 'content',
      render: (content) => (
        <Paragraph ellipsis={{ rows: 2 }} className="text-zinc-500 text-xs mb-0 italic max-w-xs">
          {content}
        </Paragraph>
      ),
    },
    {
      title: 'Date Modified',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
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
      render: (_, record) => (
        <Space>
          <Tooltip title="Preview Content">
             <Button 
                type="text" 
                icon={<EyeOutlined />} 
                className="text-zinc-400 hover:text-violet-400"
                onClick={() => {
                  Modal.info({
                    title: record.title,
                    width: 700,
                    content: (
                      <div className="py-4 pr-4">
                        <Tag color="purple" className="mb-4">{record.category}</Tag>
                        <Paragraph className="text-zinc-100 whitespace-pre-wrap">{record.content}</Paragraph>
                        <div className="mt-6 flex justify-between text-zinc-500 text-xs">
                           <span>Author: {record.author}</span>
                           <span>Last Updated: {dayjs(record.updatedAt).format('MMMM DD, YYYY')}</span>
                        </div>
                      </div>
                    ),
                    className: 'preview-modal-dark'
                  });
                }}
             />
          </Tooltip>
          <Tooltip title="Edit Resource">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => showModal(record)} 
              className="text-zinc-400 hover:text-violet-400"
            />
          </Tooltip>
          <Popconfirm 
            title="Delete this resource?" 
            onConfirm={() => handleDelete(record._id)} 
            okText="Yes, delete" 
            cancelText="No" 
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              className="text-zinc-400 hover:text-rose-400"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/50">
        <div>
          <Title level={3} style={{ margin: 0, color: '#fff' }}>Resources Manager</Title>
          <Text type="secondary" className="text-zinc-500 font-medium">Control educational content, guides, and career advice for members.</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          className="bg-violet-600 hover:bg-violet-500 border-0 shadow-lg shadow-violet-600/20 px-6 rounded-xl font-bold h-12"
          onClick={() => showModal()}
        >
          Add New Resource
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
        <Space size={16} wrap>
          <Input 
            placeholder="Search resources..." 
            prefix={<SearchOutlined className="text-violet-500" />} 
            className="w-80 bg-zinc-900 border-0 text-white placeholder:text-zinc-600 h-10"
            onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
            allowClear
          />
          <Select 
            defaultValue="all" 
            style={{ width: 180 }} 
            className="zinc-select"
            onChange={(val) => setParams({ ...params, category: val, page: 1 })}
          >
            <Option value="all">All Categories</Option>
            {CATEGORIES.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </Space>
        <Text type="secondary" className="text-zinc-500 font-medium">{total} total resources found</Text>
      </div>

      <Card className="bg-zinc-950 border-zinc-800/50 rounded-2xl shadow-xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={resources} 
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
          locale={{ emptyText: <Empty description="No resources published yet" /> }}
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2 text-white">
            <BookOutlined className="text-violet-500" />
            <span>{editingResource ? 'Edit Resource' : 'Publish New Resource'}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose={false}
        destroyOnHidden
        wrapClassName="admin-modal-dark"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ author: 'FresherHub Editorial', readTime: '5 min read' }}
          className="pt-4"
        >
          <Row gutter={24}>
            <Col span={16}>
              <Form.Item 
                name="title" 
                label="Resource Title" 
                rules={[{ required: true, message: 'Title is required' }]}
              >
                <Input placeholder="e.g. Master the Behavioral Interview" className="zinc-input" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="category" 
                label="Category" 
                rules={[{ required: true, message: 'Category is required' }]}
              >
                <Select placeholder="Select category" className="zinc-select-v2">
                  {CATEGORIES.map(cat => (
                    <Option key={cat} value={cat}>{cat}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item 
                name="readTime" 
                label="Read Time" 
                rules={[{ required: true, message: 'Read time is required' }]}
              >
                <Input placeholder="e.g. 5 min read" className="zinc-input" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="author" 
                label="Author" 
                rules={[{ required: true, message: 'Author is required' }]}
              >
                <Input placeholder="Author name" className="zinc-input" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="imageUrl" label="Thumbnail Image URL">
                <Input placeholder="https://..." prefix={<LinkOutlined />} className="zinc-input" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="content" 
            label="Resource Content" 
            rules={[{ required: true, message: 'Content is required' }]}
          >
            <TextArea 
              rows={8} 
              placeholder="Write your resource content here... Supports plain text and line breaks." 
              className="zinc-input"
            />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={handleCancel} className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
              Discard Changes
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="bg-violet-600 hover:bg-violet-500 border-0 px-8"
            >
              {editingResource ? 'Save Updates' : 'Publish Resource'}
            </Button>
          </div>
        </Form>
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-modal-dark .ant-modal-content {
          background-color: #0c0c0e !important;
          border: 1px solid #27272a !important;
          border-radius: 20px !important;
        }
        .admin-modal-dark .ant-modal-header {
          background-color: transparent !important;
          border-bottom: 1px solid #18181b !important;
          padding: 20px 24px !important;
        }
        .admin-modal-dark .ant-modal-close {
          color: #71717a !important;
        }
        .zinc-input {
          background-color: #09090b !important;
          border: 1px solid #27272a !important;
          color: white !important;
          border-radius: 8px !important;
        }
        .zinc-input:focus, .zinc-input:hover {
          border-color: #8b5cf6 !important;
        }
        .zinc-select-v2 .ant-select-selector {
          background-color: #09090b !important;
          border: 1px solid #27272a !important;
          border-radius: 8px !important;
          color: white !important;
        }
        .preview-modal-dark .ant-modal-content {
          background-color: #09090b !important;
          border-radius: 20px !important;
        }
        .ant-form-item-label label {
          color: #a1a1aa !important;
          font-weight: 600 !important;
          font-size: 13px !important;
        }
      ` }} />
    </div>
  );
};

export default ResourcesManager;
