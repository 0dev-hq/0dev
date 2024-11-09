import { Request, Response, NextFunction } from "express";
import passport from "passport";
import User, { IUser } from "../models/user";
import Account from "../models/account";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendConfirmationEmail } from "../services/email-service";
import { IInvitation, Invitation } from "../models/invitation";
import { Types } from "mongoose";

// Define types for queries
interface GoogleLoginQuery {
  returnTo?: string;
  invitationToken?: string;
}

interface GoogleCallbackQuery {
  state?: string;
}

// Define types for requests with body data
interface SignupRequestBody {
  email: string;
  password: string;
}

interface AcceptInviteRequestBody {
  password: string;
}

// Define the request with typed params
export const googleLogin = (
  req: Request<{}, {}, {}, GoogleLoginQuery>,
  res: Response,
  next: NextFunction
) => {
  const returnTo = Array.isArray(req.query.returnTo)
    ? req.query.returnTo[0]
    : typeof req.query.returnTo === "string"
    ? req.query.returnTo
    : "/data-sources";

  req.session.returnTo = returnTo as string;

  if (req.query.invitationToken) {
    req.session.invitationToken = req.query.invitationToken as string;
  }

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: req.session.invitationToken || undefined,
  })(req, res, next);
};

export const googleCallback = async (
  req: Request<{}, {}, {}, GoogleCallbackQuery>,
  res: Response
) => {
  if (req.user) {
    const user = req.user as IUser;
    let [account, role] = ["", ""];

    if (!user.account) {
      const invitationToken = req.query.state;
      if (invitationToken) {
        const invitation = await Invitation.findOne({
          token: invitationToken,
          status: "pending",
        });
        if (!invitation) {
          return res.status(400).send("Invalid invitation");
        }
        try {
          await addMemberToAccount(user, invitation);
          account = invitation!.accountId.toString();
          role = invitation!.role;
        } catch (error: any) {
          if (error.message === "Account not found") {
            return res.status(400).send("Invalid invitation");
          }
        }
      } else {
        try {
          account = await createNewAccountForUser(user);
          role = "admin";
        } catch (error: any) {
          return res.status(500).send("Error creating account");
        }
      }
    }

    const ac = await Account.findById(account ?? user.account);
    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email,
        account,
        role: role ?? req.user.role,
        plan: ac!.subscription.plan,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const returnTo =
      req.session.returnTo || `${process.env.FRONTEND_URL}/data-source`;
    delete req.session.returnTo;

    res.redirect(
      `${
        process.env.FRONTEND_URL
      }/auth/callback?token=${token}&returnTo=${encodeURIComponent(returnTo)}`
    );
  } else {
    res.redirect("/login");
  }
};

export const githubLogin = passport.authenticate("github", {
  scope: ["user:email"],
});

export const githubCallback = (req: Request, res: Response) => {
  if (req.user) {
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
  res.redirect("/login");
};

export const signup = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response
) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).send("Email already registered.");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username: email, email, password: hashedPassword });
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "10h",
  });

  await sendConfirmationEmail(email, token);

  res.status(200).send("Confirmation email sent. Please check your inbox.");
};

export const confirmEmail = async (
  req: Request<{ token: string }>,
  res: Response
) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const { userId } = decoded as { userId: string };

    const user = await User.findById(userId);
    if (!user) return res.status(400).send("Invalid token.");
    if (user.emailConfirmed)
      return res.status(200).send("Email already confirmed.");

    user.emailConfirmed = true;
    await createNewAccountForUser(user);

    res.status(200).send("Email confirmed successfully. You can now log in.");
  } catch (error) {
    res.status(400).send("Invalid or expired token.");
  }
};

export const acceptInvite = async (
  req: Request<{ token: string }, {}, AcceptInviteRequestBody>,
  res: Response
) => {
  const { token } = req.params;
  const { password } = req.body;

  const invitation = await Invitation.findOne({
    token,
    status: "pending",
  });
  if (!invitation) return res.status(400).send("Invalid invitation");

  const email = invitation.email;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ username: email, email, password: hashedPassword });
  try {
    await addMemberToAccount(user, invitation);
    invitation.status = "accepted";
    await invitation.save();
    res.status(200).send("Invitation accepted successfully");
  } catch (error: any) {
    if (error.message === "Account not found") {
      return res.status(400).send("Invalid invitation");
    }
    res.status(500).send("Error adding user to account");
  }
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    async (err: any, user: IUser | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Login failed" });

      // Check if the user is deactivated
      if (!user.isActive) {
        return res.status(403).json({ message: "User account is deactivated" });
      }

      req.logIn(user, async (err) => {
        if (err) return next(err);

        // Find the user's account
        const account = await Account.findById(user.account);
        if (!account) return res.status(500).send("Account not found");

        // Check if the subscription is active
        if (account.subscription.status !== "active") {
          return res.status(403).send("Subscription is inactive");
        }

        // Generate a JWT token
        const token = jwt.sign(
          {
            id: user._id,
            email: user.email,
            account: user.account,
            role: user.role,
            plan: account.subscription.plan,
          },
          process.env.JWT_SECRET!,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Respond with the token
        res.json({ token });
      });
    }
  )(req, res, next);
};

export const logout = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Error logging out");
    return res.status(200).send("Logged out successfully");
  });
};

// Helper functions
export async function createNewAccountForUser(user: IUser) {
  const newAccount = new Account({
    name: `${user.username}'s Account`,
    owner: user._id,
    members: [{ userId: user._id }],
    subscription: { plan: "free", status: "active" },
  });
  await newAccount.save();
  user.account = newAccount._id as string;
  user.role = "admin";
  await user.save();
  return newAccount._id as string;
}

export async function addMemberToAccount(user: IUser, invitation: IInvitation) {
  const account = await Account.findById(invitation.accountId);
  if (!account) throw new Error("Account not found");
  account.members.push({ userId: user._id as Types.ObjectId });
  await account.save();
  invitation.status = "accepted";
  await invitation.save();
  user.account = account._id as string;
  user.role = invitation.role;
  await user.save();
}
