/* ===========================
   NetGRO — LinkedIn-lite Demo (ER-aware) + Theme switch
   =========================== */

// ---------- Helpers ----------
const qs  = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
const $id = (id) => document.getElementById(id);

const storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

const nowIso = () => new Date().toISOString();

function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[c]));
}

function dataUrlFromFile(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

async function hashPassword(plain) {
  const enc = new TextEncoder().encode(plain);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const pairs = [
    [31557600, "y"], [2629800, "mo"], [604800, "w"], [86400, "d"], [3600, "h"], [60, "m"]
  ];
  for (const [sec, label] of pairs) if (diff >= sec) return Math.floor(diff / sec) + label;
  return "now";
}

const toastEl = $id("toast");
let toastTimer = null;
const toast = (msg) => {
  toastEl.textContent = msg;
  toastEl.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.add("hidden"), 2000);
};

// ---------- Theme ----------
const theme = {
  init() {
    // Use saved theme, else default to 'light'
    const saved = storage.get("ng_theme", "light");
    document.documentElement.setAttribute("data-theme", saved);
    this.updateToggle(saved);
  },
  toggle() {
    const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", cur);
    storage.set("ng_theme", cur);
    this.updateToggle(cur);
  },
  updateToggle(mode) {
    const btn = $id("theme-toggle");
    if (!btn) return;
    btn.setAttribute("aria-pressed", mode === "dark");
    btn.textContent = mode === "dark" ? "🌙 Dark" : "🌞 Light";
  }
};

// ---------- State ----------
let users = storage.get("ng_users", []);
let posts = storage.get("ng_posts", []);
let currentUserId = storage.get("ng_currentUserId", null);

