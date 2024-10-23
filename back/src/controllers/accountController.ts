import Account from "../models/Account";
import { Invitation } from "../models/Invitation";
import User, { IUser } from "../models/User";
import { sendInvitationEmail } from "../services/emailService";
import { Request, Response } from "express";
import { Types } from "mongoose";
import logger from "../utils/logger";

// Send an invitation to a new member
export const sendInvitation = async (req: Request, res: Response) => {
  const { email, role } = req.body;
  const accountId = req.user!.account;
  const invitingUserId = req.user!.id;

  // Generate a unique token for the invitation
  const token = crypto.randomUUID().replace(/-/g, "");

  // Create expiration date (e.g., 7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Create the invitation
  const invitation = new Invitation({
    email,
    accountId,
    invitingUserId,
    role,
    token,
    expiresAt,
  });

  await invitation.save();

  // Send an invitation email
  const invitationLink = `${process.env.FRONTEND_URL}/auth/signup?invitationToken=${token}&email=${email}`;
  await sendInvitationEmail(email, invitationLink);

  res.status(200).json({ message: "Invitation sent successfully" });
};

// Controller to get account details
export const getAccount = async (req: Request, res: Response) => {
  try {
    // Assuming userId is available in req.user from an authentication middleware
    const userId = req.user!.id as any;

    // Find the user's account
    const user = await User.findById(userId).populate("account");

    // Find the account details, including members
    const account = await Account.findById(user!.account)
      .populate("members.userId", "_id username email isActive role")
      .exec();

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Check if the current user is the account owner or admin
    const isAdmin = account.owner == userId || user?.role === "admin";

    // Prepare the response
    const response = {
      name: account.name,
      subscription: account.subscription,
      // Only include members if the user is an admin
      members: isAdmin
        ? account.members.map((member) => ({
            username: (member.userId as IUser).username,
            role: (member.userId as IUser).role,
            id: (member.userId as IUser)._id,
            isActive: (member.userId as IUser).isActive,
          }))
        : null,
    };

    return res.status(200).json(response);
  } catch (error) {
    logger.error("Error fetching account:", error);
    return res.status(500).json({ message: "Error fetching account details" });
  }
};

// Controller to deactivate a user
export const deactivateUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Find the user to deactivate
    const user = await User.findOne({ _id: id, account: req.user!.account });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Get the account of the user and check if the user is the owner
    const account = await Account.findById(user.account);
    if (!account || account.owner.toString() == user._id!.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    user.isActive = false;
    await user.save();
    return res.status(200).json({ message: "User deactivated successfully" });
  } catch (error) {
    logger.error("Error deactivating user:", error);
    return res.status(500).json({ message: "Error deactivating user" });
  }
};

// Activate a user
export const activateUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Find the user to activate
    const user = await User.findOne({ _id: id, account: req.user!.account });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    user.isActive = true;
    await user.save();
    return res.status(200).json({ message: "User activated successfully" });
  } catch (error) {
    logger.error("Error activating user:", error);
    return res.status(500).json({ message: "Error activating user" });
  }
};

// Change user role - only admin and owner can change roles
export const changeUserRole = async (req: Request, res: Response) => {
  const { id } = req.params; // User ID whose role is being changed
  const { role } = req.body; // New role to be assigned

  try {
    // Find the user making the request
    const requestingUser = await User.findOne({
      _id: req.user!.id,
      account: req.user!.account,
    });
    if (!requestingUser) {
      return res.status(400).json({ message: "Requesting user not found" });
    }

    // Find the account to which the user belongs
    const account = await Account.findById(requestingUser.account);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Check if the requesting user is an admin or the owner
    const isAdmin =
      account.owner.toString() === requestingUser._id!.toString() ||
      requestingUser.role === "admin";

    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Only an admin or owner can change roles" });
    }

    // Prevent changing the owner's role
    if (account.owner.toString() === id) {
      return res
        .status(403)
        .json({ message: "Cannot change the owner's role" });
    }

    // Find the user whose role is being changed
    const user = await User.findOne({ _id: id, account: req.user!.account });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Update the user's role
    user.role = role;
    await user.save();

    return res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
    logger.error("Error changing user role:", error);
    return res.status(500).json({ message: "Error changing user role" });
  }
};
