/* eslint-disable camelcase */
import bcrypt from "bcrypt";
import fetch from "node-fetch";
import User from "../models/User";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
// eslint-disable-next-line consistent-return
export const postJoin = async (req, res) => {
  const { email, username, password, password_confirm, location } = req.body;
  const exists = await User.exists({ $or: [{ email }, { username }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "This email/username is already taken.",
    });
  }
  if (password !== password_confirm) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "Password confirmation does not match.",
    });
  }
  try {
    await User.create({
      email,
      username,
      password,
      password_confirm,
      location,
    });
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      // eslint-disable-next-line no-underscore-dangle
      errorMessage: error._messages,
    });
  }
  res.redirect("/login");
};
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });
export const postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, githubLogin: false });
  if (!user) {
    req.flash("error", "An account with this email does not exists");
    return res.status(400).render("login", {
      pageTitle: "Login",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    req.flash("error", "Wrong Password");
    return res.status(400).render("login", {
      pageTitle: "Login",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarURL },
    },
    body: { email, username, location },
    file,
  } = req;
  const findEmail = await User.findOne({ email });
  const findUsername = await User.findOne({ username });
  // eslint-disable-next-line no-underscore-dangle
  if (findEmail !== null && findEmail._id.toString() !== _id) {
    return res.status(400).render("edit-profile", {
      pageTitle: "Profile",
      errorMessage: "This email is already taken.",
    });
  }
  // eslint-disable-next-line no-underscore-dangle
  if (findUsername !== null && findUsername._id.toString() !== _id) {
    return res.status(400).render("edit-profile", {
      pageTitle: "Profile",
      errorMessage: "This username is already taken.",
    });
  }
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarURL: file ? file.path : avatarURL,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect("/users/edit");
};
export const logout = (req, res) => {
  req.flash("info", "Log out");
  req.session.destroy();
  return res.redirect("/");
};
export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
    },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User Not Found" });
  }
  return res.render("users/profile", {
    pageTitle: `${user.username}'s Profile`,
    user,
  });
};
export const startGithubLogin = (req, res) => {
  const baseURL = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GITHUB_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalURL = `${baseURL}?${params}`;
  return res.redirect(finalURL);
};
export const finishGithubLogin = async (req, res) => {
  const baseURL = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GITHUB_CLIENT,
    client_secret: process.env.GITHUB_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalURL = `${baseURL}?${params}`;
  const tokenRequest = await (
    await fetch(finalURL, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiURL = "https://api.github.com";
    const userData = await (
      await fetch(`${apiURL}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiURL}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarURL: userData.avatar_url,
        username: userData.login,
        email: emailObj.email,
        password: "",
        githubLogin: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
    // eslint-disable-next-line no-else-return
  } else {
    // eslint-disable-next-line no-console
    console.log("No access token");
    return res.redirect("/login");
  }
};

export const getChangePassword = (req, res) => {
  if (req.session.user.githubLogin) {
    req.flash("error", "Can't change Github's Password");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPW, newPW, newPW_confirm },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPW, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "Current password is incorrect.",
    });
  }
  if (newPW !== newPW_confirm) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "Password confirmation does not match.",
    });
  }
  user.password = newPW;
  await user.save();
  req.flash("info", "Password Updated!");
  return res.redirect("/users/logout");
};