// ---------- Router ----------
const router = {
  navigate(path) { location.hash = "#" + (path || ""); },
  handle() {
    const hash = location.hash.replace(/^#/, "");
    const [head, sub] = hash.split("/").filter(Boolean);
    qsa(".page").forEach(p => p.classList.add("hidden"));

    const loggedIn = auth.isAuthed();
    showHeaderForAuth(loggedIn);

    if (!head || head === "landing") {
      $id("landing-page").classList.remove("hidden");
      return;
    }
    if (head === "auth") {
      $id("auth-page").classList.remove("hidden");
      toggleAuthMode(sub === "register" ? "register" : "login");
      return;
    }
    if (!loggedIn) {
      toast("Please sign in first."); return router.navigate("auth/login");
    }
    if (head === "feed") {
      $id("feed-page").classList.remove("hidden");
      feed.renderComposer(); feed.render(); return;
    }
    if (head === "me") {
      $id("me-page").classList.remove("hidden");
      me.render(); return;
    }
    $id("landing-page").classList.remove("hidden");
  }
};
window.addEventListener("hashchange", () => router.handle());

// ---------- Header ----------
function showHeaderForAuth(isLoggedIn) {
  $id("auth-cta").classList.toggle("hidden", !!isLoggedIn);
  $id("app-nav").classList.toggle("hidden", !isLoggedIn);
  if (isLoggedIn) {
    const meU = auth.me();
    if (meU) {
      $id("chip-name").textContent = meU.name || meU.email;
      $id("chip-avatar").src = meU.avatar || placeholderAvatar(meU.name);
    }
  }
}

const ui = {
  toggleProfileMenu(forceClose = false) {
    const m = $id("profile-menu");
    if (forceClose) m.classList.add("hidden");
    else m.classList.toggle("hidden");
    const close = (e) => {
      if (!m.contains(e.target) && !e.target.closest(".user-chip")) {
        m.classList.add("hidden"); document.removeEventListener("click", close);
      }
    };
    document.addEventListener("click", close, { once: true });
  }
};

// ---------- Auth ----------
const auth = {
  isAuthed: () => !!currentUserId && !!users.find(u => u.id === currentUserId),
  me() { return users.find(u => u.id === currentUserId) || null; },

  async register({ name, email, password, headline, avatarDataUrl }) {
    email = email.trim().toLowerCase();
    if (users.some(u => u.email === email)) throw new Error("Email already registered.");
    const passHash = await hashPassword(password);
    const id = "u_" + crypto.randomUUID();
    const user = {
      id, name: name.trim(), email,
      passHash, headline: headline?.trim() || "",
      bio: "",
      skills: [],
      education: [],  // {school, degree, years}
      experience: [], // {title, company, years}
      avatar: avatarDataUrl || placeholderAvatar(name),
      createdAt: nowIso()
    };
    users.push(user); storage.set("ng_users", users);
    currentUserId = id; storage.set("ng_currentUserId", currentUserId);
    return user;
  },

  async login({ email, password }) {
    email = email.trim().toLowerCase();
    const user = users.find(u => u.email === email);
    if (!user) throw new Error("No account found for this email.");
    const passHash = await hashPassword(password);
    if (user.passHash !== passHash) throw new Error("Incorrect password.");
    currentUserId = user.id; storage.set("ng_currentUserId", currentUserId);
    return user;
  },

  logout() {
    currentUserId = null; storage.set("ng_currentUserId", currentUserId);
    showHeaderForAuth(false);
    router.navigate("landing");
    toast("Signed out");
  }
};

// ---------- Placeholder avatar ----------
function placeholderAvatar(name = "") {
  const initials = (name || "?").split(/\s+/).slice(0,2).map(w => w[0]?.toUpperCase() || "?").join("");
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
    <rect width="100%" height="100%" rx="16" ry="16" fill="#0f7a83"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
      font-family="Inter, Arial, sans-serif" font-size="56" fill="#ffffff">${initials}</text>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}

// ---------- Feed (Posts + Likes + Comments) ----------
const feed = {
  composerImages: [],

  resetComposer() {
    $id("composer-input").value = "";
    $id("btn-post").disabled = true;
    this.composerImages = [];
    $id("composer-previews").innerHTML = "";
  },

  renderComposer() {
    const meU = auth.me();
    $id("composer-avatar").src = meU?.avatar || placeholderAvatar(meU?.name);
  },

  async handleImagePicked(file) {
    if (!file) return;
    const dataUrl = await dataUrlFromFile(file);
    this.composerImages.push(dataUrl);
    const wrap = document.createElement("div");
    wrap.className = "preview";
    wrap.innerHTML = `<img alt="attachment" src="${dataUrl}"><button class="btn btn--ghost sm" aria-label="Remove image">✕</button>`;
    $id("composer-previews").appendChild(wrap);
    const idx = this.composerImages.length - 1;
    wrap.querySelector("button").addEventListener("click", () => {
      this.composerImages.splice(idx, 1);
      wrap.remove();
      $id("btn-post").disabled = !$id("composer-input").value.trim() && this.composerImages.length === 0;
    });
  },

  createPost({ content, images }) {
    const meU = auth.me();
    const post = {
      id: "p_" + crypto.randomUUID(),
      userId: meU.id,
      content: content.trim(),
      images: images.slice(0, 6),
      createdAt: nowIso(),
      likes: [],
      comments: []
    };
    posts.unshift(post);
    storage.set("ng_posts", posts);
    this.resetComposer();
    this.render();
  },

  toggleLike(postId) {
    const meId = currentUserId;
    const p = posts.find(x => x.id === postId);
    if (!p) return;
    const idx = p.likes.indexOf(meId);
    if (idx === -1) p.likes.push(meId); else p.likes.splice(idx, 1);
    storage.set("ng_posts", posts);
    this.render();
  },

  addComment(postId, content) {
    const p = posts.find(x => x.id === postId);
    if (!p) return;
    p.comments.push({
      id: "c_" + crypto.randomUUID(),
      userId: currentUserId,
      content: content.trim(),
      createdAt: nowIso()
    });
    storage.set("ng_posts", posts);
    this.render();
  },

  deletePost(id) {
    posts = posts.filter(p => p.id !== id);
    storage.set("ng_posts", posts);
    this.render();
  },

  render() {
    const list = $id("feed-list");
    list.innerHTML = "";

    if (!posts.length) {
      const empty = document.createElement("div");
      empty.className = "card";
      empty.innerHTML = `<h3>No posts yet</h3><p class="muted">Be the first to share something.</p>`;
      list.appendChild(empty);
      return;
    }

    for (const p of posts) {
      const author = users.find(u => u.id === p.userId) || { name: "Deleted", avatar: "", headline: "" };
      const canDelete = currentUserId === p.userId;
      const liked = p.likes.includes(currentUserId);

      const el = document.createElement("article");
      el.className = "post";
      el.innerHTML = `
        <div class="post-head">
          <img class="avatar sm" alt="avatar" src="${author.avatar || placeholderAvatar(author.name)}">
          <div>
            <div><strong>${escapeHtml(author.name)}</strong></div>
            <div class="post-meta">${timeAgo(p.createdAt)} • ${escapeHtml(author.headline || "")}</div>
          </div>
          ${canDelete ? `<button class="btn btn--ghost" aria-label="Delete post">Delete</button>` : ""}
        </div>
        <div class="post-body">
          ${p.content ? `<p>${escapeHtml(p.content)}</p>` : ""}
          ${p.images?.length ? `
            <div class="previews" style="margin-top:10px">
              ${p.images.map(src => `<div class="preview"><img alt="post image" src="${src}"></div>`).join("")}
            </div>` : ""}
        </div>
        <div class="counts">${p.likes.length} likes • ${p.comments.length} comments</div>
        <div class="post-actions">
          <button class="btn btn--ghost btn-like">${liked ? "Unlike" : "Like"}</button>
          <button class="btn btn--ghost btn-toggle-comments">Comment</button>
          <button class="btn btn--ghost" disabled>Share</button>
        </div>
        <div class="post-comments hidden">
          <div class="card" style="border:none; box-shadow:none; padding:8px 14px;">
            <div id="comments-${p.id}">
              ${p.comments.map(c => {
                const u = users.find(x => x.id === c.userId) || {name:"Unknown", avatar:""};
                return `
                <div style="display:grid; grid-template-columns:auto 1fr; gap:8px; margin:8px 0;">
                  <img class="avatar xs" src="${u.avatar || placeholderAvatar(u.name)}" alt="">
                  <div>
                    <div><strong>${escapeHtml(u.name)}</strong> <span class="muted">• ${timeAgo(c.createdAt)}</span></div>
                    <div>${escapeHtml(c.content)}</div>
                  </div>
                </div>`;
              }).join("")}
            </div>
            <div style="display:grid; grid-template-columns:auto 1fr auto; gap:8px; align-items:center; margin-top:8px;">
              <img class="avatar xs" src="${auth.me()?.avatar || ""}" alt="">
              <input type="text" class="comment-input" placeholder="Add a comment..." />
              <button class="btn btn--primary btn-add-comment">Post</button>
            </div>
          </div>
        </div>
      `;

      el.querySelector(".btn-like").addEventListener("click", () => this.toggleLike(p.id));
      el.querySelector(".btn-toggle-comments").addEventListener("click", () => {
        el.querySelector(".post-comments").classList.toggle("hidden");
      });
      el.querySelector(".btn-add-comment").addEventListener("click", () => {
        const inp = el.querySelector(".comment-input");
        const val = inp.value.trim(); if (!val) return;
        this.addComment(p.id, val);
      });
      if (canDelete) {
        el.querySelector(".post-head .btn")?.addEventListener("click", () => {
          this.deletePost(p.id); toast("Post deleted");
        });
      }

      list.appendChild(el);
    }
  }
};

// ---------- Profile (Me) ----------
const me = {
  render() {
    const u = auth.me(); if (!u) return;

    $id("me-avatar").src = u.avatar || placeholderAvatar(u.name);
    $id("me-name").textContent = u.name;
    $id("me-headline").textContent = u.headline || "Add a headline";

    $id("me-name-input").value = u.name;
    $id("me-headline-input").value = u.headline || "";
    $id("me-bio-input").value = u.bio || "";
    $id("me-skills-input").value = (u.skills || []).join(", ");

    const eduList = $id("edu-list"); eduList.innerHTML = "";
    (u.education || []).forEach((e, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `${escapeHtml(e.school)} — ${escapeHtml(e.degree)} (${escapeHtml(e.years)}) <button class="btn btn--ghost sm" aria-label="Remove">✕</button>`;
      li.querySelector("button").addEventListener("click", () => { this.removeEducation(idx); });
      eduList.appendChild(li);
    });

    const expList = $id("exp-list"); expList.innerHTML = "";
    (u.experience || []).forEach((e, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `${escapeHtml(e.title)} @ ${escapeHtml(e.company)} (${escapeHtml(e.years)}) <button class="btn btn--ghost sm" aria-label="Remove">✕</button>`;
      li.querySelector("button").addEventListener("click", () => { this.removeExperience(idx); });
      expList.appendChild(li);
    });
  },

  async save({ name, headline, bio, skillsString, avatarFile }) {
    const u = auth.me(); if (!u) return;
    u.name = name.trim();
    u.headline = headline.trim();
    u.bio = bio.trim();
    u.skills = skillsString.split(",").map(s => s.trim()).filter(Boolean);
    if (avatarFile) u.avatar = await dataUrlFromFile(avatarFile);

    users = users.map(x => x.id === u.id ? u : x);
    storage.set("ng_users", users);
    $id("chip-name").textContent = u.name || u.email;
    $id("chip-avatar").src = u.avatar || placeholderAvatar(u.name);
    toast("Profile saved");
    this.render();
  },

  addEducation({ school, degree, years }) {
    const u = auth.me(); if (!u) return;
    if (!u.education) u.education = [];
    if (!school && !degree && !years) return;
    u.education.push({ school: school.trim(), degree: degree.trim(), years: years.trim() });
    storage.set("ng_users", users);
    this.render();
  },

  removeEducation(idx) {
    const u = auth.me(); if (!u) return;
    u.education.splice(idx, 1);
    storage.set("ng_users", users);
    this.render();
  },

  addExperience({ title, company, years }) {
    const u = auth.me(); if (!u) return;
    if (!u.experience) u.experience = [];
    if (!title && !company && !years) return;
    u.experience.push({ title: title.trim(), company: company.trim(), years: years.trim() });
    storage.set("ng_users", users);
    this.render();
  },

  removeExperience(idx) {
    const u = auth.me(); if (!u) return;
    u.experience.splice(idx, 1);
    storage.set("ng_users", users);
    this.render();
  }
};

// ---------- Auth UI wiring ----------
function toggleAuthMode(mode) {
  $id("login-form").classList.toggle("hidden", mode === "register");
  $id("register-form").classList.toggle("hidden", mode !== "register");
}

$id("login-form").addEventListener("submit", async (e) => {
  e.preventDefault(); $id("btn-login").disabled = true;
  try {
    const email = $id("login-email").value;
    const password = $id("login-password").value;
    await auth.login({ email, password });
    toast("Welcome back!"); router.navigate("feed");
  } catch (err) { toast(err.message || "Login failed"); }
  finally { $id("btn-login").disabled = false; }
});

$id("register-form").addEventListener("submit", async (e) => {
  e.preventDefault(); $id("btn-register").disabled = true;
  try {
    const name = $id("reg-name").value;
    const email = $id("reg-email").value;
    const password = $id("reg-password").value;
    const headline = $id("reg-headline").value;
    const file = $id("reg-avatar").files?.[0];
    const avatarDataUrl = file ? await dataUrlFromFile(file) : null;

    await auth.register({ name, email, password, headline, avatarDataUrl });
    toast("Account created!"); router.navigate("feed");
  } catch (err) { toast(err.message || "Registration failed"); }
  finally { $id("btn-register").disabled = false; }
});

// ---------- Composer wiring ----------
$id("composer-input").addEventListener("input", (e) => {
  const hasText = !!e.target.value.trim();
  $id("btn-post").disabled = !hasText && feed.composerImages.length === 0;
});
$id("composer-image").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  await feed.handleImagePicked(file);
  $id("btn-post").disabled = false;
  e.target.value = "";
});
$id("btn-post").addEventListener("click", () => {
  const content = $id("composer-input").value;
  if (!content.trim() && feed.composerImages.length === 0) return;
  feed.createPost({ content, images: feed.composerImages });
  toast("Posted!");
});

