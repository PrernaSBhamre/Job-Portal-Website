import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Row, Col, Typography, Upload, message, Divider, Spin } from 'antd';
import { 
  PlusOutlined, 
  BankOutlined, 
  GlobalOutlined, 
  EnvironmentOutlined, 
  EditOutlined, 
  SaveOutlined 
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../api/recruiter';

const { Title, Text, Paragraph } = Typography;

const CompanyProfile = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading } = useQuery(['companyProfile'], () => api.get('/company'), {
    onSuccess: (res) => {
      if (res.company) {
        form.setFieldsValue(res.company);
      }
    }
  });

  const updateProfileMutation = useMutation((values) => api.put('/company', values), {
    onSuccess: () => {
      queryClient.invalidateQueries('companyProfile');
      setIsEditing(false);
      message.success('Company profile updated successfully!');
    },
    onError: (err) => message.error(err.response?.data?.message || 'Update failed'),
  });

  const onFinish = (values) => {
    updateProfileMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Loading company profile..." />
      </div>
    );
  }

  const company = data?.company || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-transparent">
        <div>
          <Title level={3} className="m-0">Company Branding</Title>
          <Text type="secondary">Manage your organization's presence on the platform.</Text>
        </div>
        {!isEditing && (
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 shadow-md"
          >
            Edit Profile
          </Button>
        )}
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card className="text-center border-none shadow-sm h-full">
            <div className="py-8 flex flex-col items-center">
               <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center mb-6 overflow-hidden border border-gray-200">
                  {company.logo ? (
                    <img src={company.logo} alt="Company Logo" className="w-full h-full object-cover" />
                  ) : (
                    <BankOutlined className="text-4xl text-gray-300" />
                  )}
               </div>
               <Title level={4} className="mb-1">{company.name || 'Your Company Name'}</Title>
               <div className="flex items-center text-gray-500 mb-4 font-medium">
                  <GlobalOutlined className="mr-2" /> {company.website || 'website.com'}
               </div>
               <div className="flex items-center text-gray-500 mb-6">
                  <EnvironmentOutlined className="mr-2" /> {company.location || 'Pune, India'}
               </div>
               <Divider />
               <div className="grid grid-cols-2 gap-4 w-full text-left">
                  <div>
                    <Text type="secondary" className="block text-xs uppercase font-bold tracking-wider">Industry</Text>
                    <Text strong>{company.industry || 'Technology'}</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="block text-xs uppercase font-bold tracking-wider">Size</Text>
                    <Text strong>{company.companySize || '50-100'}</Text>
                  </div>
               </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card className="border-none shadow-sm h-full">
            <Form 
              form={form}
              layout="vertical"
              onFinish={onFinish}
              disabled={!isEditing}
              requiredMark={isEditing ? "optional" : false}
              className="mt-2"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name" label="Organization Name" rules={[{ required: true }]}>
                    <Input placeholder="e.g. Acme Inc." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="website" label="Official Website">
                    <Input placeholder="e.g. https://acme.com" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="industry" label="Primary Industry">
                    <Input placeholder="e.g. Software Development" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="location" label="Headquarters Location">
                    <Input placeholder="e.g. Palo Alto, CA" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="About the Company" rules={[{ required: true }]}>
                <Input.TextArea rows={6} placeholder="Briefly describe your organization's mission and culture..." />
              </Form.Item>

              <Form.Item name="logo" label="Logo URL">
                <Input placeholder="Link to your public logo logo..." />
              </Form.Item>

              {isEditing && (
                <div className="flex justify-end gap-3 mt-6 border-t pt-6">
                  <Button onClick={() => setIsEditing(false)}>Discard</Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />} 
                    loading={updateProfileMutation.isLoading}
                    className="bg-blue-600"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CompanyProfile;
