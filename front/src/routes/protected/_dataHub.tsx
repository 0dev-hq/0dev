import DataHubLayout from "@/view/layout/DataHubLayout";
import NewDataHubPage from "@/view/pages/_dataHub/NewDataHubPage";
import DataHubDashboardPage from "@/view/pages/_dataHub/DataHubDashboardPage";
import DataHubEcommercePage from "@/view/pages/_dataHub/DataHubEcommercePage";
import DataHubContentSocialPage from "@/view/pages/_dataHub/DataHubContentSocialPage";
import DataHubSEOAnalyticsPage from "@/view/pages/_dataHub/DataHubSEOAnalyticsPage";
import DataHubCRMPage from "@/view/pages/_dataHub/DataHubCRMPage";
import DataHubCustomerEngagementPage from "@/view/pages/_dataHub/DataHubCustomerEngagementPage";
import DataHubAdvertisingPlatformsPage from "@/view/pages/_dataHub/DataHubAdvertisingPlatformsPage";
import DataHubPaymentsFinancePage from "@/view/pages/_dataHub/DataHubPaymentsFinancePage";
import DataHubSupportTicketingPage from "@/view/pages/_dataHub/DataHubSupportTicketingPage";
import DataHubSurveysFeedbackPage from "@/view/pages/_dataHub/DataHubSurveysFeedbackPage";

const dataHubRoutes = [
  {
    path: "data-hub",
    element: <DataHubLayout />,
    children: [
      { path: "new", element: <NewDataHubPage /> },
      { path: "edit/:id", element: <NewDataHubPage /> },
      { path: "dashboard", element: <DataHubDashboardPage /> },
      { path: "ecommerce", element: <DataHubEcommercePage /> },
      { path: "content-social", element: <DataHubContentSocialPage /> },
      { path: "seo-analytics", element: <DataHubSEOAnalyticsPage /> },
      { path: "crm", element: <DataHubCRMPage /> },
      { path: "customer-engagement", element: <DataHubCustomerEngagementPage /> },
      { path: "advertising-platforms", element: <DataHubAdvertisingPlatformsPage /> },
      { path: "payments-finance", element: <DataHubPaymentsFinancePage /> },
      { path: "support-ticketing", element: <DataHubSupportTicketingPage /> },
      { path: "surveys-feedback", element: <DataHubSurveysFeedbackPage /> },
    ],
  },
];

export default dataHubRoutes;
