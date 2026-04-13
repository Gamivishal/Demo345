import React from "react"
import Select from "react-select"
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
} from "reactstrap"

const UserForm = ({
  title,
  formError,
  formData,
  roleOptions,
  isEditMode,
  saving,
  onChange,
  onRoleChange,
  onSubmit,
  onClose,
}) => {
  const roleSelectOptions = (roleOptions || []).map(role => ({
    value: role.id,
    label: role.name,
  }))

  const selectedRole = roleSelectOptions.find(option => Number(option.value) === Number(formData.roleId)) || null

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
        <Form onSubmit={onSubmit}>
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
                  // Only allow numbers
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
              <Label>Select Role<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select role"
                options={roleSelectOptions}
                value={selectedRole}
                onChange={onRoleChange}
                isSearchable
                isClearable
              />
            </Col>
          </Row>

          <div className="app-form-actions">
            <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              Save
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  )
}

export default UserForm
