interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
}

type RouteModule = { default: RouteConfig[] };

// Dynamically import all routes from protected and unprotected folders
const protectedModules = import.meta.glob("./protected/*.tsx", { eager: true });
const unprotectedModules = import.meta.glob("./unprotected/*.tsx", {
  eager: true,
});

// Define typed route arrays
let protectedRoutes: RouteConfig[] = [];
let unprotectedRoutes: RouteConfig[] = [];

Object.values(protectedModules).forEach((module) => {
  const routeModule = module as RouteModule;
  protectedRoutes = [...protectedRoutes, ...routeModule.default];
});

Object.values(unprotectedModules).forEach((module) => {
  const routeModule = module as RouteModule;
  unprotectedRoutes = [...unprotectedRoutes, ...routeModule.default];
});

// Export an object containing both protected and unprotected routes
export default { protected: protectedRoutes, unprotected: unprotectedRoutes };
