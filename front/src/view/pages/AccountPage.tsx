import React, { useState } from "react";
import { useQuery, useMutation } from "react-query";
import { getAccountDetails, inviteMember } from "../../services/accountService"; // Import the inviteMember service
import { toast } from "react-toastify"; // Assuming you're using react-toastify for toast notifications

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"account" | "membership" | "payments">("account");

  // Fetch account details using React Query
  const { data: accountData, isLoading, isError } = useQuery("accountDetails", getAccountDetails);
  
  const [newMemberEmail, setNewMemberEmail] = useState<string>("");
  const [newMemberRole, setNewMemberRole] = useState<string>("Editor"); // Default role is Editor

  // Mutation to invite a new member
  const mutation = useMutation(({ email, role }: { email: string; role: string }) => inviteMember(email, role), {
    onSuccess: () => {
      toast.success("Invitation sent to the new member!");
      setNewMemberEmail(""); // Reset the input field
    },
    onError: () => {
      toast.error("Failed to send the invitation. Please try again.");
    },
  });

  const handleAddMember = () => {
    if (!newMemberEmail) {
      toast.error("Please enter a valid email.");
      return;
    }

    // Trigger the mutation to invite the member
    mutation.mutate({ email: newMemberEmail, role: newMemberRole });
  };

  const handleChangeRole = (userId: string, newRole: string) => {
    // Placeholder function to change user role
    alert(`Change role for ${userId} to ${newRole}`);
  };

  const handleDeactivateMember = (userId: string) => {
    // Placeholder function to deactivate member
    alert(`Deactivate member: ${userId}`);
  };

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
            {/* Add New Member */}
            <div className="flex items-center space-x-4">
              <input
                type="email"
                placeholder="New member email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-1/3 hover:border-black"
              />
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Readonly">Readonly</option>
              </select>
              <button
                onClick={handleAddMember}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Add Member
              </button>
            </div>

            {/* Membership List */}
            <p className="text-gray-600">Current members: {accountData.members.length}</p>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 text-left">Email</th>
                  <th className="py-2 text-left">Role</th>
                  <th className="py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accountData.members.map((member: any, index: number) => (
                  <tr key={index}>
                    <td className="py-2">{member.email}</td>
                    <td className="py-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole(member.userId, e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Editor">Editor</option>
                        <option value="Readonly">Readonly</option>
                      </select>
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => handleDeactivateMember(member.userId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
