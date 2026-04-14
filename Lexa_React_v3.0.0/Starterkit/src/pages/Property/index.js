import React, { useEffect, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { MDBDataTable } from "mdbreact";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getPropertyList } from "../../helpers/api_helper";
import PropertyForm from "./PropertyForm";

const PROPERTY_LIST_SORT_DIR = "asc";

const Property = () => {
  document.title = "Property | Lexa - Responsive Bootstrap 5 Admin Dashboard";
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const propertyId = Number(params.id || 0);
  const isFormPage = location.pathname.startsWith("/property/manage");
  const isEditMode = isFormPage && propertyId > 0;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  const loadProperties = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPropertyList({ start: 0, length: 10, sortColumnDir: PROPERTY_LIST_SORT_DIR });
      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load properties");
      }
      const list = response?.data?.data || [];
      setRows(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || err || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isFormPage) loadProperties();
    // eslint-disable-next-line
  }, [isFormPage]);

  const handleAddNew = () => {
    navigate("/property/manage");
  };

  const handleEdit = id => {
    navigate(`/property/manage/${id}`);
  };

  if (isFormPage) {
    return (
      <PropertyForm
        isEditMode={isEditMode}
        propertyId={propertyId}
        onClose={() => navigate("/property")}
      />
    );
  }

  return (
    <Card>
      <CardBody>
        <Row className="mb-2">
          <Col><h4>Property List</h4></Col>
          <Col className="text-end">
            <Button color="primary" onClick={handleAddNew}>Add New</Button>
          </Col>
        </Row>
        {error && <Alert color="danger">{error}</Alert>}
        {loading ? (
          <div className="text-center my-4"><Spinner /></div>
        ) : (
          <MDBDataTable
            striped
            bordered
            small
            noBottomColumns
            data={{
              columns: [
                { label: "ID", field: "id", sort: "asc" },
                { label: "Title", field: "title", sort: "asc" },
                { label: "Description", field: "description", sort: "asc" },
                { label: "Price", field: "price", sort: "asc" },
                { label: "Address", field: "address", sort: "asc" },
                { label: "File Name", field: "fileName", sort: "asc" },
                { label: "Actions", field: "actions", sort: "disabled" },
              ],
              rows: rows.map(row => ({
                ...row,
                actions: (
                  <Button size="sm" color="info" onClick={() => handleEdit(row.id)}>
                    Edit
                  </Button>
                ),
              })),
            }}
          />
        )}
      </CardBody>
    </Card>
  );
};

export default Property;
