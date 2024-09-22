import React, { useState } from "react";
import { useQuery } from "react-query"; // Import useQuery
import { getAccountDetails } from "../../services/accountService"; // Import the API call

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"account" | "membership" | "payments">("account");

  // Fetch account details using React Query
  const { data: accountData, isLoading, isError } = useQuery("accountDetails", getAccountDetails);

  if (isLoading) {
    return <p>Loading account details...</p>;
  }

  if (isError) {
    return <p>Error loading account details.</p>;
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Tabs */}
      <div className="flex justify-between items-center border-b border-black pb-2">
        <div className="flex space-x-4">
          <button
            className={`${
              activeTab === "account"
                ? "text-black border-b-2 border-black"
                : "text-gray-600"
            } pb-2`}
            onClick={() => setActiveTab("account")}
          >
            My Account
          </button>
          <button
            className={`${
              activeTab === "membership"
                ? "text-black border-b-2 border-black"
                : "text-gray-600"
            } pb-2`}
            onClick={() => setActiveTab("membership")}
          >
            Membership
          </button>
          <button
            className={`${
              activeTab === "payments"
                ? "text-black border-b-2 border-black"
                : "text-gray-600"
            } pb-2`}
            onClick={() => setActiveTab("payments")}
          >
            Payments
          </button>
        </div>
      </div>

      {/* Content for each tab */}
      <div className="space-y-4">
        {activeTab === "account" && accountData && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">My Account</h2>
            <p className="text-gray-600">Name: {accountData.name}</p>
            <p className="text-gray-600">Subscription Plan: {accountData.subscription.plan}</p>
          </div>
        )}

        {activeTab === "membership" && accountData && accountData.members && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Membership</h2>
            <p className="text-gray-600">Members: {accountData.members.length}</p>
            <ul className="list-disc list-inside">
              {accountData.members.map((member: any, index: number) => (
                <li key={index} className="text-gray-600">
                  {member.username} ({member.role})
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Payments</h2>
            <p className="text-gray-600">No payment information available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
