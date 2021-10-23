/* eslint-disable no-underscore-dangle */
import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
};
export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos, keyword });
};
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  return res.render("watch", { pageTitle: video.title, video });
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== _id) {
    req.flash("error", "Not Authorized");
    return res.status(403).redirect("/");
  }
  return res.render("edit", {
    pageTitle: `Edit Video : ${video.title}`,
    video,
  });
};
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashtags } = req.body;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== _id) {
    req.flash("error", "Not Authorized");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};
export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== _id) {
    req.flash("error", "Not Authorized");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};
export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: `Upload Video` });
};
export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumbnail } = req.files;
  const { title, description, hashtags } = req.body;
  const isHeroku = process.env.NODE_ENV === "production";
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileURL: isHeroku ? video[0].location : video[0].path,
      thumbnailURL: isHeroku ? thumbnail[0].location : thumbnail[0].path,
      owner: _id,
      createdAt: Date.now(),
      hashtags: Video.formatHashtags(hashtags),
    });

    const user = await User.findById(_id);
    // eslint-disable-next-line no-underscore-dangle
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: `Upload Video`,
      // eslint-disable-next-line no-underscore-dangle
      errorMessage: error._message,
    });
  }
};

export const updateView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views += 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({ newCommentID: comment._id });
};

export const deleteComment = async (req, res) => {
  const {
    session: { user },
    body: { commentID },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.findById(commentID);
  video.comments.splice(video.comments.indexOf(comment._id), 1);
  await video.save();
  await Comment.findByIdAndDelete(commentID);
  return res.sendStatus(200);
};
