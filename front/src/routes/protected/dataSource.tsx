import AccountPage from "@/view/pages/_AccountPage";
import DataSourcesPage from "@/view/pages/DataSourcesPage";
import NewDataSourcePage from "@/view/pages/NewDataSourcePage";
import NewQueryPage from "@/view/pages/NewQueryPage";
import QueriesPage from "@/view/pages/QueriesPage";
import ReportCanvasPage from "@/view/pages/ReportCanvasPage";
import ReportsPage from "@/view/pages/ReportsPage";
import ReportViewPage from "@/view/pages/ReportViewPage";
import RunQueryPage from "@/view/pages/RunQueryPage";


const routes = [
  { path: "data-source", element: <DataSourcesPage /> },
  { path: "data-source/new", element: <NewDataSourcePage /> },
  { path: "data-source/edit/:id", element: <NewDataSourcePage /> },
  { path: "query", element: <QueriesPage /> },
  { path: "query/new", element: <NewQueryPage /> },
  { path: "query/edit/:id", element: <NewQueryPage /> },
  { path: "query/run", element: <RunQueryPage /> },
  { path: "report", element: <ReportsPage /> },
  { path: "report/new", element: <ReportCanvasPage /> },
  { path: "report/edit/:id", element: <ReportCanvasPage /> },
  { path: "report/view/:id", element: <ReportViewPage /> },
  { path: "account", element: <AccountPage /> },
];

export default routes;
