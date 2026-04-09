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

const MenuForm = ({
  title,
  formError,
  formData,
  parentOptions,
  saving,
  onChange,
  onParentMenuChange,
  onBooleanToggle,
  onSubmit,
  onClose,
}) => {
  const parentSelectOptions = [
    { value: 0, label: "No Parent" },
    ...(parentOptions || []).map(item => ({
      value: Number(item.id),
      label: item.name,
    })),
  ]

  const selectedParentMenu =
    parentSelectOptions.find(option => Number(option.value) === Number(formData.parentId)) || null

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
              <Label>Name</Label>
              <Input name="name" value={formData.name} onChange={onChange} placeholder="Enter menu name" />
            </Col>
            <Col md={6}>
              <Label>Parent Menu</Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select parent menu"
                options={parentSelectOptions}
                value={selectedParentMenu}
                onChange={onParentMenuChange}
                isSearchable
                isClearable
              />
            </Col>

            <Col md={6}>
              <Label>Area</Label>
              <Input name="area" value={formData.area} onChange={onChange} placeholder="Enter area" />
            </Col>
            <Col md={6}>
              <Label>Controller</Label>
              <Input
                name="controller"
                value={formData.controller}
                onChange={onChange}
                placeholder="Enter controller"
              />
            </Col>

            <Col md={6}>
              <Label>URL</Label>
              <Input name="url" value={formData.url} onChange={onChange} placeholder="Enter url" />
            </Col>
            <Col md={6}>
              <Label>Icon</Label>
              <Input name="icon" value={formData.icon} onChange={onChange} placeholder="Enter icon" />
            </Col>

            <Col md={6}>
              <Label>Display Order</Label>
              <Input
                name="displayOrder"
                type="number"
                min={0}
                value={formData.displayOrder}
                onChange={onChange}
                placeholder="Enter display order"
              />
            </Col>

            <Col md={6} className="d-flex align-items-center gap-4 mt-md-4 pt-md-2">
              <div className="form-check">
                <input
                  id="isSuperAdmin"
                  name="isSuperAdmin"
                  type="checkbox"
                  className="form-check-input"
                  checked={Boolean(formData.isSuperAdmin)}
                  onChange={e => e.preventDefault()}
                  onClick={() => onBooleanToggle("isSuperAdmin")}
                />
                <label htmlFor="isSuperAdmin" className="form-check-label ms-2">
                  Is Super Admin
                </label>
              </div>

              <div className="form-check">
                <input
                  id="isAdmin"
                  name="isAdmin"
                  type="checkbox"
                  className="form-check-input"
                  checked={Boolean(formData.isAdmin)}
                  onChange={e => e.preventDefault()}
                  onClick={() => onBooleanToggle("isAdmin")}
                />
                <label htmlFor="isAdmin" className="form-check-label ms-2">
                  Is Admin
                </label>
              </div>
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

export default MenuForm
