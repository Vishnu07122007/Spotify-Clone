// Get the access token from localStorage
const accessToken = localStorage.getItem('access_token');

// If no access token, redirect to login page
if (!accessToken) {
  window.location.href = '/';  // Redirect to login page
} else {
  // Fetch playlists using the access token
  fetchPlaylists();
}

// Fetch all playlists for the user (with pagination)
function fetchPlaylists() {
  let allPlaylists = [];
  let url = 'https://api.spotify.com/v1/me/playlists';
  
  // Fetch playlists with pagination
  function fetchNextPage(nextUrl) {
    fetch(nextUrl || url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);  // Log the response data

        // Check if we got a valid response
        if (data && data.items) {
          allPlaylists = allPlaylists.concat(data.items);
        }

        if (data.next) {
          fetchNextPage(data.next); // Recursively fetch next page
        } else {
          // Once all pages are fetched, display the playlists
          displayPlaylists(allPlaylists);
        }
      })
      .catch((error) => console.error('Error fetching playlists:', error));
  }

  fetchNextPage();
}

// Display the playlists or show a message if empty
function displayPlaylists(playlists) {
  const playlistsContainer = document.getElementById('playlists-container');
  playlistsContainer.innerHTML = ''; // Clear previous playlist items

  if (playlists.length === 0) {
    playlistsContainer.innerHTML = '<p>No playlists available</p>'; // Message if no playlists
    return;
  }

  playlists.forEach((playlist) => {
    const playlistElement = document.createElement('div');
    playlistElement.classList.add('playlist-item');
    playlistElement.innerHTML = `
      <img src="${playlist.images[0]?.url || 'default-image.jpg'}" alt="${playlist.name}" />
      <p>${playlist.name}</p>
    `;

    // Link to the playlist page with the playlist ID
    playlistElement.addEventListener('click', () => {
      window.location.href = `playlist-detail.html?id=${playlist.id}`; // Redirect to playlist detail page with playlist ID
    });

    playlistsContainer.appendChild(playlistElement);
  });
}
document.getElementById('back-btn').addEventListener('click', function() {
 window.history.back(); // Go back to the previous page
});

