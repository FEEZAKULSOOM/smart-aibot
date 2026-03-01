// pexels.js - Replace your huggingface.js with this

import { prevUser } from "./context/UserContext";

// Your Pexels API key
const PEXELS_API_KEY = "OGuULSrvm1p9NRd1S01UgRb3OyfB3Cu0mDAAwwRyLpeum7HXDjJZBde4"; // Get from https://www.pexels.com/api/

export async function query() {
    const prompt = prevUser.prompt || "nature"; // Search query

    try {
        console.log("Searching Pexels for:", prompt);

        // Search for photos using Pexels API [citation:1][citation:9]
        const response = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(prompt)}&per_page=1&orientation=landscape`,
            {
                method: 'GET',
                headers: {
                    'Authorization': PEXELS_API_KEY, // NO "Bearer" prefix!
                    'Content-Type': 'application/json',
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Pexels error:", errorText);
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Check if we got any photos [citation:1]
        if (data.photos && data.photos.length > 0) {
            const photo = data.photos[0];
            const imageUrl = photo.src.large; // Use 'large', 'medium', or 'original'

            console.log("Found photo by:", photo.photographer);

            // Download the actual image
            const imageResponse = await fetch(imageUrl);
            const blob = await imageResponse.blob();

            // Store photographer info for attribution (required by Pexels) [citation:1][citation:7]
            const photoInfo = {
                photographer: photo.photographer,
                photographerUrl: photo.photographer_url,
                pexelsUrl: photo.url
            };
            sessionStorage.setItem('lastPhotoAttribution', JSON.stringify(photoInfo));

            return blob;
        } else {
            throw new Error("No photos found");
        }

    } catch (error) {
        console.error("Pexels search failed:", error);

        // Fallback: Get curated photos instead [citation:1]
        try {
            console.log("Trying curated photos...");
            const curatedResponse = await fetch(
                'https://api.pexels.com/v1/curated?per_page=1',
                {
                    headers: { 'Authorization': PEXELS_API_KEY }
                }
            );

            const curatedData = await curatedResponse.json();
            if (curatedData.photos && curatedData.photos.length > 0) {
                const imageResponse = await fetch(curatedData.photos[0].src.large);
                return await imageResponse.blob();
            }
        } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
        }

        // Ultimate fallback: colored placeholder
        return createPlaceholderImage(prompt);
    }
}

// Helper function to create a placeholder if everything fails
function createPlaceholderImage(prompt) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#6b8cff');
    gradient.addColorStop(1, '#8a6bff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Pexels Image', canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = '24px Arial';
    ctx.fillText(`Search: "${prompt}"`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.font = '18px Arial';
    ctx.fillText('Check console for API issues', canvas.width / 2, canvas.height / 2 + 70);

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
}