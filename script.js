// Theme toggle
const themeBtn = document.getElementById("themeBtn");
const root = document.documentElement;

function setTheme(t){
  if(t === "light"){
    root.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  } else {
    root.removeAttribute("data-theme");
    localStorage.setItem("theme", "dark");
  }
}
setTheme(localStorage.getItem("theme") || "dark");

themeBtn?.addEventListener("click", () => {
  const isLight = root.getAttribute("data-theme") === "light";
  setTheme(isLight ? "dark" : "light");
});

// Scroll progress
const progress = document.getElementById("scrollProgress");
window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  progress.style.width = `${Math.max(0, Math.min(100, scrolled))}%`;
});

// Typing rotator
const typeTarget = document.getElementById("typeTarget");
const phrases = [
  "API monetization strategy",
  "platform reliability & observability",
  "partner onboarding & integrations",
  "roadmaps that ship",
  "systems that scale calmly"
];

let p = 0, i = 0, deleting = false;

function tick(){
  const current = phrases[p];
  if(!deleting){
    i++;
    typeTarget.textContent = current.slice(0, i);
    if(i === current.length){
      deleting = true;
      setTimeout(tick, 900);
      return;
    }
  } else {
    i--;
    typeTarget.textContent = current.slice(0, i);
    if(i === 0){
      deleting = false;
      p = (p + 1) % phrases.length;
    }
  }
  setTimeout(tick, deleting ? 30 : 42);
}
if(typeTarget) tick();

// Timeline expand/collapse
document.querySelectorAll(".titem").forEach((btn) => {
  const initial = btn.dataset.open === "true";
  btn.setAttribute("aria-expanded", initial ? "true" : "false");

  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", expanded ? "false" : "true");
  });
});

// Counters (when visible)
const counters = document.querySelectorAll(".statNum");
const fmt = (n) => {
  if(n >= 1_000_000_000) return (n/1_000_000_000).toFixed(0) + "B";
  if(n >= 1_000_000) return (n/1_000_000).toFixed(0) + "M";
  if(n >= 10_000) return (n/1_000).toFixed(0) + "K";
  return n.toString();
};

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(!e.isIntersecting) return;
    const el = e.target;
    const target = Number(el.dataset.count || "0");
    const suffix = el.dataset.suffix || "";
    const start = performance.now();
    const dur = 900;

    function step(t){
      const k = Math.min(1, (t - start) / dur);
      const val = Math.floor(target * (0.15 + 0.85*k));
      el.textContent = fmt(val) + suffix;
      if(k < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target) + suffix;
    }
    requestAnimationFrame(step);
    io.unobserve(el);
  });
}, { threshold: 0.35 });

counters.forEach(c => io.observe(c));

// Skill filters
const filters = document.getElementById("filters");
const skillCards = Array.from(document.querySelectorAll(".skillCard"));

filters?.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if(!btn) return;
  filters.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");

  const f = btn.dataset.filter;
  skillCards.forEach(card => {
    const cat = card.dataset.cat;
    const show = (f === "all" || f === cat);
    card.style.display = show ? "block" : "none";
  });
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Photography Lightbox
const lightbox = document.getElementById("lightbox");
const lightboxOverlay = document.querySelector(".lightboxOverlay");
const lightboxClose = document.querySelector(".lightboxClose");
const photos = Array.from(document.querySelectorAll(".photo[data-photo]"));
let currentPhotoIndex = 0;

function openLightbox(index) {
  currentPhotoIndex = index;
  const photo = photos[index];
  
  // Update lightbox content
  document.getElementById("lightboxTitle").textContent = photo.dataset.title;
  document.getElementById("lightboxLocation").textContent = `📍 ${photo.dataset.location}`;
  document.getElementById("exifCamera").textContent = photo.dataset.camera;
  document.getElementById("exifLens").textContent = photo.dataset.lens;
  document.getElementById("exifSettings").textContent = photo.dataset.settings;
  document.getElementById("lightboxCounter").textContent = `${index + 1} of ${photos.length}`;
  
  // Update map link
  const mapLink = document.getElementById("lightboxMap");
  mapLink.href = `https://www.google.com/maps?q=${photo.dataset.lat},${photo.dataset.lng}`;
  
  // Show lightbox
  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function navigateLightbox(direction) {
  currentPhotoIndex += direction;
  if (currentPhotoIndex < 0) currentPhotoIndex = photos.length - 1;
  if (currentPhotoIndex >= photos.length) currentPhotoIndex = 0;
  openLightbox(currentPhotoIndex);
}

// Event listeners
photos.forEach((photo, index) => {
  photo.addEventListener("click", () => openLightbox(index));
});

lightboxClose?.addEventListener("click", closeLightbox);
lightboxOverlay?.addEventListener("click", closeLightbox);
document.getElementById("lightboxPrev")?.addEventListener("click", () => navigateLightbox(-1));
document.getElementById("lightboxNext")?.addEventListener("click", () => navigateLightbox(1));

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("active")) return;
  
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") navigateLightbox(-1);
  if (e.key === "ArrowRight") navigateLightbox(1);
});

// Prevent body scroll when lightbox is open
lightbox?.addEventListener("wheel", (e) => {
  if (e.target.closest(".lightboxInfo")) return;
  e.preventDefault();
}, { passive: false });
