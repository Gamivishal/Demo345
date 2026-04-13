
import axios from "axios";
import { del, get, post } from "./api_helper";
import * as url from "./url_helper";
import { getBlob, exportToExcel } from "./api_helper";

// UserDemo API helpers
const USER_DEMO_BASE_URL = "https://localhost:7281/api/UserDemo";

// Get paginated users
export async function getUserDemoList({ start = 0, length = 10, sortColumnDir = "asc" }) {
  const url = `${USER_DEMO_BASE_URL}/GetAllpage?start=${start}&length=${length}&sortColumnDir=${sortColumnDir}`;
  const response = await axios.get(url);
  return response.data;
}

// Get user by ID
export async function getUserDemoById(id) {
  const url = `${USER_DEMO_BASE_URL}/GetById?id=${id}`;
  const response = await axios.get(url);
  return response.data;
}

// Add or update user (with file upload)
export async function saveUserDemo(formData) {
  const url = `${USER_DEMO_BASE_URL}/Add`;
  // formData should be FormData instance
  const response = await axios.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

// Reset Password API
const resetPassword = async (username) => {
  try {
    return await post("/User/ResetPassword", null, {
      params: { username },
    });
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Reset password failed"
    );
  }
};

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

// Export users to Excel
export const exportUsers = async (params = {}) => {
  return await exportToExcel("/User/ExportToExcel", "Users.xlsx", { params });
};

// Export users to PDF
export const exportUsersPdf = async (params = {}) => {
  return await exportToExcel("/User/ExportToPdf", "Users.pdf", { params });
};

// using into ROle For Get value into Dropdown
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

const getMenusPages = async (params = {}) => {
  try {
    return await get("/Menu/GetAllpage", {
      params: buildPageParams(params),
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Menus API call failed"
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

const getRolesPages = async (params = {}) => {
  try {
    return await get("/Role/GetAllpage", {
      params: buildPageParams(params),
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Roles API call failed"
    )
  }
};

const getUserById = async id => {
  try {
    return await get("/User/GetById", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "User fetch by id failed"
    )
  }
}

const getRoleById = async id => {
  try {
    return await get("/Role/GetById", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Role fetch by id failed"
    )
  }
}

const getMenuById = async id => {
  try {
    return await get("/Menu/GetById", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Menu fetch by id failed"
    )
  }
}

const getLovColumns = async (params = {}) => {
  try {
    return await get("/Lov/Get", {
      params: {
        flag: "LI",
        ...params,
      },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "LOV columns API call failed"
    )
  }
}

const getLovMasterByColumn = async lovColumn => {
  try {
    return await get("/Lov/Get", {
      params: {
        flag: "LE",
        lovColumn,
      },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "LOV master fetch failed"
    )
  }
}

const getLovDetailsByColumn = async (lovColumn, params = {}) => {
  try {
    return await get("/Lov/Get", {
      params: {
        flag: "LDI",
        lovColumn,
        ...params,
      },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "LOV detail list API call failed"
    )
  }
}

const getLovDetailByCode = async (lovColumn, lovCode) => {
  try {
    return await get("/Lov/Get", {
      params: {
        flag: "LDE",
        lovColumn,
        lovCode,
      },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "LOV detail fetch failed"
    )
  }
}

const saveUser = async payload => {
  try {
    return await post("/User/Add", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "User save failed"
    )
  }
}

const saveRole = async payload => {
  try {
    return await post("/Role/Save", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Role save failed"
    )
  }
}

const saveMenu = async payload => {
  try {
    return await post("/Menu/Add", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Menu save failed"
    )
  }
}

const saveLovMaster = async payload => {
  try {
    return await post("/Lov/SaveMaster", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "LOV master save failed"
    )
  }
}

const saveLovDetail = async payload => {
  try {
    return await post("/Lov/SaveDetail", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "LOV detail save failed"
    )
  }
}

const getRoleNames = async () => {
  try {
    return await get("/Dropdown/RoleName")
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Role dropdown API call failed"
    )
  }
}

const getRoleMenuPages = async () => {
  try {
    return await get("/Menu/GetAllpage", {
      params: buildPageParams({
        length: 100,
        sortColumnDir: "asc",
      }),
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Role menu API call failed"
    )
  }
}

const getMenuAccessPages = async () => {
  try {
    return await get("/MenuAccess/GetMenuAccess")
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Menu access API call failed"
    )
  }
}

const deleteUserById = async id => {
  try {
    return await del("/User/Delete", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "User delete failed"
    )
  }
}

const deleteRoleById = async id => {
  try {
    return await del("/Role/Delete", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Role delete failed"
    )
  }
}

const deleteMenuById = async id => {
  try {
    return await del(`https://localhost:7281/api/Menu/Delete?id=${id}`)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Menu delete failed"
    )
  }
}

const changePassword = async payload => {
  try {
    return await post("/ChangePassword/Add", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Change password failed"
    )
  }
}

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
  getMenusPages,
  getUsersPages,
  getRolesPages,
  getMenuById,
  getUserById,
  getRoleById,
  getLovColumns,
  getLovMasterByColumn,
  getLovDetailsByColumn,
  getLovDetailByCode,
  getRoleNames,
  getRoleMenuPages,
  getMenuAccessPages,
  saveUser,
  saveRole,
  saveMenu,
  saveLovMaster,
  saveLovDetail,
  deleteUserById,
  deleteRoleById,
  deleteMenuById,
  changePassword,
  buildPageParams,
  resetPassword,
}
