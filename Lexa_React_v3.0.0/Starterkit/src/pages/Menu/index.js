import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"

import { setBreadcrumbItems } from "../../store/actions"
import { deleteMenuById, getMenuById, getMenusPages, saveMenu } from "../../helpers/fakebackend_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import MenuForm from "./MenuForm"

const MENU_LIST_SORT_COLUMN = "name"
const MENU_LIST_SORT_DIR = "asc"

const toBoolean = value => {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value === 1
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return ["true", "1", "yes"].includes(normalized)
  }
  return Boolean(value)
}

const Menus = props => {
  document.title = "Menus | Lexa - Responsive Bootstrap 5 Admin Dashboard"
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const menuId = Number(params.id || 0)
  const isFormPage = location.pathname.startsWith("/menus/manage")
  const isEditMode = isFormPage && menuId > 0

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(0)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [rows, setRows] = useState([])
  const [parentOptions, setParentOptions] = useState([])
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Menu" : "Create Menu")
  const [sortColumn, setSortColumn] = useState(MENU_LIST_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(MENU_LIST_SORT_DIR)
  const [formData, setFormData] = useState({
    id: 0,
    parentId: 0,
    area: "",
    controller: "",
    url: "",
    name: "",
    icon: "",
    displayOrder: 0,
    isSuperAdmin: false,
    isAdmin: false,
  })

  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Menus", link: "#" },
  ]

  const loadMenus = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getMenusPages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
      })

      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load menus")
      }

      const list = response?.data?.data || []
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.message || err || "Failed to load menus")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Menus", breadcrumbItems)
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadMenus()
    }
  }, [isFormPage, sortColumn, sortColumnDir])

  const handleSortChange = fieldName => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName)
    setSortColumn(nextState.sortColumn)
    setSortColumnDir(nextState.sortColumnDir)
  }

  useEffect(() => {
    const loadParentMenus = async () => {
      if (!isFormPage) {
        return
      }

      try {
        const response = await getMenusPages({
          start: 0,
          length: 100,
          sortColumn: MENU_LIST_SORT_COLUMN,
          sortColumnDir: "asc",
        })

        if (response?.statusCode === 1 && Array.isArray(response?.data?.data)) {
          const allMenus = response.data.data
          const filteredParents = allMenus.filter(item => {
            if (!item) return false
            const parentIdValue = Number(item.parentId)
            if (!Number.isFinite(parentIdValue) || parentIdValue !== 0) return false
            if (isEditMode && Number(item.id) === Number(menuId)) return false
            return true
          })

          setParentOptions(filteredParents)
          return
        }

        throw new Error(response?.message || "Failed to load parent menus")
      } catch (err) {
        setFormError(err?.message || err || "Failed to load parent menus")
      }
    }

    loadParentMenus()
  }, [isFormPage, isEditMode, menuId])

  useEffect(() => {
    const loadMenu = async () => {
      if (!isFormPage) {
        return
      }

      setFormError("")

      if (!isEditMode) {
        setFormTitle("Create Menu")
        setFormData({
          id: 0,
          parentId: 0,
          area: "",
          controller: "",
          url: "",
          name: "",
          icon: "",
          displayOrder: 0,
          isSuperAdmin: false,
          isAdmin: false,
        })
        return
      }

      setLoading(true)

      try {
        const response = await getMenuById(menuId)
        if (!(response?.isSuccess && response?.statusCode === 1)) {
          throw new Error(response?.message || "Failed to load menu")
        }

        const menu = response?.data || {}
        setFormTitle("Edit Menu")
        setFormData({
          id: menu.id || 0,
          parentId: Number(menu.parentId) > 0 ? Number(menu.parentId) : 0,
          area: menu.area || "",
          controller: menu.controller || "",
          url: menu.url || "",
          name: menu.name || "",
          icon: menu.icon || "",
          displayOrder: Number(menu.displayOrder) || 0,
          isSuperAdmin: toBoolean(menu.isSuperAdmin),
          isAdmin: toBoolean(menu.isAdmin),
        })
      } catch (err) {
        setFormError(err?.message || err || "Failed to load menu")
      } finally {
        setLoading(false)
      }
    }

    loadMenu()
  }, [isFormPage, isEditMode, menuId])

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Name", field: "name", sort: "asc" },
          { label: "Parent", field: "parentId", sort: "asc" },
          { label: "Controller", field: "controller", sort: "asc" },
          { label: "URL", field: "url", sort: "disabled" },
          { label: "Is Admin", field: "isAdmin", sort: "asc" },
          { label: "Super Admin", field: "isSuperAdmin", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
        id: item.id,
        name: item.name || "",
        parentId: item.parentId ?? 0,
        controller: item.controller || "",
        url: item.url || "",
        isAdmin: item.isAdmin ? "Yes" : "No",
        isSuperAdmin: item.isSuperAdmin ? "Yes" : "No",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => navigate(`/menus/manage/${item.id}`)}
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
  }, [rows, navigate, sortColumn, sortColumnDir, deletingId])

  const handleDelete = async id => {
    const isConfirmed = await showConfirm("Are you sure you want to delete this menu?", "Delete", "Cancel")
    if (!isConfirmed) {
      return
    }

    setDeletingId(id)
    try {
      const response = await deleteMenuById(id)
      if (response?.statusCode === 1) {
        await showSuccess(response?.message || "Menu deleted successfully")
        await loadMenus()
        return
      }

      throw new Error(response?.message || "Failed to delete menu")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to delete menu"
      await showError(errorMessage)
    } finally {
      setDeletingId(0)
    }
  }

  const handleChange = event => {
    const { name, value, type } = event.target

    setFormData(previous => ({
      ...previous,
      [name]: type === "number" || name === "displayOrder" ? Number(value) || 0 : value,
    }))
  }

  const handleParentMenuChange = option => {
    setFormData(previous => ({
      ...previous,
      parentId: option?.value ?? 0,
    }))
  }

  const handleBooleanToggle = fieldName => {
    setFormData(previous => ({
      ...previous,
      [fieldName]: !previous[fieldName],
    }))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setFormError("")
    setSaving(true)

    try {
      const payload = {
        id: isEditMode ? Number(formData.id) || menuId : 0,
        parentId: Number(formData.parentId) || 0,
        area: formData.area || "",
        controller: formData.controller || "",
        url: formData.url || "",
        name: formData.name || "",
        icon: formData.icon || "",
        displayOrder: Number(formData.displayOrder) || 0,
        isSuperAdmin: toBoolean(formData.isSuperAdmin),
        isAdmin: toBoolean(formData.isAdmin),
      }

      const response = await saveMenu(payload)
      if (response?.statusCode === 1) {
        await showSuccess(response?.message || "Menu saved successfully")
        navigate("/menus")
        return
      }

      throw new Error(response?.message || "Failed to save menu")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save menu"
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
              <MenuForm
                title={formTitle}
                formError={formError}
                formData={formData}
                parentOptions={parentOptions}
                saving={saving}
                onChange={handleChange}
                onParentMenuChange={handleParentMenuChange}
                onBooleanToggle={handleBooleanToggle}
                onSubmit={handleSubmit}
                onClose={() => navigate("/menus")}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={() => navigate("/menus/manage")}>
                   <i className="mdi mdi-plus me-1" />Add Menu
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

export default connect(null, { setBreadcrumbItems })(Menus)
