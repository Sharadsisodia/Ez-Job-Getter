export const saveTokens = (access, refresh) => {
localStorage.setItem('access', access);
localStorage.setItem('refresh', refresh);
};


export const getAccessToken = () => localStorage.getItem('access');


export const logout = () => {
localStorage.removeItem('access');
localStorage.removeItem('refresh');
};


export const isLoggedIn = () => !!localStorage.getItem('access');