import React, { useState } from 'react';
import { Table, Tag, Button, Card, Space, Input, Select, Typography, Modal, Form, Input as AntInput, Select as AntSelect, message } from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  TeamOutlined 
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/recruiter';

const { Title, Text } = Typography;
const { Option } = AntSelect;

const MyJobs = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery(['recruiterJobs', statusFilter, searchTerm], () => 
    api.get(`/jobs?status=${statusFilter}&search=${searchTerm}`)
  );

  const createJobMutation = useMutation((newJob) => api.post('/jobs', newJob), {
    onSuccess: () => {
      queryClient.invalidateQueries('recruiterJobs');
      setIsModalOpen(false);
      form.resetFields();
      message.success('Job posted successfully! Pending admin approval.');
    },
    onError: (err) => message.error(err.response?.data?.message || 'Failed to post job'),
  });

  const columns = [
    {
      title: 'Job Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'gold';
        if (status === 'approved') color = 'success';
        if (status === 'rejected') color = 'error';
        if (status === 'closed') color = 'default';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Applications',
      key: 'applicants',
      render: (_, record) => (
        <Space>
          <TeamOutlined className="text-blue-500" />
          <Text>{record.applications?.length || 0} Applied</Text>
        </Space>
      ),
    },
    {
      title: 'Posted On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/employer/jobs/${record._id}/applicants`)}
          >
            View Applicants
          </Button>
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  const onFinish = (values) => {
    createJobMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={3} className="m-0">Job Management</Title>
          <Text type="secondary">Create and monitor your listings.</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600"
        >
          Post New Job
        </Button>
      </div>

      <Card className="border-none shadow-sm h-full">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input 
            placeholder="Search by job title..." 
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:w-64"
          />
          <Select 
            defaultValue="all" 
            onChange={(val) => setStatusFilter(val)}
            className="sm:w-48"
          >
            <Option value="all">All Status</Option>
            <Option value="pending">Pending Approval</Option>
            <Option value="approved">Approved</Option>
            <Option value="closed">Closed</Option>
          </Select>
        </div>

        <Table 
          columns={columns} 
          dataSource={data?.jobs || []} 
          loading={isLoading}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          className="ant-table-professional"
        />
      </Card>

      <Modal 
        title={<Title level={4}>Create New Job Listing</Title>}
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={720}
      >
        <Form 
          form={form}
          layout="vertical" 
          onFinish={onFinish}
          requiredMark="optional"
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="title" label="Job Title" rules={[{ required: true }]}>
                <AntInput placeholder="e.g. Senior Frontend Developer" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="jobType" label="Job Type" rules={[{ required: true }]}>
                <AntSelect placeholder="Select type">
                  <Option value="Full-Time">Full-Time</Option>
                  <Option value="Part-Time">Part-Time</Option>
                  <Option value="Contract">Contract</Option>
                  <Option value="Internship">Internship</Option>
                </AntSelect>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <AntInput.TextArea rows={4} placeholder="Describe the role and responsibilities..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="location" label="Location" rules={[{ required: true }]}>
                <AntInput placeholder="e.g. Pune, India" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="salary" label="Expected Salary" rules={[{ required: true }]}>
                <AntInput placeholder="e.g. ₹6L - ₹10L" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
               type="primary" 
               htmlType="submit" 
               loading={createJobMutation.isLoading}
               className="bg-blue-600"
            >
              Post Job
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MyJobs;
