import ReportCanvasPage from "@/view/pages/ReportCanvasPage";
import ReportsPage from "@/view/pages/ReportsPage";
import ReportViewPage from "@/view/pages/ReportViewPage";

const reportRoutes = [
  { path: "report", element: <ReportsPage /> },
  { path: "report/new", element: <ReportCanvasPage /> },
  { path: "report/edit/:id", element: <ReportCanvasPage /> },
  { path: "report/view/:id", element: <ReportViewPage /> },
];

export default reportRoutes;
