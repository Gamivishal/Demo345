import React, { useEffect } from 'react'
import { Link } from 'react-router-dom';
import { Container, Row,Col, Card, CardBody, Label, Form, Alert, Input, FormFeedback } from 'reactstrap';
import logoDark from "../../assets/images/logo-dark.png";
import logoLight from "../../assets/images/logo-dark.png";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import PropTypes from "prop-types";

// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";
import withRouter from 'components/Common/withRouter';

// Alert Service
import { showError } from "../../Pop_show/alertService";

// actions
import { apiError, loginUser, socialLogin } from "../../store/actions";

const Login = props => {
  document.title = "Login | Lexa - Responsive Bootstrap 5 Admin Dashboard";

  const dispatch = useDispatch();

  const validation = useFormik({
    // enableReinitialize : use this  flag when initial values needs to be changed
    enableReinitialize: true,
    initialValues: {
      userName: "",
      password: "",
    },
    validationSchema: Yup.object({
      userName: Yup.string().required("Please Enter Your Username"),
      password: Yup.string().required("Please Enter Your Password"),
    }),
    onSubmit: (values) => {
      dispatch(loginUser(values, props.router.navigate));
    }
  });


  const selectLoginState = (state) => state.Login;
    const LoginProperties = createSelector(
      selectLoginState,
        (login) => ({
          error: login.error          
        })
    );

    const {
      error
  } = useSelector(LoginProperties);

  // Alert Service Integration
  useEffect(() => {
    if (error) {
      showError(error || "Login failed! Please try again.");
      dispatch(apiError(""));
    }
  }, [error, dispatch]);

    const signIn = type => {
        dispatch(socialLogin(type, props.router.navigate));
    };

  //for facebook and google authentication
  const socialResponse = type => {
    signIn(type);
  };


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
                                    <h4 className="text-muted font-size-18 mb-1 text-center">Welcome Back !</h4>
                                    <p className="text-muted text-center">Sign in to continue to Lexa.</p>
                                    <Form
                                      className="form-horizontal mt-4"
                                      onSubmit={(e) => {
                                        e.preventDefault();
                                        validation.handleSubmit();
                                        return false;
                                      }}
                                    >
                                      {error ? <Alert color="danger">{error}</Alert> : null}
                                        <div className="mb-3">
                                            <Label htmlFor="username">Username</Label>
                                            <Input
                                              name="userName"
                                              className="form-control"
                                              placeholder="Enter username"
                                              type="text"
                                              onChange={validation.handleChange}
                                              onBlur={validation.handleBlur}
                                              value={validation.values.userName || ""}
                                              invalid={
                                                validation.touched.userName && validation.errors.userName ? true : false
                                              }
                                            />
                                            {validation.touched.userName && validation.errors.userName ? (
                                              <FormFeedback type="invalid">{validation.errors.userName}</FormFeedback>
                                            ) : null}
                                        </div>
                                        <div className="mb-3">
                                            <Label htmlFor="userpassword">Password</Label> 
                                            <Input
                                              name="password"
                                              value={validation.values.password || ""}
                                              type="password"
                                              placeholder="Enter Password"
                                              onChange={validation.handleChange}
                                              onBlur={validation.handleBlur}
                                              invalid={
                                                validation.touched.password && validation.errors.password ? true : false
                                              }
                                            />
                                            {validation.touched.password && validation.errors.password ? (
                                              <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                                            ) : null}
                                        </div>
                                        <Row className="mb-3 mt-4">
                                            <div className="col-12 d-flex justify-content-center gap-3">
                                                <button
                                                  className="btn btn-primary waves-effect waves-light"
                                                  type="submit"
                                                  style={{ minWidth: "140px", height: "46px", borderRadius: "8px" }}
                                                >
                                                  Log In
                                                </button>
                                                <Link
                                                  to="/register"
                                                  className="btn btn-outline-primary waves-effect"
                                                  style={{ minWidth: "140px", height: "46px", borderRadius: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                                                >
                                                  Signup
                                                </Link>
                                            </div>
                                        </Row>
                                        <Row className="form-group mb-0">
                                          <div className="col-12 mt-4 d-flex flex-column align-items-start gap-2">
                                            <Link to="/forgot-password" className="text-muted"><i className="mdi mdi-lock"></i> Forgot your password?</Link>
                                            <Link to="/forgot-password2" className="text-muted"><i className="mdi mdi-lock"></i> Forgot your password2?</Link>
                                          </div>
                                        </Row>
                                    </Form>
                                </div>
                            </CardBody>
                        </Card>
                        {/* <Link
                              to="#"
                              className="social-list-item bg-danger text-white border-danger"
                              onClick={e => {
                                e.preventDefault();
                                socialResponse("google");
                              }}
                            >
                              <i className="mdi mdi-google" />
                            </Link>
                        <div className="mt-5 text-center">
                            © {new Date().getFullYear()} Lexa <span className="d-none d-sm-inline-block"> - Crafted with <i className="mdi mdi-heart text-danger"></i> by Themesbrand.</span>
                        </div> */}
                    </Col>
                </Row>
            </Container>
        </div>
      
    </React.Fragment>
  )
}

export default withRouter(Login);

Login.propTypes = {
  history: PropTypes.object,
};
