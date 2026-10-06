const API_BASE_URL = "http://127.0.0.1:8000";

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Invalid email or password."
    );
  }

  return data;
};

export const forgotPassword = async (email) => {
  const response = await fetch(
    "http://127.0.0.1:8000/api/auth/forgot-password/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.email?.[0] ||
      data.message ||
      "Unable to process password reset request."
    );
  }

  return data;
};

export const resetPassword = async (
  uid,
  token,
  newPassword,
  confirmPassword
) => {
  const response = await fetch(
    "http://127.0.0.1:8000/api/auth/reset-password/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: uid,
        token: token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.confirm_password?.[0] ||
      data.new_password?.[0] ||
      data.message ||
      "Unable to reset password."
    );
  }

  return data;
};