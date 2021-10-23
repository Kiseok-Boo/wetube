import multer from "multer";

// eslint-disable-next-line import/prefer-default-export
export const localMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {};
  next();
};

// eslint-disable-next-line consistent-return
export const protectMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "Not Authorized");
    return res.redirect("/login");
  }
};

// eslint-disable-next-line consistent-return
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "Not Authorized");
    return res.redirect("/");
  }
};

export const avatarUploadMiddleware = multer({
  dest: "uploads/avatars",
  limits: { fileSize: 3000000 },
});

export const videoUploadMiddleware = multer({
  dest: "uploads/videos",
  limits: { fileSize: 100000000 },
});
