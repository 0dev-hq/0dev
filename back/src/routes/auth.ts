import express from "express";
import passport from "passport";
import User, { IUser } from "../models/User";
import Account from "../models/Account";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendConfirmationEmail } from "../services/emailService";
import { IInvitation, Invitation } from "../models/Invitation";
import { Types } from "mongoose";

const router = express.Router();

// Google login route: Initiates the OAuth flow by redirecting the user to Google's OAuth page
router.get("/google", (req, res, next) => {
  // Safely handle req.query.returnTo to ensure it's a string
  const returnTo = Array.isArray(req.query.returnTo)
    ? req.query.returnTo[0]
    : typeof req.query.returnTo === "string"
    ? req.query.returnTo
    : "/data-sources"; // Fallback to default

  // Store the returnTo URL in the session or cookies
  req.session.returnTo = returnTo as string;

  // Get the invite token from the query string if present and store it in the session
  if (req.query.invitationToken) {
    req.session.invitationToken = req.query.invitationToken as string;
  }

  // Start Google authentication
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: req.session.invitationToken
      ? req.session.invitationToken
      : undefined,
  })(req, res, next);
});

// This controller handles Sign up, Invitation acceptance, and Login flows
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    if (req.user) {
      // Check if the user already has an account
      const user = req.user as IUser;
      let [account, role] = ["", ""]; // account and roll will be set based on the invitation or creating a new account

      // Sign up flow
      if (!user.account) {
        const invitationToken = req.query.state;
        if (invitationToken) {
          // Fetch and validate the invitation using the invitationToken
          const invitation = await Invitation.findOne({
            token: invitationToken,
            status: "pending",
          });
          if (!invitation) {
            res.status(400).send("Invalid invitation");
            return;
          }
          // Add user to the account and assign the role specified in the invitation
          try {
            await addMemberToAccount(user, invitation as IInvitation);
            account = invitation!.accountId.toString();
            role = invitation!.role;
          } catch (error: any) {
            if (error.message === "Account not found") {
              // If the account was not found, create a new account for the user
              res.status(400).send("Invalid invitation");
              return;
            }
          }
        } else {
          try {
            account = await createNewAccountForUser(user);
            role = "admin";
          } catch (error: any) {
            res.status(500).send("Error creating account");
            return;
          }
        }
      }

      const ac = await Account.findById(account ?? user.account);
      console.log(`ac: ${JSON.stringify(ac)}`);
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

      // Use the returnTo value from the session or fallback to /data-sources
      const returnTo =
        req.session.returnTo || `${process.env.FRONTEND_URL}/data-source`;
      delete req.session.returnTo;

      // Redirect to the frontend callback with token and returnTo
      res.redirect(
        `${
          process.env.FRONTEND_URL
        }/auth/callback?token=${token}&returnTo=${encodeURIComponent(returnTo)}`
      );
    } else {
      res.redirect("/login");
    }
  }
);

// GitHub login route: Initiates the OAuth flow by redirecting the user to GitHub's OAuth page
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// GitHub OAuth callback route
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    if (req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard`); // Redirect to the frontend after GitHub login
    }
    res.redirect("/login");
  }
);

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).send("Email already registered.");

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user, with username as email
  const user = new User({ username: email, email, password: hashedPassword });
  await user.save();

  // Generate a confirmation token (JWT)
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET!, // Secret key from env
    { expiresIn: "10h" } // Token expires in 10 hours
  );

  // Send the confirmation email
  await sendConfirmationEmail(email, token);

  res.status(200).send("Confirmation email sent. Please check your inbox.");
});

// Email signup flow
router.get("/confirm-email/:token", async (req, res) => {
  const { token } = req.params;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const { userId } = decoded as { userId: string };

    // Find the user and mark them as confirmed
    const user = await User.findById(userId);
    if (!user) return res.status(400).send("Invalid token.");
    if (user.emailConfirmed)
      return res.status(200).send("Email already confirmed.");

    user.emailConfirmed = true;

    // Create a new account for this user
    await createNewAccountForUser(user);

    res.status(200).send("Email confirmed successfully. You can now log in.");
  } catch (error) {
    res.status(400).send("Invalid or expired token.");
  }
});

// Invitation acceptance route
router.post("/accept-invite/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Fetch and validate the invitation using the invitationToken
  const invitation = await Invitation.findOne({
    token,
    status: "pending",
  });
  if (!invitation) {
    res.status(400).send("Invalid invitation");
    return;
  }

  const email = invitation.email;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ username: email, email, password: hashedPassword });
  try {
    await addMemberToAccount(user, invitation as IInvitation);
    invitation.status = "accepted";
    await invitation.save();
    res.status(200).send("Invitation accepted successfully");
  } catch (error: any) {
    if (error.message === "Account not found") {
      // If the account was not found, create a new account for the user
      res.status(400).send("Invalid invitation");
      return;
    }
    res.status(500).send("Error adding user to account");
  }
});

// Local login with passport local strategy
router.post("/login", (req, res, next) => {
  passport.authenticate(
    "local",
    async (err: any, user: IUser | false, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Login failed" });
      }

      console.log(user);

      // Check if user is logically deleted
      if (!user.isActive) {
        return res.status(403).json({ message: "User account is deactivated" });
      }

      req.logIn(user, async (err) => {
        if (err) {
          return next(err);
        }

        // Find the account, then find the user's role in the account
        const account = await Account.findById(user.account);
        if (!account) {
          return res.status(500).send("Account not found");
        }

        if (account.subscription.status !== "active") {
          return res.status(403).send("Subscription is inactive");
        }

        const member = account.members.find(
          (member) => member.userId.toString() === user._id!.toString()
        );

        // Generate the JWT token
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

        // Return JSON with the token and redirect URL
        res.json({ token });
      });
    }
  )(req, res, next);
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Error logging out");
    return res.status(200).send("Logged out successfully");
  });
});

async function createNewAccountForUser(user: IUser) {
  const newAccount = new Account({
    name: `${user.username}'s Account`,
    owner: user._id,
    members: [{ userId: user._id }],
    subscription: {
      plan: "free",
      status: "active",
    },
  });
  await newAccount.save();

  // Link account to user
  user.account = newAccount._id as string;
  user.role = "admin";
  await user.save();
  return newAccount._id as string;
}

async function addMemberToAccount(user: IUser, invitation: IInvitation) {
  const account = await Account.findById(invitation.accountId);
  if (!account) {
    throw new Error("Account not found");
  }
  account.members.push({
    userId: user._id as Types.ObjectId,
  });
  await account.save();

  // Mark the invitation as accepted
  invitation.status = "accepted";
  await invitation.save();

  // Link account to user›
  user.account = account._id as string;
  user.role = invitation.role;
  await user.save();
}

export default router;
