export const saveTokens = (access, refresh) => {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};

export const getAccessToken = () => localStorage.getItem('accessToken');

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const isLoggedIn = () => !!localStorage.getItem('accessToken');