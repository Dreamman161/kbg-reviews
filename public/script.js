const API = "/api/comments";
let comments = [];

// Laden
async function loadComments() {
    const res = await fetch(API);
    comments = await res.json();
    renderComments();
}

function renderComments() {
    const sort = document.getElementById("sortSelect").value;

    let sorted = [...comments];

    if (sort === "rating") {
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    const container = document.getElementById("comments");
    container.innerHTML = "";

    const tree = buildTree(sorted);

    tree.forEach(c => container.appendChild(renderComment(c)));
}

function buildTree(comments) {
    const map = {};
    comments.forEach(c => map[c.id] = { ...c, replies: [] });

    const roots = [];

    comments.forEach(c => {
        if (c.parent_id) map[c.parent_id].replies.push(map[c.id]);
        else roots.push(map[c.id]);
    });

    return roots;
}

function renderComment(c) {
    const div = document.createElement("div");
    div.className = "comment";

    div.innerHTML = `
        <div><strong>${"⭐".repeat(c.rating || 0)}</strong></div>
        <p>${c.text}</p>
        <span class="reply-btn" onclick="showReplyBox(${c.id})">Antworten</span>
    `;

    c.replies.forEach(r => {
        const replyDiv = renderComment(r);
        replyDiv.classList.add("reply-box");
        div.appendChild(replyDiv);
    });

    return div;
}

function showReplyBox(id) {
    const text = prompt("Deine Antwort:");
    if (text) {
        postComment(text, null, id);
    }
}

async function postComment(text, rating, parent_id) {
    await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, rating, parent_id })
    });
    loadComments();
}

document.getElementById("postBtn").onclick = () => {
    const text = document.getElementById("commentText").value;
    const rating = parseInt(document.getElementById("ratingSelect").value);

    if (!text.trim()) return alert("Text fehlt.");

    postComment(text, rating, null);
};

document.getElementById("sortSelect").onchange = renderComments;

loadComments();
