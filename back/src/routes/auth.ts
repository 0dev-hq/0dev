import express from "express";
import passport from "passport";
import {
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback,
  signup,
  confirmEmail,
  acceptInvite,
  login,
  logout,
} from "../controllers/auth-controller";

const router = express.Router();

router.get("/google", googleLogin);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleCallback
);

router.get("/github", githubLogin);
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  githubCallback
);

router.post("/signup", signup);
router.get("/confirm-email/:token", confirmEmail);

router.post("/accept-invite/:token", acceptInvite);

router.post("/login", login);
router.get("/logout", logout);

export default {
  path: "/auth",
  router,
};
