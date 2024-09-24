import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { activateUser, changeUserRole, deactivateUser, getAccountDetails, inviteMember } from "../../services/accountService"; 
import { toast } from "react-toastify";

const AccountPage: React.FC = () => {
  const queryClient = useQueryClient(); // Initialize queryClient to refetch data
  const [activeTab, setActiveTab] = useState<"account" | "membership" | "payments">("account");
  const [newMemberEmail, setNewMemberEmail] = useState<string>("");
  const [newMemberRole, setNewMemberRole] = useState<string>("Editor"); 

  // Fetch account details using React Query
  const { data: accountData, isLoading: isFetchingAccount, isError } = useQuery("accountDetails", getAccountDetails);
  
  // Track if any action is in progress
  const [actionInProgress, setActionInProgress] = useState(false);

  // Mutation to invite a new member
  const mutation = useMutation(({ email, role }: { email: string; role: string }) => inviteMember(email, role), {
    onMutate: () => setActionInProgress(true),
    onSettled: () => {
      setActionInProgress(false);
      queryClient.invalidateQueries("accountDetails"); // Refetch account details
    },
    onSuccess: () => {
      toast.success("Invitation sent to the new member!");
      setNewMemberEmail(""); 
    },
    onError: () => {
      toast.error("Failed to send the invitation. Please try again.");
    },
  });

  // Mutation to deactivate a member
  const deactivateMutation = useMutation((userId: string) => deactivateUser(userId), {
    onMutate: () => setActionInProgress(true),
    onSettled: () => {
      setActionInProgress(false);
      queryClient.invalidateQueries("accountDetails"); // Refetch account details
    },
    onSuccess: () => {
      toast.success("Member deactivated successfully!");
    },
    onError: () => {
      toast.error("Failed to deactivate the member. Please try again.");
    },
  });

  // Mutation to activate a member
  const activateMutation = useMutation((userId: string) => activateUser(userId), {
    onMutate: () => setActionInProgress(true),
    onSettled: () => {
      setActionInProgress(false);
      queryClient.invalidateQueries("accountDetails"); // Refetch account details
    },
    onSuccess: () => {
      toast.success("Member activated successfully!");
    },
    onError: () => {
      toast.error("Failed to activate the member. Please try again.");
    },
  });

  // Mutation to change user role
  const changeUserRoleMutation = useMutation(({ userId, role }: { userId: string; role: string }) => changeUserRole(userId, role), {
    onMutate: () => setActionInProgress(true),
    onSettled: () => {
      setActionInProgress(false);
      queryClient.invalidateQueries("accountDetails"); // Refetch account details
    },
    onSuccess: () => {
      toast.success("User role changed successfully!");
    },
    onError: () => {
      toast.error("Failed to change user role. Please try again.");
    },
  });

  const handleAddMember = () => {
    if (!newMemberEmail) {
      toast.error("Please enter a valid email.");
      return;
    }
    mutation.mutate({ email: newMemberEmail, role: newMemberRole });
  };

  const handleChangeRole = (userId: string, newRole: string) => {
    changeUserRoleMutation.mutate({ userId, role: newRole });
  };

  const handleDeactivateMember = (userId: string) => {
    deactivateMutation.mutate(userId);
  };

  const handleActivateMember = (userId: string) => {
    activateMutation.mutate(userId);
  }

  if (isFetchingAccount) {
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
            className={`${activeTab === "account" ? "text-black border-b-2 border-black" : "text-gray-600"} pb-2`}
            onClick={() => setActiveTab("account")}
          >
            My Account
          </button>
          <button
            className={`${activeTab === "membership" ? "text-black border-b-2 border-black" : "text-gray-600"} pb-2`}
            onClick={() => setActiveTab("membership")}
          >
            Membership
          </button>
          <button
            className={`${activeTab === "payments" ? "text-black border-b-2 border-black" : "text-gray-600"} pb-2`}
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
                disabled={actionInProgress}
              />
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
                disabled={actionInProgress}
              >
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Readonly">Readonly</option>
              </select>
              <button
                onClick={handleAddMember}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                disabled={actionInProgress}
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
                  <tr key={index} className={member.isActive == false ? "text-gray-400" : ""}>
                    <td className="py-2">{member.username}</td>
                    <td className="py-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole(member.id, e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1"
                        disabled={actionInProgress || member.isActive == false}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Editor">Editor</option>
                        <option value="Readonly">Readonly</option>
                      </select>
                    </td>
                    <td className="py-2">
                      {member.isActive == false ? (
                        <button
                          onClick={() => handleActivateMember(member.id)}
                          className="text-green-600 hover:text-green-800"
                          disabled={actionInProgress}
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeactivateMember(member.id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={actionInProgress}
                        >
                          Deactivate
                        </button>
                      )}
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
