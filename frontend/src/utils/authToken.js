export const getAuthToken = () =>
  localStorage.getItem('token') || sessionStorage.getItem('token');

export const storeAuthToken = (token, rememberMe) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  const otherStorage = rememberMe ? sessionStorage : localStorage;

  storage.setItem('token', token);
  otherStorage.removeItem('token');
};

export const clearAuthToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};
