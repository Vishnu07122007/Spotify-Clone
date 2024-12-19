const CLIENT_ID = '5ea999767e83408aa4fc43c88585a7fa'; // Replace with your actual client ID
const REDIRECT_URI = 'https://vishnu07122007.github.io/Spotify-Clone/'; // Replace with your redirect URI
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=user-library-read%20playlist-read-private%20playlist-read-collaborative%20user-read-private%20user-read-email%20playlist-modify-public%20playlist-modify-private`;

let accessToken = null;

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const mainContent = document.getElementById('main-content');
const loginModal = document.getElementById('login-modal');

// Grab the login button
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    // Log to see if the click event is triggering
    console.log('Login button clicked');
    window.location.href = AUTH_URL;
  });
} else {
  console.error('Login button not found!');
}
// This will trigger when the login button is clicked
loginBtn.addEventListener('click', () => {
  window.location.href = AUTH_URL;  // Redirect to Spotify authentication
});
// Show the login modal when the page loads
loginModal.style.display = 'flex';

// Check if the user is logged in when the page loads
window.addEventListener('load', () => {
  if (!localStorage.getItem('access_token')) {
    window.location.replace('https://vishnu07122007.github.io/Spotify-Clone/');
  } else {
    accessToken = localStorage.getItem('access_token');
    mainContent.style.display = 'block';
    loginModal.style.display = 'none';
    getUserInfo();
    fetchCategories();
    fetchRecentlyPlayed();
    fetchPlaylists();
  }

  // Prevent back navigation after login/logout
  history.pushState(null, '', window.location.href);
  history.back();
  history.forward();
});

// Handle logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('access_token');
  sessionStorage.clear();
  window.location.replace('https://vishnu07122007.github.io/Spotify-Clone/');
});

// Check for access token in the URL and handle login
function checkLogin() {
  const hash = window.location.hash;
  const accessTokenFromUrl = hash.match(/access_token=([^&]*)/);
  if (accessTokenFromUrl) {
    accessToken = accessTokenFromUrl[1];
    localStorage.setItem('access_token', accessToken);
    mainContent.style.display = 'block';
    loginModal.style.display = 'none';
    getUserInfo();
    fetchCategories();
    fetchRecentlyPlayed();
    fetchPlaylists();
  }
}

// Fetch user info after login
function getUserInfo() {
  fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('user-name').textContent = data.display_name;
    })
    .catch((error) => console.error('Error fetching user info:', error));
}

// Fetch categories from Spotify API
function fetchCategories() {
  fetch('https://api.spotify.com/v1/browse/categories', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const categories = data.categories.items;
      const categoriesContainer = document.getElementById('categories-container');
      categoriesContainer.innerHTML = '';

      categories.forEach((category) => {
        const categoryElement = document.createElement('div');
        categoryElement.classList.add('category-item');
        categoryElement.innerHTML = `
          <img src="${category.icons[0].url}" alt="${category.name}">
          <p class="category-name">${category.name}</p>
        `;
        categoriesContainer.appendChild(categoryElement);
      });
    })
    .catch((error) => console.error('Error fetching categories:', error));
}

// Fetch playlists for the user
function fetchPlaylists() {
  fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const playlistsContainer = document.getElementById('playlists-container');
      playlistsContainer.innerHTML = '';
      data.items.forEach((playlist) => {
        const playlistElement = document.createElement('div');
        playlistElement.classList.add('playlist-item');
        playlistElement.innerHTML = `
          <img src="${playlist.images[0]?.url}" alt="${playlist.name}" />
          <p>${playlist.name}</p>
        `;
        playlistElement.addEventListener('click', () => {
          window.location.href = `playlist.html?id=${playlist.id}`;
        });
        playlistsContainer.appendChild(playlistElement);
      });
    })
    .catch((error) => console.error('Error fetching playlists:', error));
}

// Handle search functionality
const searchButton = document.getElementById('search-btn');
searchButton.addEventListener('click', () => {
  const query = document.getElementById('search-bar').value;
  if (query) {
    searchSpotify(query);
  }
});

function searchSpotify(query) {
  fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=10`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const playlists = data.playlists.items;
      displayPlaylists(playlists);
    })
    .catch((error) => console.error('Error performing search:', error));
}

