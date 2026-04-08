import { call, put, takeEvery, takeLatest } from "redux-saga/effects";

// Login Redux States
import { LOGIN_USER, LOGOUT_USER, SOCIAL_LOGIN } from "./actionTypes";
import { apiError, loginSuccess, logoutUserSuccess } from "./actions";

//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import {
  postFakeLogin,
  postJwtLogin,
  getMenuPages,
} from "../../../helpers/fakebackend_helper";

const fireBaseBackend = getFirebaseBackend();

function* loginUser({ payload: { user, history } }) {
  try {
    const userName = user.userName || user.email;

    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const response = yield call(
        fireBaseBackend.loginUser,
        userName,
        user.password
      );
      yield put(loginSuccess(response));
      history('/dashboard');
    } else if (process.env.REACT_APP_DEFAULTAUTH === "jwt") {
      const response = yield call(postJwtLogin, {
        email: userName,
        userName,
        password: user.password,
      });
      localStorage.setItem("authUser", JSON.stringify(response));
      if (response?.accessToken || response?.token || response?.data) {
        localStorage.setItem(
          "data",
          JSON.stringify({
            data: response.accessToken || response.token || response.data,
          })
        );
      }
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

      try {
        const menuResponse = yield call(getMenuPages);
        if (menuResponse?.isSuccess && menuResponse?.statusCode === 1) {
          localStorage.setItem(
            "menuPages",
            JSON.stringify(menuResponse?.data?.data || [])
          );
        } else {
          localStorage.removeItem("menuPages");
        }
      } catch (menuError) {
        localStorage.removeItem("menuPages");
      }

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
