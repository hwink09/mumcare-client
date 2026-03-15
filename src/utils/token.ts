export const setToken = (token: string, remember: boolean) => {
  if (remember) {
    localStorage.setItem("accessToken", token);
    sessionStorage.removeItem("accessToken"); // ensure session storage is clear
  } else {
    sessionStorage.setItem("accessToken", token);
    localStorage.removeItem("accessToken"); // ensure local storage is clear
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
};

export const removeToken = () => {
  localStorage.removeItem("accessToken");
  sessionStorage.removeItem("accessToken");
};