// ---------- Profile wiring ----------
$id("btn-save-profile").addEventListener("click", async (e) => {
  e.preventDefault();
  const name = $id("me-name-input").value;
  const headline = $id("me-headline-input").value;
  const bio = $id("me-bio-input").value;
  const file = $id("me-avatar-input").files?.[0] || null;
  const skillsString = $id("me-skills-input").value;
  await me.save({ name, headline, bio, skillsString, avatarFile: file });
});

$id("btn-add-edu").addEventListener("click", (e) => {
  e.preventDefault();
  me.addEducation({
    school: $id("edu-school").value,
    degree: $id("edu-degree").value,
    years: $id("edu-years").value
  });
  $id("edu-school").value = $id("edu-degree").value = $id("edu-years").value = "";
});
$id("btn-add-exp").addEventListener("click", (e) => {
  e.preventDefault();
  me.addExperience({
    title: $id("exp-title").value,
    company: $id("exp-company").value,
    years: $id("exp-years").value
  });
  $id("exp-title").value = $id("exp-company").value = $id("exp-years").value = "";
});

// ---------- Initial boot ----------
(function boot() {
  theme.init(); // set theme before first paint

  // Seed demo user if nothing exists
  if (users.length === 0) {
    (async () => {
      const passHash = await hashPassword("demo123");
      const demo = {
        id: "u_demo",
        name: "Demo User",
        email: "demo@netgro.local",
        passHash,
        headline: "Aspiring Developer",
        bio: "This is a demo account.",
        avatar: placeholderAvatar("Demo User"),
        skills: ["JavaScript", "HTML", "CSS"],
        education: [{school:"Example University", degree:"B.Tech CSE", years:"2023–2027"}],
        experience: [{title:"Intern", company:"Acme", years:"2024"}],
        createdAt: nowIso()
      };
      users.push(demo); storage.set("ng_users", users);
    })();
  }

  showHeaderForAuth(!!currentUserId);

  if (!location.hash) router.navigate("landing"); else router.handle();
  setTimeout(() => router.handle(), 0);
})();
