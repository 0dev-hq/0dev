import NewQueryPage from "@/view/pages/NewQueryPage";
import QueriesPage from "@/view/pages/QueriesPage";
import RunQueryPage from "@/view/pages/RunQueryPage";

const queryRoutes = [
  { path: "query", element: <QueriesPage /> },
  { path: "query/new", element: <NewQueryPage /> },
  { path: "query/edit/:id", element: <NewQueryPage /> },
  { path: "query/run", element: <RunQueryPage /> },
];

export default queryRoutes;
