import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"

import { setBreadcrumbItems } from "../../store/actions"
import {
  deleteRoleById,
  getRoleById,
  getRoleMenuPages,
  getRolesPages,
  saveRole,
} from "../../helpers/fakebackend_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import RoleForm from "./RoleForm"

const ROLE_LIST_SORT_COLUMN = "name"
const ROLE_LIST_SORT_DIR = "asc"

const toBoolean = value => {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value === 1
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return ["true", "1", "yes"].includes(normalized)
  }
  return Boolean(value)
}

const Roles = props => {
  document.title = "Roles | Lexa - Responsive Bootstrap 5 Admin Dashboard"
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const roleId = Number(params.id || 0)
  const isFormPage = location.pathname.startsWith("/roles/manage")
  const isEditMode = isFormPage && roleId > 0

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(0)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [rows, setRows] = useState([])
  const [sortColumn, setSortColumn] = useState(ROLE_LIST_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(ROLE_LIST_SORT_DIR)
  const [menuOptions, setMenuOptions] = useState([])
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Role" : "Create Role")
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    isDeleted: false,
    isAdmin: false,
    selectedMenu: "",
  })

  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Roles", link: "#" },
  ]

  const loadRoles = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getRolesPages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
      })

      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load roles")
      }

      const list = response?.data?.data || []
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.message || err || "Failed to load roles")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Roles", breadcrumbItems)
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadRoles()
    }
  }, [isFormPage, sortColumn, sortColumnDir])

  const handleSortChange = fieldName => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName)
    setSortColumn(nextState.sortColumn)
    setSortColumnDir(nextState.sortColumnDir)
  }

  useEffect(() => {
    const loadMenus = async () => {
      if (!isFormPage) {
        return
      }

      try {
        const response = await getRoleMenuPages()
        if (response?.statusCode === 1 && Array.isArray(response?.data?.data)) {
          setMenuOptions(response.data.data)
          return
        }

        throw new Error(response?.message || "Failed to load menus")
      } catch (err) {
        setFormError(err?.message || err || "Failed to load menus")
      }
    }

    loadMenus()
  }, [isFormPage])

  useEffect(() => {
    const loadRole = async () => {
      if (!isFormPage) {
        return
      }

      setFormError("")

      if (!isEditMode) {
        setFormTitle("Create Role")
        setFormData({
          id: 0,
          name: "",
          isDeleted: false,
          isAdmin: false,
          selectedMenu: "",
        })
        return
      }

      setLoading(true)

      try {
        const response = await getRoleById(roleId)
        if (!(response?.isSuccess && response?.statusCode === 1)) {
          throw new Error(response?.message || "Failed to load role")
        }

        const role = response?.data || {}
        setFormTitle("Edit Role")
        setFormData({
          id: role.id || 0,
          name: role.name || "",
          isDeleted: toBoolean(role.isDeleted),
          isAdmin: toBoolean(role.isAdmin),
          selectedMenu: role.selectedMenu || "",
        })
      } catch (err) {
        setFormError(err?.message || err || "Failed to load role")
      } finally {
        setLoading(false)
      }
    }

    loadRole()
  }, [isFormPage, isEditMode, roleId])

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Name", field: "name", sort: "asc" },
          { label: "Is Admin", field: "isAdmin", sort: "asc" },
          { label: "Active", field: "isActive", sort: "asc" },
          { label: "Selected Menu", field: "selectedMenu", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
        id: item.id,
        name: item.name || "",
        isAdmin: item.isAdmin ? "Yes" : "No",
        isActive: item.isActive ? "Yes" : "No",
        selectedMenu: item.selectedMenu || "",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => navigate(`/roles/manage/${item.id}`)}
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
  }, [rows, deletingId, navigate, sortColumn, sortColumnDir])

  const handleChange = event => {
    const { name, value, type, checked } = event.target
    setFormData(previous => ({
      ...previous,
      [name]: type === "checkbox" ? Boolean(checked) : value,
    }))
  }

  const handleIsAdminToggle = () => {
    console.log("handleIsAdminToggle called, current isAdmin:", formData.isAdmin)
    setFormData(previous => {
      const newState = { ...previous, isAdmin: !previous.isAdmin }
      console.log("isAdmin toggled to:", newState.isAdmin)
      return newState
    })
  }

  const handleSelectedMenuChange = selectedMenuValue => {
    setFormData(previous => ({
      ...previous,
      selectedMenu: selectedMenuValue || "",
    }))
  }

  const handleDelete = async id => {
    const isConfirmed = await showConfirm("Are you sure you want to delete this role?", "Delete", "Cancel")
    if (!isConfirmed) {
      return
    }

    setDeletingId(id)

    try {
      const response = await deleteRoleById(id)
      if (response?.statusCode === 1) {
        await showSuccess(response?.message || "Role deleted successfully")
        await loadRoles()
        return
      }

      throw new Error(response?.message || "Failed to delete role")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to delete role"
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
        id: isEditMode ? Number(formData.id) || roleId : 0,
        name: formData.name,
        isDeleted: toBoolean(formData.isDeleted),
        isAdmin: toBoolean(formData.isAdmin),
        selectedMenu: formData.selectedMenu || "",
      }

      console.log("Form submitted with payload:", payload)
      const response = await saveRole(payload)
      if (response?.statusCode === 1) {
        await showSuccess(response?.message || "Role saved successfully")
        navigate("/roles")
        return
      }

      throw new Error(response?.message || "Failed to save role")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save role"
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
              <RoleForm
                title={formTitle}
                formError={formError}
                formData={formData}
                menuOptions={menuOptions}
                saving={saving}
                onChange={handleChange}
                onIsAdminToggle={handleIsAdminToggle}
                onSelectedMenuChange={handleSelectedMenuChange}
                onSubmit={handleSubmit}
                onClose={() => navigate("/roles")}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={() => navigate("/roles/manage")}>
                   <i className="mdi mdi-plus me-1" />Add Role
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

export default connect(null, { setBreadcrumbItems })(Roles)
