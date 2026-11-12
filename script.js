async function getPhotoData(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('HTTP error: ' + response.status);
    }

    const data = await response.json();
    return data.content.results;
}

function findPhoto(photoData, year) {
    let bestPhoto = null;
    let smallestGap = Infinity;

    for (let i = 0; i < photoData.length; i++) {
        const record = photoData[i];

        if (!record.date || record.access_restricted) {
            continue;
        }

        const photoYear = Number(record.date.slice(0, 4));
        const gap = Math.abs(photoYear - year);
        let imageUrl = '';

        // for larger version
        if (record.item && record.item.service_medium) {
            imageUrl = record.item.service_medium;
        }

        // to check other images urls
        if (!imageUrl && record.image_url) {
            for (let j = record.image_url.length - 1; j >= 0; j--) {
                const url = record.image_url[j];

                if (url.includes('.svg') || url.includes('placeholder') ||
                    url.includes('150px') || url.includes('thumb')) {
                    continue;
                }

                imageUrl = url;
                break;
            }
        }

        if (imageUrl && gap < smallestGap) {
            smallestGap = gap;
            bestPhoto = {
                title: record.title,
                year: photoYear,
                url: imageUrl
            };
        }
    }

    return bestPhoto;
}

const form = document.getElementById('year_form');
const photo = document.getElementById('photo');
const caption = document.getElementById('photo_caption');

form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const year = Number(document.getElementById('birth_year').value);
    const url = 'https://www.loc.gov/photos/?q=New+York+City&fo=json';

    photo.hidden = true;
    caption.innerText = '🕙Loading🕒';
   
    try {
        let photoData = await getPhotoData(url + '&dates=' + year);
        let match = findPhoto(photoData, year);

        if (match === null || match.year !== year) {
            photoData = await getPhotoData(url + '&c=100');
            const backup = findPhoto(photoData, year);

            if (backup !== null) {
                if (match === null || Math.abs(backup.year - year) < Math.abs(match.year - year)) {
                    match = backup;
                }
            }
        }

        if (match === null) {
            caption.innerText = 'No image available.';
        } else {
            photo.src = match.url;
            photo.alt = match.title;
            photo.hidden = false;
            caption.innerText = match.title + ' (' + match.year + ')';
        }
    } catch (error) {
        caption.innerText = 'Could not load photos. Please try again.';
        console.error(error);
    }
});