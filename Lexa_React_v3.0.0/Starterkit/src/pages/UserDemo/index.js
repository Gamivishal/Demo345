import React, { useEffect, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { MDBDataTable } from "mdbreact";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getUserDemoList, getUserDemoById, saveUserDemo } from "../../helpers/fakebackend_helper";
import UserDemoForm from "./UserDemoForm";

const USER_DEMO_LIST_SORT_DIR = "asc";

const UserDemo = () => {
  document.title = "UserDemo | Lexa - Responsive Bootstrap 5 Admin Dashboard";
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const userId = Number(params.id || 0);
  const isFormPage = location.pathname.startsWith("/userdemo/manage");
  const isEditMode = isFormPage && userId > 0;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [rows, setRows] = useState([]);
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit UserDemo" : "Create UserDemo");
  const [formData, setFormData] = useState({
    id: 0,
    userName: "",
    password: "",
    email: "",
    mobileNumber: "",
    isActive: true,
    isDeleted: false,
    fileName: "",
    contentType: "",
    fileSize: 0,
    fileData: null,
    files: null,
  });
  const [attachment, setAttachment] = useState(null);

  const loadUserDemo = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getUserDemoList({ start: 0, length: 10, sortColumnDir: USER_DEMO_LIST_SORT_DIR });
      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load UserDemo");
      }
      const list = response?.data?.data || [];
      setRows(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || err || "Failed to load UserDemo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isFormPage) loadUserDemo();
    // eslint-disable-next-line
  }, [isFormPage]);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      getUserDemoById(userId)
        .then(res => {
          if (res?.isSuccess && res?.data) {
            setFormData({ ...res.data });
          } else {
            setFormError(res?.message || "Failed to load data");
          }
        })
        .catch(err => setFormError(err?.message || err))
        .finally(() => setLoading(false));
    } else {
      setFormData({
        id: 0,
        userName: "",
        password: "",
        email: "",
        mobileNumber: "",
        isActive: true,
        isDeleted: false,
        fileName: "",
        contentType: "",
        fileSize: 0,
        fileData: null,
        files: null,
      });
      setAttachment(null);
    }
    // eslint-disable-next-line
  }, [isEditMode, userId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    setAttachment(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const form = new FormData();
      form.append("UserId", formData.id || 0);
      form.append("UserName", formData.userName);
      form.append("Password", formData.password);
      form.append("Email", formData.email);
      form.append("MobileNumber", formData.mobileNumber);
      if (attachment) form.append("attachment", attachment);
      const res = await saveUserDemo(form);
      if (res?.isSuccess) {
        navigate("/userdemo");
      } else {
        setFormError(res?.message || "Save failed");
      }
    } catch (err) {
      setFormError(err?.message || err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = () => {
    navigate("/userdemo/manage");
  };

  const handleEdit = id => {
    navigate(`/userdemo/manage/${id}`);
  };

  if (isFormPage) {
    return (
      <UserDemoForm
        title={formTitle}
        formError={formError}
        formData={formData}
        isEditMode={isEditMode}
        saving={saving}
        onChange={handleChange}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        onClose={() => navigate("/userdemo")}
      />
    );
  }

  return (
    <Card>
      <CardBody>
        <Row className="mb-2">
          <Col><h4>UserDemo List</h4></Col>
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
                { label: "User Name", field: "userName", sort: "asc" },
                { label: "Email", field: "email", sort: "asc" },
                { label: "Mobile Number", field: "mobileNumber", sort: "asc" },
                { label: "Is Active", field: "isActive", sort: "asc" },
                { label: "File Name", field: "fileName", sort: "asc" },
                { label: "Actions", field: "actions", sort: "disabled" },
              ],
              rows: rows.map(row => ({
                ...row,
                actions: (
                  <div className="d-flex gap-2">
                    <Button size="sm" color="info" onClick={() => handleEdit(row.id)} title="Edit">
                      <i className="mdi mdi-pencil font-size-16" />
                    </Button>
                    {row.fileName && (
                      <Button
                        size="sm"
                        color="secondary"
                        onClick={() => {
                          if (row.fileData) {
                            const byteCharacters = atob(row.fileData);
                            const byteNumbers = new Array(byteCharacters.length);
                            for (let i = 0; i < byteCharacters.length; i++) {
                              byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], { type: row.contentType || 'application/pdf' });
                            const blobUrl = URL.createObjectURL(blob);
                            window.open(blobUrl, '_blank');
                          }
                        }}
                        disabled={!row.fileData}
                      >
                        View
                      </Button>
                    )}
                  </div>
                ),
              })),
            }}
          />
        )}
      </CardBody>
    </Card>
  );
};

export default UserDemo;