function displayPlaylists(playlists) {
  const playlistsContainer = document.getElementById('playlists-container');
  playlistsContainer.innerHTML = '';

  if (playlists.length === 0) {
    playlistsContainer.innerHTML = '<p>No playlists available</p>';
    return;
  }

  playlists.forEach((playlist) => {
    const playlistElement = document.createElement('div');
    playlistElement.classList.add('playlist-item');
    playlistElement.innerHTML = `
      <img src="${playlist.images[0]?.url}" alt="${playlist.name}" />
      <p>${playlist.name}</p>
    `;
    playlistsContainer.appendChild(playlistElement);
  });
}


// Call fetchPlaylists to fetch all playlists after login
fetchPlaylists();

// Periodically check login status every 30 seconds (for example)
setInterval(() => {
  checkLogin();  // Recheck login status
}, 30000); // 30000 ms = 30 seconds

// Periodically refresh playlists every 1 minute
setInterval(() => {
  fetchPlaylists();  // Re-fetch playlists every minute
}, 60000); // 60000 ms = 1 minute

// Fetch recently played tracks from Spotify API
function fetchRecentlyPlayed() {
  fetch('https://api.spotify.com/v1/me/player/recently-played', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const tracks = data.items;
      recentlyPlayedContainer.innerHTML = '';
      tracks.forEach((track) => {
        const trackElement = document.createElement('div');
        trackElement.classList.add('song-item');
        trackElement.innerHTML = `
          <img src="${track.track.album.images[0].url}" alt="${track.track.name}">
          <p>${track.track.name}</p>
          <p>${track.track.artists.map((artist) => artist.name).join(', ')}</p>
        `;
        recentlyPlayedContainer.appendChild(trackElement);
      });
    })
    .catch((error) => console.error('Error fetching recently played tracks:', error));
}

// Handle search button click
searchButton.addEventListener('click', () => {
  const query = searchBar.value;
  if (query) {
    searchSpotify(query);
  }
});

// Perform search on Spotify API
function searchSpotify(query) {
  fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,album,artist,playlist&limit=10`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const resultsContainer = document.getElementById('search-results');
      resultsContainer.innerHTML = ''; // Clear previous results

      const searchResults = data.tracks.items;
      searchResults.forEach((result) => {
        const resultElement = document.createElement('div');
        resultElement.classList.add('search-result-item');
        resultElement.innerHTML = `
          <img src="${result.album.images[0].url}" alt="${result.name}">
          <div class="result-details">
            <p>${result.name}</p>
            <p>${result.artists.map((artist) => artist.name).join(', ')}</p>
          </div>
        `;
        resultsContainer.appendChild(resultElement);
      });
    })
    .catch((error) => console.error('Error performing search:', error));
}

// Initial login check
checkLogin();
const playlistsBtn = document.getElementById('playlists-btn');
  // Add click event listener to redirect to playlist.html
  playlistsBtn.addEventListener('click', () => {
    window.location.href = 'playlist.html'; // Redirect to playlist.html
  });


  // Initial login check
checkLogin();
const categoriesbtn= document.getElementById('categories-btn');
categoriesbtn.addEventListener('click', () => {
    window.location.href = 'category.html'; // Redirect to category .html
  });




// Get the hamburger menu button, sidebar, and main content
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');


// Add click event listener to the hamburger menu
menuToggle.addEventListener('click', () => {
    // Toggle the 'open' class to open/close the sidebar
    sidebar.classList.toggle('open');
    
    // If sidebar is open, add a class to the main content to push it to the right
    if (sidebar.classList.contains('open')) {
        mainContent.style.marginLeft = '250px'; // Sidebar is visible, push content
    } else {
        mainContent.style.marginLeft = '0'; // Sidebar is hidden, full width content
    }
});
