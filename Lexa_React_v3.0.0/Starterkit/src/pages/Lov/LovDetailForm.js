import React from "react"
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row, Spinner } from "reactstrap"

const LovDetailForm = ({ title, formData, saving, formError, onChange, onSubmit, onCancel }) => {
  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">{title}</h5>
        <Button color="link" className="p-0" type="button" onClick={onCancel}>
          Close
        </Button>
      </CardHeader>
      <CardBody className="app-form-body">
        {formError ? <Alert color="danger">{formError}</Alert> : null}
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Label>Lov Description</Label>
              <Input
                name="lov_Desc"
                value={formData.lov_Desc}
                onChange={onChange}
                placeholder="Enter description"
              />
            </Col>
            <Col md={6}>
              <Label>Display Order</Label>
              <Input
                name="displayOrder"
                type="number"
                min={0}
                value={formData.displayOrder}
                onChange={onChange}
                placeholder="0"
              />
            </Col>
          </Row>

          <div className="app-form-actions">
            <Button color="light" type="button" onClick={onCancel}>
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

export default LovDetailForm
