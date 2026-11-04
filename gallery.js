
import { supabase } from "./supabase.js";

const galleryContainer = document.getElementById("sports-gallery");

async function loadGallery() {
    if (!galleryContainer) return;

    galleryContainer.innerHTML = "<p>Loading photos...</p>";

    const { data: photos, error } = await supabase
    .from("photos")
    .select(`
        *,
        albums (
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

        console.log("PHOTOS:", photos);
console.log("ERROR:", error);

    if (error) {
        console.error("Gallery error:", error);
        galleryContainer.innerHTML =
            "<p>Unable to load photos.</p>";
        return;
    }

    if (!photos || photos.length === 0) {
        galleryContainer.innerHTML =
            "<p>No approved photos yet.</p>";
        return;
    }

    galleryContainer.innerHTML = "";

    for (const photo of photos) {
        const { data, error: storageError } = await supabase
            .storage
            .from("sports-photos")
            .createSignedUrl(photo.storage_path, 3600);

        if (storageError) {
            console.error(storageError);
            continue;
        }

        const card = document.createElement("article");
card.className = "gallery-card";

// Photograph
const image = document.createElement("img");
image.src = data.signedUrl;
image.alt = photo.alt_text || photo.caption || "School photo";


// Album and sport information
const album = photo.albums;
const sportName = album?.sports?.name || "SPORTS";

// Event title
const event = document.createElement("p");
event.className = "gallery-event";
event.textContent = `${sportName} — ${album?.title || ""}`;

// Date
const date = document.createElement("p");
date.className = "gallery-date";

const photoDate =
    photo.taken_at ||
    album?.event_date ||
    photo.created_at;

date.textContent = photoDate
    ? new Date(photoDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    })
    : "";

// Caption
const caption = document.createElement("p");
caption.className = "gallery-caption";

caption.textContent =
    photo.caption ||
    album?.description ||
    "";

// Assemble card
card.append(image, event, date, caption);
galleryContainer.appendChild(card);

    }
}

loadGallery();
