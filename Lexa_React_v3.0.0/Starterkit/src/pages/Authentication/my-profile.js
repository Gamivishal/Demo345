import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  CardBody,
  Button,
  Label,
  Input,
  FormFeedback,
  Form,
} from "reactstrap";

import * as Yup from "yup";
import { useFormik } from "formik";

import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import withRouter from "components/Common/withRouter";

import user1 from "../../assets/images/users/user-1.jpg";
import { changePassword, getUserById, resetPassword } from "../../helpers/fakebackend_helper";
import { editProfile, resetProfileFlag } from "../../store/actions";

const MyProfile = () => {
  document.title = "My Profile | Lexa - Responsive Bootstrap 5 Admin Dashboard";

  const dispatch = useDispatch();

  const [profile, setProfile] = useState({
    fullName: "Admin",
    email: "Admin",
    phone: "",
    role: "ADMIN",
    idx: 1,
  });
  const [isProfileEditable, setIsProfileEditable] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState(null); // For canceling edits
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetUsername, setResetUsername] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const selectProfileState = (state) => state.Profile;
  const ProfileProperties = createSelector(selectProfileState, (profileState) => ({
    error: profileState.error,
    success: profileState.success,
  }));

  const { error, success } = useSelector(ProfileProperties);

  useEffect(() => {
    const decodeJwtPayload = token => {
      try {
        const tokenParts = token.split(".");
        if (tokenParts.length < 2) return null;

        const base64 = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/");
        const normalized = decodeURIComponent(
          atob(base64)
            .split("")
            .map(char => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
            .join("")
        );

        return JSON.parse(normalized);
      } catch (error) {
        return null;
      }
    };

    const getUserIdFromToken = () => {
      const rawData = localStorage.getItem("data");
      if (!rawData) return null;

      try {
        const parsed = JSON.parse(rawData);
        const token = parsed?.data;
        if (!token) return null;

        const payload = decodeJwtPayload(token);
        const tokenUserId =
          payload?.userId ||
          payload?.id ||
          payload?.uid ||
          payload?.nameid ||
          payload?.sub ||
          payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

        return tokenUserId ? Number(tokenUserId) : null;
      } catch (error) {
        return null;
      }
    };

    const loadProfile = async () => {
      try {
        setProfileLoadError("");
        const userId = getUserIdFromToken();

        if (!userId) {
          throw new Error("Unable to find user id in token");
        }

        const response = await getUserById(userId);
        if (!(response?.isSuccess && response?.statusCode === 1)) {
          throw new Error(response?.message || "Failed to load profile information");
        }

        const user = response?.data || {};
        const nextProfile = {
          fullName: user.userName || user.username || "Admin",
          email: user.email || "",
          phone: user.mobileNumber || user.phone || "",
          role: user.rolename || user.roleName || user.role || "ADMIN",
          idx: user.id || userId,
        };

        setProfile(nextProfile);
        setResetUsername(nextProfile.fullName);
      } catch (err) {
        setProfileLoadError(err?.message || err || "Unable to load profile");
      } finally {
        setTimeout(() => {
          dispatch(resetProfileFlag());
        }, 3000);
      }
    };

    loadProfile();
  }, [dispatch, success]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: profile.fullName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      role: profile.role || "",
      id: profile.idx || 0,
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Please Enter Your Full Name"),
      email: Yup.string().email("Invalid email address").required("Please Enter Your Email"),
      phone: Yup.string(),
      role: Yup.string(),
    }),
    onSubmit: (values, { resetForm }) => {
      const payload = {
        id: values.id,
        userName: values.fullName,
        email: values.email,
        mobileNumber: values.phone,
        roleId: 1,
        isDeleted: false,
      };
      dispatch(editProfile(payload));
      // Do not update profile state here; let useEffect handle it based on response
      setEditSnapshot(null); // Clear snapshot after submit
    },
  });

  // Show toast for profile update result based on backend response
  useEffect(() => {
    if (success && typeof success === 'object' && success.statusCode !== undefined) {
      if (success.statusCode === 1) {
        toast.success(success.message || "Profile updated successfully!");
        setIsProfileEditable(false);
        setEditSnapshot(null);
        // Fetch latest user data from backend after successful update
        const fetchLatestProfile = async () => {
          try {
            const rawData = localStorage.getItem("data");
            let userId = null;
            if (rawData) {
              try {
                const parsed = JSON.parse(rawData);
                const token = parsed?.data;
                if (token) {
                  const decodeJwtPayload = token => {
                    try {
                      const tokenParts = token.split(".");
                      if (tokenParts.length < 2) return null;
                      const base64 = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/");
                      const normalized = decodeURIComponent(
                        atob(base64)
                          .split("")
                          .map(char => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
                          .join("")
                      );
                      return JSON.parse(normalized);
                    } catch (error) {
                      return null;
                    }
                  };
                  const payload = decodeJwtPayload(token);
                  userId =
                    payload?.userId ||
                    payload?.id ||
                    payload?.uid ||
                    payload?.nameid ||
                    payload?.sub ||
                    payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
                  userId = userId ? Number(userId) : null;
                }
              } catch (e) { userId = null; }
            }
            if (!userId) return;
            const response = await getUserById(userId);
            if (response?.isSuccess && response?.statusCode === 1) {
              const user = response?.data || {};
              const nextProfile = {
                fullName: user.userName || user.username || "Admin",
                email: user.email || "",
                phone: user.mobileNumber || user.phone || "",
                role: user.rolename || user.roleName || user.role || "ADMIN",
                idx: user.id || userId,
              };
              setProfile(nextProfile);
              setResetUsername(nextProfile.fullName);
            }
          } catch (err) {
            // Optionally handle error
          }
        };
        fetchLatestProfile();
      } else {
        toast.error(success.message || "Profile update failed");
        setIsProfileEditable(true);
      }
    }
    if (error && error.message) {
      toast.error(error.message);
      setIsProfileEditable(true);
    }
  }, [success, error]);

  const handleChangePassword = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    // if (!currentPassword || !newPassword || !confirmPassword) {
    //   setPasswordError("All fields are required.");
    //   return;
    // }

    // if (newPassword !== confirmPassword) {
    //   setPasswordError("New password and confirm password must match.");
    //   return;
    // }

    try {
      const response = await changePassword({
        oldPassword: currentPassword,
        newPassword,
        confirmPassword,
      });

      if (response?.isSuccess) {
        setPasswordSuccess(response?.message || "");
        toast.success(response?.message || "Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(response?.message || "");
        toast.error(response?.message || "Change password failed");
      }
    } catch (err) {
      setPasswordError(err?.message || err || "Change password failed");
      toast.error(err?.message || err || "Change password failed");
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (!resetUsername) {
      toast.error("Please enter a username to reset password.");
      return;
    }
    try {
      const data = await resetPassword(resetUsername);
      if (data.isSuccess || data.statusCode === 1) {
        toast.success(data.message || 'Password reset successfully!');
        setResetUsername("");
      } else {
        toast.error(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to reset password.');
    }
  };

  return (
    <React.Fragment>
      <ToastContainer />
      <div className="page-content">
        <Container fluid>
          <div className="mb-4">
            <h2 className="fw-bold mb-1">My Profile</h2>
            <p className="text-muted mb-0">Manage your account information</p>
          </div>

          <Row className="g-3">
            <Col xl="4">
              {/* Show only one alert: error > success (statusCode 1) > profileLoadError */}
              {profileLoadError ? (
                <Alert color="danger">{typeof profileLoadError === 'string' ? profileLoadError : profileLoadError?.message || JSON.stringify(profileLoadError)}</Alert>
              ) : null}

              <Card className="h-100 shadow-sm">
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <span
                        style={{
                          width: "4px",
                          height: "22px",
                          borderRadius: "999px",
                          backgroundColor: "#4a7cf3",
                          display: "inline-block",
                        }}
                      />
                      <h5 className="mb-0">Profile Information</h5>
                    </div>
                    {isProfileEditable ? (
                      <Button
                        color="secondary"
                        className="px-4"
                        onClick={() => {
                          setIsProfileEditable(false);
                          setEditSnapshot(null);
                          validation.resetForm();
                        }}
                        type="button"
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        color="primary"
                        className="px-4"
                        onClick={() => {
                          setIsProfileEditable(true);
                          setEditSnapshot(validation.values); // Save snapshot for cancel
                        }}
                        type="button"
                      >
                        Edit
                      </Button>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-4">
                    <img
                      src={user1}
                      alt="Profile"
                      className="avatar-md rounded-circle img-thumbnail"
                    />
                    <div>
                      <h5 className="mb-1">{profile.fullName}</h5>
                      <p className="text-muted mb-0">{profile.role}</p>
                    </div>
                  </div>

                  <Form
                    className="form-horizontal"
                    onSubmit={e => {
                      e.preventDefault();
                      validation.handleSubmit();
                      return false;
                    }}
                  >
                    <Row className="g-3">
                      <Col md="12">
                        <Label>Full Name</Label>
                        <Input
                          name="fullName"
                          className="form-control"
                          placeholder="Enter full name"
                          type="text"
                          readOnly={!isProfileEditable}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={isProfileEditable ? validation.values.fullName : profile.fullName || ""}
                          invalid={isProfileEditable && validation.touched.fullName && validation.errors.fullName ? true : false}
                        />
                        {isProfileEditable && validation.touched.fullName && validation.errors.fullName ? (
                          <FormFeedback type="invalid">{validation.errors.fullName}</FormFeedback>
                        ) : null}
                      </Col>

                      <Col md="12">
                        <Label>Email</Label>
                        <Input
                          name="email"
                          className="form-control"
                          type="email"
                          placeholder="Enter email"
                          value={isProfileEditable ? validation.values.email : profile.email || ""}
                          readOnly={!isProfileEditable}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          invalid={isProfileEditable && validation.touched.email && validation.errors.email ? true : false}
                        />
                        {isProfileEditable && validation.touched.email && validation.errors.email ? (
                          <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
                        ) : null}
                      </Col>

                      <Col md="12">
                        <Label>Phone</Label>
                        <Input
                          name="phone"
                          className="form-control"
                          type="text"
                          placeholder="Enter phone number"
                          value={isProfileEditable ? validation.values.phone : profile.phone || ""}
                          readOnly={!isProfileEditable}
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                        />
                      </Col>

                      <Col md="12">
                        <Label>Role</Label>
                        <Input
                          className="form-control"
                          type="text"
                          value={profile.role}
                          readOnly
                          style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', color: '#888' }}
                          title="Role cannot be changed"
                        />
                      </Col>
                    </Row>

                    {isProfileEditable ? (
                      <div className="text-end mt-4">
                        <Button type="submit" color="primary">
                          Save Changes
                        </Button>
                      </div>
                    ) : null}
                  </Form>
                </CardBody>
              </Card>
            </Col>

            <Col xl="4">
              <Card className="h-100 shadow-sm">
                <CardBody>
                  <div className="d-flex align-items-center gap-2 mb-4 pb-3 border-bottom">
                    <span
                      style={{
                        width: "4px",
                        height: "22px",
                        borderRadius: "999px",
                        backgroundColor: "#4a7cf3",
                        display: "inline-block",
                      }}
                    />
                    <h5 className="mb-0">Change Password</h5>
                  </div>

                  <Form onSubmit={handleChangePassword}>
                    {/* {passwordError ? <Alert color="danger">{passwordError}</Alert> : null}
                    {passwordSuccess ? <Alert color="success">{passwordSuccess}</Alert> : null} */}

                    <div className="mb-3 position-relative">
                      <Label>Current Password *</Label>
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="btn btn-link text-muted p-0 position-absolute"
                        style={{ right: "14px", top: "38px" }}
                      >
                        <i className={showCurrentPassword ? "mdi mdi-eye-off-outline" : "mdi mdi-eye-outline"} />
                      </button>
                    </div>

                    <div className="mb-3 position-relative">
                      <Label>New Password *</Label>
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="btn btn-link text-muted p-0 position-absolute"
                        style={{ right: "14px", top: "38px" }}
                      >
                        <i className={showNewPassword ? "mdi mdi-eye-off-outline" : "mdi mdi-eye-outline"} />
                      </button>
                    </div>

                    <div className="mb-3 position-relative">
                      <Label>Confirm New Password *</Label>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="btn btn-link text-muted p-0 position-absolute"
                        style={{ right: "14px", top: "38px" }}
                      >
                        <i className={showConfirmPassword ? "mdi mdi-eye-off-outline" : "mdi mdi-eye-outline"} />
                      </button>
                    </div>

                    <div className="mt-4">
                      <Button type="submit" color="primary" className="w-100 py-2">
                        <i className="mdi mdi-key me-2" />
                        Change Password
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>

            <Col xl="4">
              <Card className="h-100 shadow-sm">
                <CardBody>
                  <div className="d-flex align-items-center gap-2 mb-4 pb-3 border-bottom">
                    <span
                      style={{
                        width: "4px",
                        height: "22px",
                        borderRadius: "999px",
                        backgroundColor: "#4a7cf3",
                        display: "inline-block",
                      }}
                    />
                    <h5 className="mb-0">Reset Password</h5>
                  </div>

                  <Form onSubmit={handleResetPassword}>
                    <div className="mb-3">
                      <Label>Username *</Label>
                      <Input
                        type="text"
                        placeholder="Enter username to reset password"
                        value={resetUsername}
                        onChange={(event) => setResetUsername(event.target.value)}
                      />
                      <small className="text-muted d-block mt-2">
                        Enter the username to reset their password to default
                      </small>
                    </div>

                    <div className="mt-5 pt-2">
                      <Button type="submit" color="primary" className="w-100 py-2">
                        <i className="mdi mdi-refresh me-2" />
                        Reset Password
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default withRouter(MyProfile);
