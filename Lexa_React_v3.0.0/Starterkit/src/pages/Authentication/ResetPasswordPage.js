import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardBody, Col, Container, FormFeedback, Input, Label, Row } from 'reactstrap';
import logoDark from "../../assets/images/logo-dark.png";
import logoLight from "../../assets/images/logo-light.png";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { post } from "../../helpers/api_helper";

const ResetPasswordPage = () => {
  document.title = "Reset Password | Lexa - Responsive Bootstrap 5 Admin Dashboard";
  const navigate = useNavigate();
  // Remove local error/success state, use toast instead
  const email = localStorage.getItem("reset_email") || "";

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      newPassword: Yup.string().required("Please enter new password"),
      confirmPassword: Yup.string().oneOf([Yup.ref('newPassword'), null], 'Passwords must match').required("Please confirm your password"),
    }),
    onSubmit: async (values) => {
      try {
        const data = await post(
          "/User/ForgotPassword_ResetPassword",
          null,
          {
            params: {
              Email: email,
              NewPassword: values.newPassword,
              ConfirmPassword: values.confirmPassword,
            },
          }
        );
        if (data.statusCode === 1) {
          toast.success(data.message || "Password reset successfully");
          setTimeout(() => navigate("/login"), 1500);
        } else {
          toast.error(data.message || "Failed to reset password");
        }
      } catch (err) {
        toast.error("Something went wrong. Please try again.");
      }
    }
  });

  return (
    <React.Fragment>
      <ToastContainer />
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
                    <h4 className="text-muted font-size-18 mb-3 text-center">Reset Password</h4>
                    <form className="form-horizontal mt-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}>
                      <div className="mb-3">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          name="newPassword"
                          className="form-control"
                          placeholder="Enter new password"
                          type="password"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.newPassword || ""}
                          invalid={
                            validation.touched.newPassword && validation.errors.newPassword ? true : false
                          }
                        />
                        {validation.touched.newPassword && validation.errors.newPassword ? (
                          <FormFeedback type="invalid">{validation.errors.newPassword}</FormFeedback>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          name="confirmPassword"
                          className="form-control"
                          placeholder="Confirm new password"
                          type="password"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.confirmPassword || ""}
                          invalid={
                            validation.touched.confirmPassword && validation.errors.confirmPassword ? true : false
                          }
                        />
                        {validation.touched.confirmPassword && validation.errors.confirmPassword ? (
                          <FormFeedback type="invalid">{validation.errors.confirmPassword}</FormFeedback>
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

export default ResetPasswordPage;
