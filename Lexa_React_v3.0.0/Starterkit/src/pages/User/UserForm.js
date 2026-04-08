import React from "react"
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
  saving,
  onChange,
  onSubmit,
  onClose,
}) => {
  return (
    <Card className="mb-4">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">{title}</h5>
        <Button color="link" className="p-0" type="button" onClick={onClose}>
          Close
        </Button>
      </CardHeader>
      <CardBody>
        {formError ? <Alert color="danger">{formError}</Alert> : null}
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Label>User Name</Label>
              <Input
                name="userName"
                value={formData.userName}
                onChange={onChange}
                placeholder="Enter user name"
              />
            </Col>
            <Col md={6}>
              <Label>Password</Label>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={onChange}
                placeholder="Enter password"
              />
            </Col>
            <Col md={6}>
              <Label>Email</Label>
              <Input
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="Enter email"
              />
            </Col>
            <Col md={6}>
              <Label>Mobile Number</Label>
              <Input
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={onChange}
                placeholder="Enter mobile number"
              />
            </Col>
            <Col md={6}>
              <Label>Role Id</Label>
              <Input
                name="roleId"
                type="number"
                value={formData.roleId}
                onChange={onChange}
                placeholder="Enter role id"
              />
            </Col>
            <Col md={6} className="d-flex align-items-center mt-md-4 pt-md-2">
              <div className="form-check">
                <Input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={onChange}
                />
                <Label for="isActive" className="form-check-label ms-2">
                  Active
                </Label>
              </div>
            </Col>
          </Row>

          <div className="d-flex gap-2 justify-content-end mt-4">
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
