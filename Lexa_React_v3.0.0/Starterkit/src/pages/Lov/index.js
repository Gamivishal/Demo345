import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import { setBreadcrumbItems } from "../../store/actions"
import {
  getLovColumns,
  getLovDetailByCode,
  getLovDetailsByColumn,
  getLovMasterByColumn,
  saveLovDetail,
  saveLovMaster,
} from "../../helpers/fakebackend_helper"
import { showError, showSuccess } from "../../Pop_show/alertService"
import LovMasterForm from "./LovMasterForm"
import LovDetailList from "./LovDetailList"
import LovDetailForm from "./LovDetailForm"

const toBoolean = value => {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value === 1
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return ["true", "1", "yes"].includes(normalized)
  }
  return Boolean(value)
}

const toNumber = value => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const firstDataItem = payload => {
  if (Array.isArray(payload?.data) && payload.data.length) {
    return payload.data[0]
  }

  if (Array.isArray(payload?.data?.data) && payload.data.data.length) {
    return payload.data.data[0]
  }

  return null
}

const normalizeList = payload => {
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  return []
}

const LOV_BREADCRUMB_ITEMS = [
  { title: "Lexa", link: "#" },
  { title: "LOV", link: "#" },
]

const Lov = props => {
  document.title = "LOV | Lexa - Responsive Bootstrap 5 Admin Dashboard"
  const { setBreadcrumbItems } = props

  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const lovColumnParam = params.lovColumn || ""
  const lovCodeParam = params.lovCode || ""

  const isMasterCreatePage = location.pathname === "/lov/manage"
  const isMasterEditPage = location.pathname.startsWith("/lov/manage/") && !lovCodeParam
  const isDetailListPage = location.pathname.startsWith("/lov/details/") &&
    !location.pathname.includes("/manage")
  const isDetailFormPage = location.pathname.includes("/lov/details/") &&
    location.pathname.includes("/manage")

  const isMasterFormPage = isMasterCreatePage || isMasterEditPage
  const isMasterEditMode = isMasterEditPage && Boolean(lovColumnParam)
  const isDetailEditMode = isDetailFormPage && Boolean(lovCodeParam)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")

  const [masterRows, setMasterRows] = useState([])
  const [detailRows, setDetailRows] = useState([])

  const [masterTitle, setMasterTitle] = useState("Add LOV Master")
  const [masterFormData, setMasterFormData] = useState({
    lov_Column: "",
    display_Text: "",
    isEditMode: false,
  })

  const [detailTitle, setDetailTitle] = useState("Add LOV Detail")
  const [detailFormData, setDetailFormData] = useState({
    lov_Desc: "",
    displayOrder: 0,
  })
  const [detailDisplayText, setDetailDisplayText] = useState("")

  const loadMasterList = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getLovColumns()
      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load LOV columns")
      }

      const list = normalizeList(response)
      const uniqueByColumn = Array.from(
        new Map((list || []).map(item => [item?.lov_Column, item])).values()
      )
      setMasterRows(uniqueByColumn)
    } catch (err) {
      setError(err?.message || err || "Failed to load LOV columns")
    } finally {
      setLoading(false)
    }
  }

  const loadMasterByColumn = async lovColumn => {
    setLoading(true)
    setFormError("")

    try {
      const response = await getLovMasterByColumn(lovColumn)
      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load LOV master")
      }

      const item = firstDataItem(response)
      if (!item) {
        throw new Error("No LOV master data found")
      }

      setMasterTitle("Edit LOV Master")
      setMasterFormData({
        lov_Column: item.lov_Column || lovColumn,
        display_Text: item.display_Text || "",
        isEditMode: true,
      })
    } catch (err) {
      setFormError(err?.message || err || "Failed to load LOV master")
    } finally {
      setLoading(false)
    }
  }

  const loadDetailRows = async lovColumn => {
    setLoading(true)
    setError("")

    try {
      const response = await getLovDetailsByColumn(lovColumn)
      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load LOV details")
      }

      setDetailRows(normalizeList(response))
    } catch (err) {
      setError(err?.message || err || "Failed to load LOV details")
    } finally {
      setLoading(false)
    }
  }

  const loadDetailByCode = async (lovColumn, lovCode) => {
    setLoading(true)
    setFormError("")

    try {
      const response = await getLovDetailByCode(lovColumn, lovCode)
      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load LOV detail")
      }

      const item = firstDataItem(response)
      if (!item) {
        throw new Error("No LOV detail data found")
      }

      setDetailTitle("Edit LOV Detail")
      setDetailDisplayText(item.display_Text || "")
      setDetailFormData({
        lov_Desc: item.lov_Desc || "",
        displayOrder: toNumber(item.displayOrder),
      })
    } catch (err) {
      setFormError(err?.message || err || "Failed to load LOV detail")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setBreadcrumbItems("LOV", LOV_BREADCRUMB_ITEMS)
  }, [setBreadcrumbItems])

  useEffect(() => {
    if (isMasterFormPage || isDetailListPage || isDetailFormPage) {
      return
    }

    loadMasterList()
  }, [isMasterFormPage, isDetailListPage, isDetailFormPage])

  useEffect(() => {
    if (!isMasterFormPage) {
      return
    }

    setFormError("")

    if (!isMasterEditMode) {
      setMasterTitle("Add LOV Master")
      setMasterFormData({
        lov_Column: "",
        display_Text: "",
        isEditMode: false,
      })
      return
    }

    loadMasterByColumn(lovColumnParam)
  }, [isMasterFormPage, isMasterEditMode, lovColumnParam])

  useEffect(() => {
    if (!isDetailListPage || !lovColumnParam) {
      return
    }

    loadDetailRows(lovColumnParam)
  }, [isDetailListPage, lovColumnParam])

  useEffect(() => {
    if (!isDetailFormPage || !lovColumnParam) {
      return
    }

    setFormError("")
    setDetailDisplayText("")

    const loadDetailMaster = async () => {
      try {
        const response = await getLovMasterByColumn(lovColumnParam)
        if (response?.isSuccess && response?.statusCode === 1) {
          const item = firstDataItem(response)
          setDetailDisplayText(item?.display_Text || "")
        }
      } catch (err) {
        setDetailDisplayText("")
      }
    }

    loadDetailMaster()

    if (!isDetailEditMode) {
      setDetailTitle("Add LOV Detail")
      setDetailFormData({
        lov_Desc: "",
        displayOrder: 0,
      })
      return
    }

    loadDetailByCode(lovColumnParam, lovCodeParam)
  }, [isDetailFormPage, isDetailEditMode, lovCodeParam, lovColumnParam])

  const masterTableData = useMemo(() => {
    return {
      columns: [
        { label: "Sr.", field: "sr", sort: "asc" },
        { label: "Column Name", field: "lov_Column", sort: "asc" },
        { label: "Display Text", field: "display_Text", sort: "asc" },
        //{ label: "Active", field: "isActive", sort: "asc" },
        { label: "Action", field: "action", sort: "disabled" },
      ],
      rows: masterRows.map((item, index) => ({
        sr: index + 1,
        lov_Column: item?.lov_Column || "",
        display_Text: item?.display_Text || "",
        isActive: toBoolean(item?.isActive) ? "Yes" : "No",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => navigate(`/lov/manage/${encodeURIComponent(item?.lov_Column || "")}`)}
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
            <Button
              color="link"
              className="p-0 text-info"
              title="View"
              type="button"
              onClick={() => navigate(`/lov/details/${encodeURIComponent(item?.lov_Column || "")}`)}
            >
              <i className="mdi mdi-eye-outline font-size-18" />
            </Button>
          </div>
        ),
      })),
    }
  }, [masterRows, navigate])

  const detailTableData = useMemo(() => {
    return {
      columns: [
        { label: "Sr.", field: "sr", sort: "asc" },
        { label: "Code", field: "lov_Code", sort: "asc" },
        { label: "Description", field: "lov_Desc", sort: "asc" },
       // { label: "Display Text", field: "display_Text", sort: "asc" },
        { label: "Display Order", field: "displayOrder", sort: "asc" },
       // { label: "Active", field: "isActive", sort: "asc" },
        { label: "Action", field: "action", sort: "disabled" },
      ],
      rows: detailRows.map((item, index) => ({
        sr: index + 1,
        lov_Code: item?.lov_Code || "",
        lov_Desc: item?.lov_Desc || "",
        display_Text: item?.display_Text || "",
        displayOrder: toNumber(item?.displayOrder),
        isActive: toBoolean(item?.isActive) ? "Yes" : "No",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() =>
                navigate(
                  `/lov/details/${encodeURIComponent(lovColumnParam)}/manage/${encodeURIComponent(
                    item?.lov_Code || ""
                  )}`
                )
              }
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
          </div>
        ),
      })),
    }
  }, [detailRows, lovColumnParam, navigate])

  const handleMasterChange = event => {
    const { name, value, type } = event.target
    setMasterFormData(previous => ({
      ...previous,
      [name]: type === "number" || name === "displayOrder" || name === "maxDisplay_Seq_No"
        ? toNumber(value)
        : value,
    }))
  }

  const handleDetailChange = event => {
    const { name, value, type } = event.target
    setDetailFormData(previous => ({
      ...previous,
      [name]: type === "number" || name === "displayOrder" || name === "maxDisplay_Seq_No"
        ? toNumber(value)
        : value,
    }))
  }

  const handleMasterSubmit = async event => {
    event.preventDefault()
    setFormError("")
    setSaving(true)

    try {
      const isUpdate = isMasterEditMode
      const payload = {
        lov_Column: masterFormData.lov_Column,
        display_Text: masterFormData.display_Text,
        action: isUpdate ? "UPDATE" : "INSERT",
      }

      const response = await saveLovMaster(payload)
      if (response?.statusCode === 1) {
        await showSuccess(response?.message || "LOV master saved successfully")
        navigate("/lov")
        return
      }

      throw new Error(response?.message || "Failed to save LOV master")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save LOV master"
      await showError(errorMessage)
      setFormError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDetailSubmit = async event => {
    event.preventDefault()
    setFormError("")
    setSaving(true)

    try {
      const lovCodeValue = isDetailEditMode ? lovCodeParam : null
      const payload = {
        lov_Desc: detailFormData.lov_Desc,
        lov_Column: lovColumnParam,
        display_Text: detailDisplayText,
        displayOrder: toNumber(detailFormData.displayOrder),
        lov_Code: lovCodeValue,
      }

      const response = await saveLovDetail(payload)
      if (response?.statusCode === 1) {
        await showSuccess(response?.message || "LOV detail saved successfully")
        navigate(`/lov/details/${encodeURIComponent(lovColumnParam)}`)
        return
      }

      throw new Error(response?.message || "Failed to save LOV detail")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save LOV detail"
      await showError(errorMessage)
      setFormError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (isMasterFormPage) {
    return (
      <LovMasterForm
        title={masterTitle}
        formData={masterFormData}
        saving={saving}
        formError={formError}
        onChange={handleMasterChange}
        onSubmit={handleMasterSubmit}
        onCancel={() => navigate("/lov")}
      />
    )
  }

  if (isDetailFormPage) {
    return (
      <LovDetailForm
        title={detailTitle}
        formData={detailFormData}
        saving={saving}
        formError={formError}
        onChange={handleDetailChange}
        onSubmit={handleDetailSubmit}
        onCancel={() => navigate(`/lov/details/${encodeURIComponent(lovColumnParam)}`)}
      />
    )
  }

  if (isDetailListPage) {
    return (
      <LovDetailList
        lovColumn={lovColumnParam}
        data={detailTableData}
        loading={loading}
        error={error}
        onBack={() => navigate("/lov")}
        onAdd={() => navigate(`/lov/details/${encodeURIComponent(lovColumnParam)}/manage`)}
      />
    )
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-end mb-3">
          <Button color="primary" type="button" onClick={() => navigate("/lov/manage")}> 
            <i className="mdi mdi-plus me-1" />Add LOV
          </Button>
        </div>
        {error ? <Alert color="danger">{error}</Alert> : null}
        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        ) : (
          <MDBDataTable striped bordered small noBottomColumns data={masterTableData} />
        )}
      </CardBody>
    </Card>
  )
}

export default connect(null, { setBreadcrumbItems })(Lov)
