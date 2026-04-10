import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardBody, Col, Container, FormFeedback, Input, Label, Row, Alert } from 'reactstrap';
import logoDark from "../../assets/images/logo-dark.png";
import logoLight from "../../assets/images/logo-light.png";
import { useFormik } from "formik";
import * as Yup from "yup";
import { post } from "../../helpers/api_helper";


const OtpPage = () => {
  document.title = "Enter OTP | Lexa - Responsive Bootstrap 5 Admin Dashboard";
  const navigate = useNavigate();
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  // Get email from localStorage (set in ForgetPassword2)
  const email = localStorage.getItem("reset_email") || "";

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      otp: '',
    },
    validationSchema: Yup.object({
      otp: Yup.string().required("Please enter the OTP"),
    }),
    onSubmit: async (values) => {
      setError("");
      setSuccess("");
      try {
        const data = await post(
          "/User/ForgotPassword_VerifyOTP",
          null,
          {
            params: {
              Email: email,
              Otp: values.otp,
            },
          }
        );
        if (data.statusCode === 1) {
          setSuccess(data.message || "OTP verified successfully");
          setTimeout(() => navigate("/reset-password"), 1000);
        } else {
          setError(data.message || "Invalid OTP");
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
      }
    }
  });

  return (
    <React.Fragment>
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="overflow-hidden">
                <CardBody className="pt-0">
                  <h3 className="text-center mt-5 mb-4">
                    <Link to="/" className="d-block auth-logo">
                      <img src={logoDark} alt="" height="30" className="auth-logo-dark" />
                      <img src={logoLight} alt="" height="30" className="auth-logo-light" />
                    </Link>
                  </h3>
                  <div className="p-3">
                    <h4 className="text-muted font-size-18 mb-3 text-center">Enter OTP</h4>
                    {error && (
                      <Alert color="danger" style={{ marginTop: "13px" }}>{error}</Alert>
                    )}
                    {success && (
                      <Alert color="success" style={{ marginTop: "13px" }}>{success}</Alert>
                    )}
                    <form className="form-horizontal mt-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}>
                      <div className="mb-3">
                        <Label htmlFor="otp">OTP</Label>
                        <Input
                          name="otp"
                          className="form-control"
                          placeholder="Enter OTP"
                          type="text"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.otp || ""}
                          invalid={
                            validation.touched.otp && validation.errors.otp ? true : false
                          }
                        />
                        {validation.touched.otp && validation.errors.otp ? (
                          <FormFeedback type="invalid">{validation.errors.otp}</FormFeedback>
                        ) : null}
                      </div>
                      <Row className="mb-3">
                        <div className="col-12 d-flex justify-content-between">
                          <button className="btn btn-primary w-md waves-effect waves-light" type="submit">Submit</button>
                          <Link to="/login" className="btn btn-secondary w-md waves-effect waves-light">Back</Link>
                        </div>
                      </Row>
                    </form>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default OtpPage;
