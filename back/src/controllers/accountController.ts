import Account from "../models/Account";
import { Invitation } from "../models/Invitation";
import User, { IUser } from "../models/User";
import { sendInvitationEmail } from "../services/emailService";
import { Request, Response } from "express";
import { Types } from "mongoose";

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
      .populate("members.userId", "username email")
      .exec();

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Check if the current user is the account owner or admin
    const isAdmin =
      account.owner == userId ||
      account.members.some(
        (member) =>
          member.userId.toString() == userId.toString() &&
          member.role === "Admin"
      );

    // Prepare the response
    const response = {
      name: account.name,
      subscription: account.subscription,
      // Only include members if the user is an admin
      members: isAdmin
        ? account.members.map((member) => ({
            username: (member.userId as IUser).username,
            role: member.role,
          }))
        : null,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching account:", error);
    return res.status(500).json({ message: "Error fetching account details" });
  }
};
