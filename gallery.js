
import { supabase } from "./supabase.js";

// HTML elements
const albumsContainer = document.getElementById("sports-albums");

let albums = new Map();
let lightboxPhotos = [];
let lightboxIndex = 0;



// Format dates
function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

// ================= PHOTO LIGHTBOX =================

function createLightbox() {

    if (document.getElementById("photo-lightbox")) return;

    const lightbox = document.createElement("div");
    lightbox.id = "photo-lightbox";
    lightbox.className = "photo-lightbox";

    lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close">
        &times;
    </button>

    <button class="lightbox-prev" aria-label="Previous photo">
        &#10094;
    </button>

    <div class="lightbox-content">
        <img class="lightbox-image" src="" alt="">

        <p class="lightbox-caption"></p>

        <p class="lightbox-counter"></p>
    </div>

    <button class="lightbox-next" aria-label="Next photo">
        &#10095;
    </button>
`;

    document.body.appendChild(lightbox);

    lightbox.addEventListener("click", event => {
        if (
            event.target === lightbox ||
            event.target.classList.contains("lightbox-close")
        ) {
            lightbox.classList.remove("active");
        }
    });

    // Previous photograph
lightbox.querySelector(".lightbox-prev").addEventListener("click", event => {
    event.stopPropagation();

    lightboxIndex =
        (lightboxIndex - 1 + lightboxPhotos.length) %
        lightboxPhotos.length;

    updateLightboxPhoto();
});

// Next photograph
lightbox.querySelector(".lightbox-next").addEventListener("click", event => {
    event.stopPropagation();

    lightboxIndex =
        (lightboxIndex + 1) % lightboxPhotos.length;

    updateLightboxPhoto();
});

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            lightbox.classList.remove("active");
        }
    });
}


// Display selected lightbox photo
function updateLightboxPhoto() {

    const photo = lightboxPhotos[lightboxIndex];

    if (!photo) return;

    const lightbox = document.getElementById("photo-lightbox");

    const image = lightbox.querySelector(".lightbox-image");
    const caption = lightbox.querySelector(".lightbox-caption");
    const counter = lightbox.querySelector(".lightbox-counter");

    image.src = photo.signedUrl;
    image.alt = photo.alt_text || photo.caption || "Sports photograph";

    caption.textContent = photo.caption || "";

    counter.textContent =
        `${lightboxIndex + 1} / ${lightboxPhotos.length}`;
}

// Open photo viewer
function openLightbox(photos, index) {

    lightboxPhotos = photos;
    lightboxIndex = index;

    updateLightboxPhoto();

    document.getElementById("photo-lightbox")
        .classList.add("active");
}

// Create an individual page for each sports album
async function renderAlbumPage(albumId) {

    const album = albums.get(albumId);

    if (!album) return;

    const routeId = "sports-album-" + albumId;

    let albumPage = document.getElementById(routeId);

    if (!albumPage) {
        albumPage = document.createElement("section");
        albumPage.id = routeId;
        albumPage.className = "route-view";

        document.querySelector("main").appendChild(albumPage);
    }

    albumPage.innerHTML = `
        <div class="container page-section">

            <article class="article-page">

                <a href="#sports" class="back-link">
                    ← Back to Sports
                </a>

                <p class="article-category">
                    ${album.info.sports?.name || "SPORTS"}
                </p>

                <h1 class="album-page-title"></h1>

                <p class="article-meta album-page-date"></p>

                <p class="article-description album-page-description"></p>

                <div class="three-column album-page-grid"></div>

            </article>

        </div>
    `;

    albumPage.querySelector(".album-page-title").textContent =
        album.info.title || "Sports Album";

    albumPage.querySelector(".album-page-date").textContent =
        formatDate(album.info.event_date);

    albumPage.querySelector(".album-page-description").textContent =
        album.info.description || "";

    const photosGrid = albumPage.querySelector(".album-page-grid");
    const lightboxAlbumPhotos = [];

    photosGrid.innerHTML = "";

    for (const photo of album.photos) {

        const { data, error } = await supabase
            .storage
            .from("sports-photos")
            .createSignedUrl(photo.storage_path, 3600);

        if (error) {
            console.error(error);
            continue;
        }

        const card = document.createElement("article");
        card.className = "gallery-card";

        const image = document.createElement("img");

image.src = data.signedUrl;
image.alt = photo.alt_text || photo.caption || "Sports photograph";
image.style.cursor = "zoom-in";

const photoIndex = lightboxAlbumPhotos.length;

lightboxAlbumPhotos.push({
    signedUrl: data.signedUrl,
    caption: photo.caption,
    alt_text: image.alt
});

image.addEventListener("click", () => {
    openLightbox(lightboxAlbumPhotos, photoIndex);
});



        const event = document.createElement("p");
        event.className = "gallery-event";
        event.textContent = album.info.sports?.name || "SPORTS";

        const date = document.createElement("p");
        date.className = "gallery-date";
        date.textContent = formatDate(photo.created_at);

        const caption = document.createElement("p");
        caption.className = "gallery-caption";
        caption.textContent = photo.caption || "";

        card.append(image, event, date, caption);
        photosGrid.appendChild(card);
    }

    if (window.location.hash === "#" + routeId) {
        albumPage.classList.add("is-active");
    }
}

// Detect when a sports album route is opened
async function handleGalleryRoute() {

    const route = window.location.hash.substring(1);

    if (!route.startsWith("sports-album-")) return;

    const albumId = route.replace("sports-album-", "");

    if (!albums.has(albumId)) return;

    await renderAlbumPage(albumId);
}

// Load albums from Supabase
async function loadGallery() {

    albumsContainer.innerHTML = "<p>Loading albums...</p>";

    const { data: photos, error } = await supabase
        .from("photos")
        .select(`
            *,
            albums (
                id,
                title,
                description,
                season,
                event_date,
                sports (
                    name,
                    slug
                )
            )
        `)
        .eq("approval_status", "approved")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Gallery error:", error);
        albumsContainer.innerHTML =
            "<p>Unable to load albums.</p>";
        return;
    }

    if (!photos || photos.length === 0) {
        albumsContainer.innerHTML =
            "<p>No albums available yet.</p>";
        return;
    }

    albums.clear();

    // Group photographs by album
    for (const photo of photos) {

        if (!photo.album_id || !photo.albums) continue;

        const albumId = photo.album_id;

        if (!albums.has(albumId)) {
            albums.set(albumId, {
                info: photo.albums,
                photos: []
            });
        }

        albums.get(albumId).photos.push(photo);
    }

    albumsContainer.innerHTML = "";

    // Generate album cards
    for (const [albumId, album] of albums) {

        const coverPhoto = album.photos[0];

        const { data, error: storageError } = await supabase
            .storage
            .from("sports-photos")
            .createSignedUrl(coverPhoto.storage_path, 3600);

        if (storageError) {
            console.error(storageError);
            continue;
        }

        const card = document.createElement("article");
        card.className = "gallery-card album-card";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");

        const image = document.createElement("img");
        image.src = data.signedUrl;
        image.alt = album.info.title || "Sports album";

        const content = document.createElement("div");
        content.className = "gallery-card-content";

        const title = document.createElement("h3");
        title.textContent =
            `${album.info.sports?.name || "Sports"} — ${album.info.title}`;

        const date = document.createElement("p");
        date.className = "gallery-date";
        date.textContent = formatDate(album.info.event_date);

        const description = document.createElement("p");
        description.className = "gallery-caption";
        description.textContent =
            album.info.description || "";

        const link = document.createElement("span");
        link.className = "gallery-link";
        link.textContent =
            `View Gallery (${album.photos.length} Photos) →`;

        content.append(title, date, description, link);
        card.append(image, content);

        // Open selected album
        function openAlbum() {
            window.location.hash = "sports-album-" + albumId;
        }

        card.addEventListener("click", openAlbum);

        card.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openAlbum();
            }
        });

        albumsContainer.appendChild(card);
    }
}

// Initialize gallery and album routes
window.addEventListener("hashchange", handleGalleryRoute);

async function initializeGallery() {

    createLightbox();

    await loadGallery();
    await handleGalleryRoute();
}

initializeGallery();


