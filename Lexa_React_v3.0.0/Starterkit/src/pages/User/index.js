import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"

import { setBreadcrumbItems } from "../../store/actions"
import { deleteUserById, getRoleNames, getUserById, getUsersPages, saveUser } from "../../helpers/fakebackend_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import UserForm from "./UserForm"
import { exportUsers, exportUsersPdf } from "../../helpers/fakebackend_helper";



const USER_LIST_SORT_COLUMN = "userName"
const USER_LIST_SORT_DIR = "asc"

const Users = props => {
  document.title = "Users | Lexa - Responsive Bootstrap 5 Admin Dashboard"
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const userId = Number(params.id || 0)
  const isFormPage = location.pathname.startsWith("/users/manage")
  const isEditMode = isFormPage && userId > 0

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(0)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [roleOptions, setRoleOptions] = useState([])
  const [rows, setRows] = useState([])
  const [sortColumn, setSortColumn] = useState(USER_LIST_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(USER_LIST_SORT_DIR)
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit User" : "Create User")
  const [formData, setFormData] = useState({
    id: 0,
    userName: "",
    password: "",
    email: "",
    mobileNumber: "",
    roleId: "",
    isDeleted: false,
  })

  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Users", link: "#" },
  ]

  const loadUsers = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getUsersPages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
      })

      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load users")
      }

      const list = response?.data?.data || []
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.message || err || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

// new for export
const handleExport = async () => {
  try {
    const response = await exportUsers({
      start: 0,
      length: 1000,
      sortColumn,
      sortColumnDir,
    });

    const url = window.URL.createObjectURL(response.data);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Users.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export failed", err);
  }
};


// pdf
const handleExportPdf = async () => {
  try {
    const response = await exportUsersPdf({
      start: 0,
      length: 1000,
      sortColumn,
      sortColumnDir,
    });

    const url = window.URL.createObjectURL(response.data);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Users.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("PDF export failed", err);
  }
};


  useEffect(() => {
    props.setBreadcrumbItems("Users", breadcrumbItems)
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadUsers()
    }
  }, [isFormPage, sortColumn, sortColumnDir])

  const handleSortChange = fieldName => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName)
    setSortColumn(nextState.sortColumn)
    setSortColumnDir(nextState.sortColumnDir)
  }

  useEffect(() => {
    const loadRoles = async () => {
      if (!isFormPage) {
        return
      }

      try {
        const response = await getRoleNames()
        if (response?.statusCode === 1 && Array.isArray(response?.data)) {
          setRoleOptions(response.data)
          return
        }

        throw new Error(response?.message || "Failed to load roles")
      } catch (err) {
        setFormError(err?.message || err || "Failed to load roles")
      }
    }

    loadRoles()
  }, [isFormPage])

  useEffect(() => {
    const loadUser = async () => {
      if (!isFormPage) {
        return
      }

      setFormError("")

      if (!isEditMode) {
        setFormTitle("Create User")
        setFormData({
          id: 0,
          userName: "",
          password: "",
          email: "",
          mobileNumber: "",
          roleId: "",
          isDeleted: false,
        })
        return
      }

      setLoading(true)

      try {
        const response = await getUserById(userId)
        if (!(response?.isSuccess && response?.statusCode === 1)) {
          throw new Error(response?.message || "Failed to load user")
        }

        const user = response?.data || {}
        setFormTitle("Edit User")
        setFormData({
          id: user.id || 0,
          userName: user.userName || "",
          password: "",
          email: user.email || "",
          mobileNumber: user.mobileNumber || "",
          roleId: user.roleId ?? "",
          isDeleted: Boolean(user.isDeleted),
        })
      } catch (err) {
        setFormError(err?.message || err || "Failed to load user")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [isFormPage, isEditMode, userId])

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "User Name", field: "userName", sort: "asc" },
          { label: "Email", field: "email", sort: "asc" },
          { label: "Mobile Number", field: "mobileNumber", sort: "asc" },
          { label: "Role Name", field: "rolename", sort: "asc" },
          { label: "Active", field: "isActive", sort: "disabled" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
        id: item.id,
        userName: item.userName || "",
        email: item.email || "",
        mobileNumber: item.mobileNumber || "",
        roleId: item.roleId ?? "",
        rolename: item.rolename || "",
        isActive: item.isActive ? "Yes" : "No",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => navigate(`/users/manage/${item.id}`)}
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
            <Button
              color="link"
              className="p-0 text-danger"
              title="Delete"
              type="button"
              disabled={deletingId === item.id}
              onClick={() => handleDelete(item.id)}
            >
              {deletingId === item.id ? (
                <Spinner size="sm" />
              ) : (
                <i className="mdi mdi-trash-can-outline font-size-18" />
              )}
            </Button>
          </div>
        ),
      })),
    })
  }, [rows, sortColumn, sortColumnDir])

  const handleChange = event => {
    const { name, value, type, checked } = event.target
    setFormData(previous => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleRoleChange = option => {
    setFormData(previous => ({
      ...previous,
      roleId: option?.value ?? "",
    }))
  }

  const handleDelete = async id => {
    const isConfirmed = await showConfirm("Are you sure you want to delete this user?", "Delete", "Cancel")
    if (!isConfirmed) {
      return
    }

    setDeletingId(id)
    try {
      const response = await deleteUserById(id)
      if (response?.statusCode === 1) {
        await showSuccess(response?.message || "User deleted successfully")
        await loadUsers()
        return
      }

      throw new Error(response?.message || "Failed to delete user")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to delete user"
      await showError(errorMessage)
    } finally {
      setDeletingId(0)
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setFormError("")

    setSaving(true)

    try {
      const payload = {
        id: isEditMode ? Number(formData.id) || userId : 0,
        userName: formData.userName,
        isDeleted: Boolean(formData.isDeleted),
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        roleId: Number(formData.roleId) || 0,
      }

      if (!isEditMode) {
        payload.password = formData.password
      }

      const response = await saveUser(payload)
      if (response?.statusCode === 1) {
        await showSuccess(response?.message || "Saved successfully")
        navigate("/users")
        return
      }

      throw new Error(response?.message || "Failed to save user")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save user"
      await showError(errorMessage)
      setFormError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          {isFormPage ? (
            loading ? (
              <Card>
                <CardBody>
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                </CardBody>
              </Card>
            ) : (
              <UserForm
                title={formTitle}
                formError={formError}
                formData={formData}
                roleOptions={roleOptions}
                isEditMode={isEditMode}
                saving={saving}
                onChange={handleChange}
                onRoleChange={handleRoleChange}
                onSubmit={handleSubmit}
                onClose={() => navigate("/users")}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={() => navigate("/users/manage")}>
                     <i className="mdi mdi-plus me-1" />Add User
                  </Button>
                  <Button color="success" className="me-2" onClick={handleExport}>
  <i className="mdi mdi-file-excel me-1" />
  Export Excel
</Button>
<Button color="danger" className="me-2" onClick={handleExportPdf}>
  <i className="mdi mdi-file-pdf me-1" />
  Export PDF
</Button>
                </div>
                {error ? <Alert color="danger">{error}</Alert> : null}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <MDBDataTable className="table-auto-sr" striped bordered small noBottomColumns data={data} />
                )}
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(Users)
