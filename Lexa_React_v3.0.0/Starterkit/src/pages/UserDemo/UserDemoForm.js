import React from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";

const UserDemoForm = ({
  title,
  formError,
  formData,
  isEditMode,
  saving,
  onChange,
  onFileChange,
  onSubmit,
  onClose,
}) => {
  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">{title}</h5>
        <Button color="link" className="p-0" type="button" onClick={onClose}>
          Close
        </Button>
      </CardHeader>
      <CardBody className="app-form-body">
        {formError ? <Alert color="danger">{formError}</Alert> : null}
        <Form onSubmit={onSubmit} encType="multipart/form-data">
          <Row className="g-3">
            <Col md={6}>
              <Label>User Name<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="userName"
                value={formData.userName}
                onChange={onChange}
                placeholder="Enter user name"
              />
            </Col>
            {!isEditMode && (
              <Col md={6}>
                <Label>Password<span style={{ color: "red" }}>*</span></Label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={onChange}
                  placeholder="Enter password"
                />
              </Col>
            )}
            <Col md={6}>
              <Label>Email<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="Enter email"
              />
            </Col>
            <Col md={6}>
              <Label>Mobile Number<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="mobileNumber"
                type="tel"
                pattern="[0-9]*"
                inputMode="numeric"
                value={formData.mobileNumber}
                onChange={e => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  onChange({
                    ...e,
                    target: {
                      ...e.target,
                      value,
                    },
                  });
                }}
                placeholder="Enter mobile number"
                maxLength={10}
              />
            </Col>
            <Col md={6}>
              <Label>Attachment (PDF/Image)</Label>
              <Input
                name="attachment"
                type="file"
                accept=".pdf,image/*"
                onChange={onFileChange}
              />
              {isEditMode && formData.fileName && (
                <div className="mt-2 text-muted d-flex align-items-center" style={{ fontSize: '0.95em' }}>
                  Old File: <b className="me-2">{formData.fileName}</b>
                  {formData.fileData && (
                    <Button
                      size="sm"
                      color="link"
                      className="p-0"
                      title="View File"
                      onClick={() => {
                        const byteCharacters = atob(formData.fileData);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                          byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: formData.contentType || 'application/pdf' });
                        const blobUrl = URL.createObjectURL(blob);
                        window.open(blobUrl, '_blank');
                      }}
                    >
                      <i className="mdi mdi-eye font-size-16" />
                    </Button>
                  )}
                </div>
              )}
            </Col>
          </Row>
          <div className="d-flex justify-content-end mt-4">
            <Button color="primary" type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" /> : "Save"}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default UserDemoForm;
