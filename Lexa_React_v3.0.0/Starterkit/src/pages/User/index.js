import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { setBreadcrumbItems } from "../../store/actions"
import { deleteUserById, getUserById, getUsersPages, saveUser } from "../../helpers/fakebackend_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import UserForm from "./UserForm"

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
  const [rows, setRows] = useState([])
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit User" : "Create User")
  const [formData, setFormData] = useState({
    id: 0,
    userName: "",
    password: "",
    email: "",
    mobileNumber: "",
    roleId: "",
    isActive: true,
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

  useEffect(() => {
    props.setBreadcrumbItems("Users", breadcrumbItems)
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadUsers()
    }
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
          isActive: true,
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
          password: user.password || "",
          email: user.email || "",
          mobileNumber: user.mobileNumber || "",
          roleId: user.roleId ?? "",
          isActive: Boolean(user.isActive),
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
    return {
      columns: [
        { label: "Id", field: "id", sort: "asc" },
        { label: "User Name", field: "userName", sort: "asc" },
        { label: "Email", field: "email", sort: "asc" },
        { label: "Mobile Number", field: "mobileNumber", sort: "asc" },
        { label: "Role Id", field: "roleId", sort: "asc" },
        { label: "Role Name", field: "rolename", sort: "asc" },
        { label: "Active", field: "isActive", sort: "asc" },
        { label: "Action", field: "action", sort: "disabled" },
      ],
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
    }
  }, [rows])

  const handleChange = event => {
    const { name, value, type, checked } = event.target
    setFormData(previous => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
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

    if (!formData.userName || !formData.password) {
      setFormError("Please enter username and password")
      return
    }

    setSaving(true)

    try {
      const payload = {
        id: isEditMode ? Number(formData.id) || userId : 0,
        userName: formData.userName,
        password: formData.password,
        isActive: Boolean(formData.isActive),
        isDeleted: Boolean(formData.isDeleted),
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        roleId: Number(formData.roleId) || 0,
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
                saving={saving}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onClose={() => navigate("/users")}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={() => navigate("/users/manage")}>
                    Add
                  </Button>
                </div>
                {error ? <Alert color="danger">{error}</Alert> : null}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <MDBDataTable striped bordered small noBottomColumns data={data} />
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
