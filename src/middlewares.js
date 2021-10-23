import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const multerUploader = multerS3({
  s3,
  bucket: "boohotube",
  acl: "public-read",
});

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
  storage: multerUploader,
});

export const videoUploadMiddleware = multer({
  dest: "uploads/videos",
  limits: { fileSize: 100000000 },
  storage: multerUploader,
});
