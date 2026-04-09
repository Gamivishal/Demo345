import { call, put, takeEvery, takeLatest } from "redux-saga/effects";

// Login Redux States
import { LOGIN_USER, LOGOUT_USER, SOCIAL_LOGIN } from "./actionTypes";
import { apiError, loginSuccess, logoutUserSuccess } from "./actions";

//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import {
  postFakeLogin,
  postJwtLogin,
  getMenuAccessPages,
} from "../../../helpers/fakebackend_helper";
import { showSuccess } from "../../../Pop_show/alertService";

const fireBaseBackend = getFirebaseBackend();

function* loginUser({ payload: { user, history } }) {
  try {
    const userName = user.userName || user.email;

    const loadUserMenus = function* () {
      try {
        const menuResponse = yield call(getMenuAccessPages)
        const menuList = Array.isArray(menuResponse)
          ? menuResponse
          : Array.isArray(menuResponse?.data)
            ? menuResponse.data
            : []

        localStorage.setItem("menuPages", JSON.stringify(menuList))
      } catch (menuError) {
        localStorage.removeItem("menuPages")
      }
    }

    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const response = yield call(
        fireBaseBackend.loginUser,
        userName,
        user.password
      );
      if (response?.statusCode === 1 || response?.isSuccess) {
        yield call(showSuccess, response)
      }
      yield* loadUserMenus()
      yield put(loginSuccess(response));
      history('/dashboard');
    } else if (process.env.REACT_APP_DEFAULTAUTH === "jwt") {
      const response = yield call(postJwtLogin, {
        email: userName,
        userName,
        password: user.password,
      });
      if (response?.statusCode === 1 || response?.isSuccess) {
        yield call(showSuccess, response)
      }
      localStorage.setItem("authUser", JSON.stringify(response));
      if (response?.accessToken || response?.token || response?.data) {
        localStorage.setItem(
          "data",
          JSON.stringify({
            data: response.accessToken || response.token || response.data,
          })
        );
      }
      yield* loadUserMenus()
      yield put(loginSuccess(response));
      history('/dashboard');
    } else if (process.env.REACT_APP_DEFAULTAUTH === "fake") {
      const response = yield call(postFakeLogin, {
        email: userName,
        userName,
        password: user.password,
      });

      if (!(response?.isSuccess && response?.statusCode === 1 && response?.data)) {
        throw response?.message || "Invalid username or password";
      }

      yield call(showSuccess, response)

      const loginPayload = {
        userName,
        email: userName,
        token: response.data,
        accessToken: response.data,
        message: response.message,
      };

      localStorage.setItem("authUser", JSON.stringify(loginPayload));
      if (loginPayload?.accessToken || loginPayload?.token || loginPayload?.data) {
        localStorage.setItem(
          "data",
          JSON.stringify({
            data: loginPayload.accessToken || loginPayload.token || loginPayload.data,
          })
        );
      }

      yield* loadUserMenus()

      yield put(loginSuccess(loginPayload));
      history('/dashboard');
    }
  } catch (error) {
    yield put(apiError(error?.message || error));
  }
}

function* logoutUser({ payload: { history } }) {
  try {
    localStorage.removeItem("authUser");
    localStorage.removeItem("data");
    localStorage.removeItem("menuPages");

    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const response = yield call(fireBaseBackend.logout);
      yield put(logoutUserSuccess(response));
    }
    history('/login');
  } catch (error) {
    yield put(apiError(error));
  }
}

function* socialLogin({ payload: { type, history } }) {
  try {
    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const fireBaseBackend = getFirebaseBackend();
      const response = yield call(fireBaseBackend.socialLoginUser, type);
      if (response) {
        history("/dashboard");
      } else {
        history("/login");
      }
      localStorage.setItem("authUser", JSON.stringify(response));
      yield put(loginSuccess(response));
    }
    const response = yield call(fireBaseBackend.socialLoginUser, type);
    if(response)
    history("/dashboard");
  } catch (error) {
    yield put(apiError(error));
  }
}

function* authSaga() {
  yield takeEvery(LOGIN_USER, loginUser);
  yield takeLatest(SOCIAL_LOGIN, socialLogin);
  yield takeEvery(LOGOUT_USER, logoutUser);
}

export default authSaga;
