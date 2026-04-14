import React from "react"
import { Navigate } from "react-router-dom"

// Profile
import MyProfile from "../pages/Authentication/my-profile"


// Authentication related pages
import Login from "../pages/Authentication/Login"
import Logout from "../pages/Authentication/Logout"
import Register from "../pages/Authentication/Register"
import ForgetPwd from "../pages/Authentication/ForgetPassword"
import ForgetPwd2 from "../pages/Authentication/ForgetPassword2"
import OtpPage from "../pages/Authentication/OtpPage"
import ResetPasswordPage from "../pages/Authentication/ResetPasswordPage"

// Inner Authentication
import Login1 from "../pages/AuthenticationInner/Login"
import Register1 from "../pages/AuthenticationInner/Register"
import Recoverpw from "../pages/AuthenticationInner/Recoverpw"
import LockScreen from "../pages/AuthenticationInner/auth-lock-screen"

// Dashboard
import Dashboard from "../pages/Dashboard/index"
import Users from "../pages/User"
import Roles from "../pages/Role"
import Menus from "../pages/Menu"
import Lov from "../pages/Lov"
import Property from "../pages/Property"


//Extra Pages
import PagesBlank from "../pages/Extra Pages/pages-blank";
import Pages404 from "../pages/Extra Pages/pages-404";
import Pages500 from "../pages/Extra Pages/pages-500";

import UserDemo from "../pages/UserDemo";

const userRoutes = [
  { path: "/dashboard", component: <Dashboard /> },

  // // //profile
  { path: "/profile", component: <MyProfile /> },

  { path: "/users", component: <Users /> },
  { path: "/users/manage", component: <Users /> },
  { path: "/users/manage/:id", component: <Users /> },

  { path: "/roles", component: <Roles /> },
  { path: "/roles/manage", component: <Roles /> },
  { path: "/roles/manage/:id", component: <Roles /> },

  { path: "/menu", component: <Menus /> },
  { path: "/menus", component: <Menus /> },
  { path: "/menus/manage", component: <Menus /> },
  { path: "/menus/manage/:id", component: <Menus /> },

  { path: "/lov", component: <Lov /> },
  { path: "/lovs", component: <Lov /> },
  { path: "/lov/manage", component: <Lov /> },
  { path: "/lovs/manage", component: <Lov /> },
  { path: "/lov/manage/:lovColumn", component: <Lov /> },
  { path: "/lovs/manage/:lovColumn", component: <Lov /> },
  { path: "/lov/details/:lovColumn", component: <Lov /> },
  { path: "/lovs/details/:lovColumn", component: <Lov /> },
  { path: "/lov/details/:lovColumn/manage", component: <Lov /> },
  { path: "/lovs/details/:lovColumn/manage", component: <Lov /> },
  { path: "/lov/details/:lovColumn/manage/:lovCode", component: <Lov /> },
  { path: "/lovs/details/:lovColumn/manage/:lovCode", component: <Lov /> },
  { path: "/pages-blank", component: <PagesBlank /> },
  { path: "/userdemo", component: <UserDemo /> },
  { path: "/userdemo/manage", component: <UserDemo /> },
  { path: "/userdemo/manage/:id", component: <UserDemo /> },
  { path: "/userdemos", component: <UserDemo /> },
  { path: "/property", component: <Property /> },
  { path: "/property/manage", component: <Property /> },
  { path: "/property/manage/:id", component: <Property /> },
  { path: "/propertys", component: <Property /> },

  // this route should be at the end of all other routes
  {
    path: "/",
    exact: true,
    component: <Navigate to="/login" />,
  },
]

const authRoutes = [
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPwd /> },
  { path: "/forgot-password2", component: <ForgetPwd2 /> },
  { path: "/register", component: <Register /> },
  { path: "/otp", component: <OtpPage /> },
  { path: "/reset-password", component: <ResetPasswordPage /> },

  { path: "/pages-404", component: <Pages404 /> },
  { path: "/pages-500", component: <Pages500 /> },

  // Authentication Inner
  { path: "/pages-login", component: <Login1 /> },
  { path: "/pages-register", component: <Register1 /> },
  { path: "/page-recoverpw", component: <Recoverpw /> },
  { path: "/auth-lock-screen", component: <LockScreen /> },
]

export { userRoutes, authRoutes }