import express from "express";
import passport from "passport";
import User, { IUser } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendConfirmationEmail } from "../services/emailService";

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

  // Start Google authentication
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
});

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    if (req.user) {
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      // Use the returnTo value from the session or fallback to /data-sources
      const returnTo =
        req.session.returnTo || `${process.env.FRONTEND_URL}/data-sources`;
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
    { expiresIn: "1h" } // Token expires in 1 hour
  );

  // Send the confirmation email
  await sendConfirmationEmail(email, token);
  console.log(`sent conf email`);

  res.status(200).send("Confirmation email sent. Please check your inbox.");
});

router.get("/confirm-email/:token", async (req, res) => {
  const { token } = req.params;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const { userId } = decoded as { userId: string };

    // Find the user and mark them as confirmed
    const user = await User.findById(userId);
    if (!user) return res.status(400).send("Invalid token.");

    user.emailConfirmed = true;
    await user.save();

    res.status(200).send("Email confirmed successfully. You can now log in.");
  } catch (error) {
    console.error("Email confirmation error:", error);
    res.status(400).send("Invalid or expired token.");
  }
});

// Local login with passport local strategy
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err: any, user: IUser | false, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "Login failed" });
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // Generate the JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      console.log(`token: ${token}`);

      // Return JSON with the token and redirect URL
      res.json({ token });
    });
  })(req, res, next);
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Error logging out");
    res.redirect("/");
  });
});

export default router;
