import React from 'react';
import PropTypes from "prop-types";
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Card, CardBody, Col, Container, FormFeedback, Input, Label, Row } from 'reactstrap';
import logoDark from "../../assets/images/logo-dark.png";
import logoLight from "../../assets/images/logo-light.png";

import * as Yup from "yup";
import { useFormik } from "formik";
import { post } from "../../helpers/api_helper";


const ForgetPassword2Page = () => {
  document.title = "Forget Password2 | Lexa - Responsive Bootstrap 5 Admin Dashboard";
  const navigate = useNavigate();
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().required("Please Enter Your Email"),
    }),
    onSubmit: async (values) => {
      setError("");
      setSuccess("");
      try {
        const data = await post(
          "/User/ForgotPassword_GenerateOTP",
          null,
          {
            params: {
              Email: values.email,
            },
          }
        );
        if (data.statusCode === 1) {
          setSuccess(data.message || "OTP generated successfully");
          localStorage.setItem("reset_email", values.email);
          setTimeout(() => navigate("/otp"), 1000);
        } else {
          setError(data.message || "Email not found");
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
                    <h4 className="text-muted font-size-18 mb-3 text-center">Reset Password 2</h4>
                    {error && (
                      <Alert color="danger" style={{ marginTop: "13px" }}>
                        {error}
                      </Alert>
                    )}
                    {success && (
                      <Alert color="success" style={{ marginTop: "13px" }}>
                        {success}
                      </Alert>
                    )}
                    <form className="form-horizontal mt-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}>
                      <div className="mb-3">
                        <Label htmlFor="useremail">Email</Label>
                        <Input
                          name="email"
                          className="form-control"
                          placeholder="Enter email"
                          type="email"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.email || ""}
                          invalid={
                            validation.touched.email && validation.errors.email ? true : false
                          }
                        />
                        {validation.touched.email && validation.errors.email ? (
                          <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
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
              <div className="mt-5 text-center">
                <p>Remember It ? <Link to="/login" className="text-primary"> Sign In Here </Link> </p>
                © {new Date().getFullYear()} Lexa <span className="d-none d-sm-inline-block"> - Crafted with <i className="mdi mdi-heart text-danger"></i> by Themesbrand.</span>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default  ForgetPassword2Page;
