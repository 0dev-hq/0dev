import DataSourcesPage from "@/view/pages/DataSourcesPage";
import NewDataSourcePage from "@/view/pages/NewDataSourcePage";

const dataSourceRoutes = [
  { path: "data-source", element: <DataSourcesPage /> },
  { path: "data-source/new", element: <NewDataSourcePage /> },
  { path: "data-source/edit/:id", element: <NewDataSourcePage /> },
];

export default dataSourceRoutes;
