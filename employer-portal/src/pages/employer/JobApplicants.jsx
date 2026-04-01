import React, { useState } from 'react';
import { Table, Tag, Button, Card, Space, Select, Typography, Avatar, Tooltip, message, Breadcrumb } from 'antd';
import { 
  ArrowLeftOutlined, 
  DownloadOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  MailOutlined, 
  PhoneOutlined 
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/recruiter';

const { Title, Text } = Typography;
const { Option } = Select;

const JobApplicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = useQuery(['applicants', id, statusFilter], () => 
    api.get(`/jobs/${id}/applicants?status=${statusFilter}`)
  );

  const updateStatusMutation = useMutation(({ appId, status }) => 
    api.put(`/applications/${appId}/status`, { status }), {
    onSuccess: () => {
      queryClient.invalidateQueries(['applicants', id]);
      message.success('Applicant status updated successfully.');
    },
    onError: (err) => message.error(err.response?.data?.message || 'Update failed'),
  });

  const columns = [
    {
      title: 'Applicant',
      key: 'applicant',
      render: (_, record) => (
        <Space size="middle">
          <Avatar 
            size="large" 
            src={record.applicant?.profile?.profilePicture} 
            className="bg-blue-100 text-blue-600"
          >
            {record.applicant?.fullname?.charAt(0)}
          </Avatar>
          <div className="flex flex-col">
            <Text strong className="text-sm">{record.applicant?.fullname}</Text>
            <Text type="secondary" className="text-xs">{record.applicant?.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'shortlisted') color = 'success';
        if (status === 'rejected') color = 'error';
        if (status === 'interviewing') color = 'processing';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={1} className="text-xs text-gray-500">
           <span className="flex items-center"><MailOutlined className="mr-1" /> {record.applicant?.email}</span>
           <span className="flex items-center"><PhoneOutlined className="mr-1" /> {record.applicant?.phoneNumber || 'N/A'}</span>
        </Space>
      ),
    },
    {
      title: 'Applied On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Download Resume">
            <Button 
               icon={<DownloadOutlined />} 
               type="text" 
               href={record.resume} 
               target="_blank"
            />
          </Tooltip>
          
          <Select 
            defaultValue={record.status} 
            onChange={(val) => updateStatusMutation.mutate({ appId: record._id, status: val })}
            className="w-32"
          >
            <Option value="pending">Applied</Option>
            <Option value="shortlisted">Shortlist</Option>
            <Option value="rejected">Reject</Option>
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
       <Breadcrumb
        items={[
          { title: <Link to="/employer/dashboard">Dashboard</Link> },
          { title: <Link to="/employer/jobs">Jobs</Link> },
          { title: 'Applicants' },
        ]}
        className="mb-2"
      />

      <div className="flex justify-between items-center bg-transparent">
        <Title level={3} className="m-0">
          <ArrowLeftOutlined className="mr-3 text-lg cursor-pointer" onClick={() => navigate('/employer/jobs')} />
          Applicants for: <span className="text-blue-600 font-bold">{data?.jobTitle || 'Loading...'}</span>
        </Title>
      </div>

      <Card className="border-none shadow-sm min-h-64 h-full">
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
           <Text type="secondary" className="font-semibold">{data?.pagination?.totalApplications || 0} total applications received.</Text>
           <Select 
            defaultValue="all" 
            onChange={(val) => setStatusFilter(val)}
            className="sm:w-48"
          >
            <Option value="all">All Applicants</Option>
            <Option value="pending">Newly Applied</Option>
            <Option value="shortlisted">Shortlisted</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
        </div>

        <Table 
          columns={columns} 
          dataSource={data?.applications || []} 
          loading={isLoading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          className="ant-table-professional"
        />
      </Card>
    </div>
  );
};

export default JobApplicants;
