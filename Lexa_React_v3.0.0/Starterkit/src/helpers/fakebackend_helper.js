import axios from "axios"
import { get, post } from "./api_helper"
import * as url from "./url_helper"

// Gets the logged in user data from local session
const getLoggedInUser = () => {
  const user = localStorage.getItem("user");
  if (user) return JSON.parse(user);
  return null;
};

//is user is logged in
const isUserAuthenticated = () => {
  return getLoggedInUser() !== null;
};

const buildPageParams = (overrides = {}) => {
  return {
    start: 0,
    length: 10,
    sortColumn: "",
    sortColumnDir: "desc",
    searchValue: "",
    ...overrides,
  }
}

// Register Method
const postFakeRegister = data => {
  return axios
    .post(url.POST_FAKE_REGISTER, data)
    .then(response => {
      if (response.status >= 200 || response.status <= 299) return response.data;
      throw response.data;
    })
    .catch(err => {
      let message;
      if (err.response && err.response.status) {
        switch (err.response.status) {
          case 404:
            message = "Sorry! the page you are looking for could not be found";
            break;
          case 500:
            message =
              "Sorry! something went wrong, please contact our support team";
            break;
          case 401:
            message = "Invalid credentials";
            break;
          default:
            message = err[1];
            break;
        }
      }
      throw message;
    });
};

// Login Method
const postFakeLogin = async data => {
  const userName = data.userName || data.email || ""
  const password = data.password || ""

  if (!userName || !password) {
    throw "Please enter username and password"
  }

  try {
    const response = await post("/Auth/Login", null, {
      params: {
        userName,
        password,
      },
    })

    return response
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Login API call failed"
    )
  }
};

const getMenuPages = async () => {
  try {
    return await get("/Menu/GetAllpage", {
      params: buildPageParams({ length: 100 }),
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Menu API call failed"
    )
  }
};

const getUsersPages = async (params = {}) => {
  try {
    return await get("/User/GetAllpage", {
      params: buildPageParams(params),
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Users API call failed"
    )
  }
};

// postForgetPwd
const postFakeForgetPwd = data => post(url.POST_FAKE_PASSWORD_FORGET, data);

// Edit profile
const postJwtProfile = data => post(url.POST_EDIT_JWT_PROFILE, data);

const postFakeProfile = data => post(url.POST_EDIT_PROFILE, data);

// Register Method
const postJwtRegister = (url, data) => {
  return axios
    .post(url, data)
    .then(response => {
      if (response.status >= 200 || response.status <= 299) return response.data;
      throw response.data;
    })
    .catch(err => {
      var message;
      if (err.response && err.response.status) {
        switch (err.response.status) {
          case 404:
            message = "Sorry! the page you are looking for could not be found";
            break;
          case 500:
            message =
              "Sorry! something went wrong, please contact our support team";
            break;
          case 401:
            message = "Invalid credentials";
            break;
          default:
            message = err[1];
            break;
        }
      }
      throw message;
    });
};

// Login Method
const postJwtLogin = data => post(url.POST_FAKE_JWT_LOGIN, data);

// postForgetPwd
const postJwtForgetPwd = data => post(url.POST_FAKE_JWT_PASSWORD_FORGET, data);

// postSocialLogin
export const postSocialLogin = data => post(url.SOCIAL_LOGIN, data);


// export const getUserProfile = () => get(url.GET_USER_PROFILE)

export {
  getLoggedInUser,
  isUserAuthenticated,
  postFakeRegister,
  postFakeLogin,
  postFakeProfile,
  postFakeForgetPwd,
  postJwtRegister,
  postJwtLogin,
  postJwtForgetPwd,
  postJwtProfile,
  getMenuPages,
  getUsersPages,
  buildPageParams,
}
