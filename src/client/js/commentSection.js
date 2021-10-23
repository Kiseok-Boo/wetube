const videoContainer = document.getElementById("videoContainer");
const commentForm = document.getElementById("commentForm");
const input = document.getElementById("commentInput");
const inputBtn = document.getElementById("commentBtn");
const cancelBtn = document.getElementById("commentCancelBtn");
const commentLists = document.getElementById("commentLists");
const deleteBtn = commentLists.querySelectorAll(".deleteCommentBtn");

const addComment = (text, ID) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  const icon = document.createElement("i");
  const span = document.createElement("span");
  const span2 = document.createElement("span");
  newComment.dataset.id = ID;
  newComment.className = "video__comment";
  icon.className = "fas fa-comment";
  span.innerText = ` ${text}`;
  span2.innerText = "❌";
  span2.className = "deleteCommentBtn";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);
};

const handelClickDeleteBtn = async (event) => {
  const { id } = videoContainer.dataset;
  if (event.target.className !== "deleteCommentBtn") {
    return;
  }
  const { id: commentID } = event.target.parentNode.dataset;
  const response = await fetch(`/api/videos/${id}/comment/${commentID}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ commentID }),
  });
  if (response.status === 200) {
    commentLists.removeChild(event.target.parentNode);
  }
};

if (deleteBtn) {
  deleteBtn.forEach((array) => {
    array.addEventListener("click", handelClickDeleteBtn);
  });
}
const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = commentForm.querySelector("textarea");
  const { id } = videoContainer.dataset;
  const text = textarea.value;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${id}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = "";
    const { newCommentID } = await response.json();
    addComment(text, newCommentID);
  }
};
if (commentForm) {
  commentForm.addEventListener("submit", handleSubmit);
}

const handleClickCommentBtn = () => {
  inputBtn.style.background = "#065fd4";
  inputBtn.style.color = "white";
};
const handleClickOutCommentBtn = () => {
  inputBtn.style.background = "rgba(0, 0, 0, 0.2)";
  inputBtn.style.color = "rgba(0, 0, 0, 0.2)";
};
const handleClickcancelBtn = () => {
  inputBtn.style.background = "rgba(0, 0, 0, 0.2)";
  inputBtn.style.color = "";
  input.innerText = "";
};

input.addEventListener("focus", handleClickCommentBtn);
input.addEventListener("blur", handleClickOutCommentBtn);
cancelBtn.addEventListener("click", handleClickcancelBtn);
