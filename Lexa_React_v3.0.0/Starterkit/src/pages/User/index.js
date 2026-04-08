import React, { useEffect, useMemo, useState } from "react"
import { Alert, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"

import { setBreadcrumbItems } from "../../store/actions"
import { getUsersPages } from "../../helpers/fakebackend_helper"

const Users = props => {
  document.title = "Users | Lexa - Responsive Bootstrap 5 Admin Dashboard"

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rows, setRows] = useState([])

  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Users", link: "#" },
  ]

  useEffect(() => {
    props.setBreadcrumbItems("Users", breadcrumbItems)
  }, [])

  useEffect(() => {
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

    loadUsers()
  }, [])

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
      ],
      rows: rows.map(item => ({
        id: item.id,
        userName: item.userName || "",
        email: item.email || "",
        mobileNumber: item.mobileNumber || "",
        roleId: item.roleId ?? "",
        rolename: item.rolename || "",
        isActive: item.isActive ? "Yes" : "No",
      })),
    }
  }, [rows])

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          <Card>
            <CardBody>
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
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(Users)
