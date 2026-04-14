import React, { useEffect, useState } from "react";
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row, Spinner } from "reactstrap";
import { getPropertyList, saveOrUpdateProperty } from "../../helpers/api_helper";

const initialFormData = {
  propertyId: 0,
  title: "",
  description: "",
  price: 0,
  address: "",
  existingImageIds: [],
  files: [],
};

const PropertyForm = ({ isEditMode, propertyId, onClose }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isEditMode && propertyId) {
      // TODO: Fetch property by ID and setFormData
    } else {
      setFormData(initialFormData);
    }
  }, [isEditMode, propertyId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    setFormData(prev => ({ ...prev, files: Array.from(e.target.files) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const form = new FormData();
      form.append("propertyId", formData.propertyId || 0);
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("price", formData.price);
      form.append("address", formData.address);
      formData.existingImageIds.forEach(id => form.append("existingImageIds", id));
      formData.files.forEach(file => form.append("files", file));
      const res = await saveOrUpdateProperty(form);
      if (res?.isSuccess) {
        onClose();
      } else {
        setFormError(res?.message || "Save failed");
      }
    } catch (err) {
      setFormError(err?.message || err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">{isEditMode ? "Edit Property" : "Create Property"}</h5>
        <Button color="link" className="p-0" type="button" onClick={onClose}>
          Close
        </Button>
      </CardHeader>
      <CardBody className="app-form-body">
        {formError ? <Alert color="danger">{formError}</Alert> : null}
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Row className="g-3">
            <Col md={6}>
              <Label>Title<span style={{ color: "red" }}>*</span></Label>
              <Input name="title" value={formData.title} onChange={handleChange} placeholder="Enter title" />
            </Col>
            <Col md={6}>
              <Label>Price<span style={{ color: "red" }}>*</span></Label>
              <Input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Enter price" />
            </Col>
            <Col md={12}>
              <Label>Description</Label>
              <Input name="description" value={formData.description} onChange={handleChange} placeholder="Enter description" />
            </Col>
            <Col md={12}>
              <Label>Address</Label>
              <Input name="address" value={formData.address} onChange={handleChange} placeholder="Enter address" />
            </Col>
            <Col md={12}>
              <Label>Files (PDF/Image)</Label>
              <Input name="files" type="file" multiple accept=".pdf,image/*" onChange={handleFileChange} />
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

export default PropertyForm;
