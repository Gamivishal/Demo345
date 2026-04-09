import React from "react"
import { Button, Card, CardBody, Spinner, Alert } from "reactstrap"
import { MDBDataTable } from "mdbreact"

const LovDetailList = ({ lovColumn, data, loading, error, onAdd, onBack }) => {
  return (
    <Card>
      <CardBody>
        <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
          <h5 className="mb-0">LOV Details: {lovColumn}</h5>
          <div className="d-flex gap-2">
            <Button color="light" type="button" onClick={onBack}>
              Back
            </Button>
            <Button color="primary" type="button" onClick={onAdd}>
              <i className="mdi mdi-plus me-1" />Add Detail
            </Button>
          </div>
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
  )
}

export default LovDetailList
