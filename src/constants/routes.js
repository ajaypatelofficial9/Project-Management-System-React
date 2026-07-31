const baseRoutes = {
  loginPage: '/login',
  signupPage: '/signup',
  homePage: '/',
  userProfile: '/profile',
  dashboard: '/dashboard',
  projects: '/projects',
  projectDetail: '/projects/:id',
  projectDetailPath: (id) => `/projects/${id}`,
  taskDetail: '/tasks/:id',
  taskDetailPath: (id) => `/tasks/${id}`,
  users: '/users',
};

export default baseRoutes;
