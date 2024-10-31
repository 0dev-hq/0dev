import DataSourceAnalysisPage from "@/view/pages/data-source/DataSourceAnalysisPage";
import DataSourcesPage from "@/view/pages/DataSourcesPage";
import NewDataSourcePage from "@/view/pages/NewDataSourcePage";


const routes = [
  { path: "data-source", element: <DataSourcesPage /> },
  { path: "data-source/new", element: <NewDataSourcePage /> },
  { path: "data-source/edit/:id", element: <NewDataSourcePage /> },
  { path: "data-source/:id/analysis", element: <DataSourceAnalysisPage /> },
];

export default routes;
