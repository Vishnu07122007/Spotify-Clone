const CLIENT_ID = '5ea999767e83408aa4fc43c88585a7fa'; // Replace with your actual client ID
const REDIRECT_URI = 'https://vishnu07122007.github.io/Spotify-Clone/'; // Replace with your redirect URI
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=user-library-read%20playlist-read-private%20playlist-read-collaborative%20user-read-private%20user-read-email%20playlist-modify-public%20playlist-modify-private`;

let accessToken = null;

const loginBtn = document.getElementById('login-btn');
const searchBar = document.getElementById('search-bar');
const searchButton = document.getElementById('search-btn');
const recentlyPlayedContainer = document.getElementById('recently-played');
const categoriesContainer = document.getElementById('categories-container');
const playlistsContainer = document.getElementById('playlists-container'); // Container for playlists
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const mainContent = document.getElementById('main-content');
const loginModal = document.getElementById('login-modal');

// Show the login modal when the page loads
loginModal.style.display = 'flex';

loginBtn.addEventListener('click', () => {
  window.location.href = AUTH_URL;
});

// Handle logging out
logoutBtn.addEventListener('click', () => {
  // Clear access tokens and user data from localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();

  // Clear application-level data (if stored in variables)
  accessToken = null;

  // Prevent the use of cached pages
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => caches.delete(cacheName));
    });
  }

  // Redirect to the login page or home page
  window.location.href = 'https://vishnu07122007.github.io/Spotify-Clone/';
});
// Disable back button cache after logout
history.pushState(null, '', location.href);
window.onpopstate = function () {
  history.go(1);
};
function saveWithExpiry(key, value, ttl) {
  const now = new Date();
  const item = {
    value,
    expiry: now.getTime() + ttl, // Expiry time in milliseconds
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key); // Remove expired item
    return null;
  }

  return item.value;
}

// Check if the user is logged in
function checkLogin() {
  const hash = window.location.hash;
  const accessTokenFromUrl = hash.match(/access_token=([^&]*)/);
  if (accessTokenFromUrl) {
    accessToken = accessTokenFromUrl[1];
    localStorage.setItem('access_token', accessToken);
    loginModal.style.display = 'none';
    mainContent.style.display = 'block';
    getUserInfo();
    fetchCategories();
    fetchRecentlyPlayed();
    fetchPlaylists(); // Fetch user's playlists after login
  } else {
    accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      mainContent.style.display = 'block';
      getUserInfo();
      fetchCategories();
      fetchRecentlyPlayed();
      fetchPlaylists(); // Fetch user's playlists after login
    }
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
      userName.textContent = data.display_name;
    })
    .catch((error) => console.error('Error fetching user info:', error));
}

// Fetch categories from Spotify API and display them
function fetchCategories() {
  fetch('https://api.spotify.com/v1/browse/categories', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const categories = data.categories.items;
      categoriesContainer.innerHTML = ''; // Clear previous categories

      // Show the categories on the main page
      categories.forEach((category) => {
        const categoryElement = document.createElement('div');
        categoryElement.classList.add('category-item');
        
        // Add category image and name
        categoryElement.innerHTML = `
          <img src="${category.icons[0].url}" alt="${category.name}">
          <p class="category-name">${category.name}</p>
          <button class="see-all-btn" onclick="displayAllCategories()">see-all-btn</button>
        `;
        
        categoriesContainer.appendChild(categoryElement);
      });
    })
    .catch((error) => console.error('Error fetching categories:', error));
}

// Display all categories on a new page or section when "See All" is clicked
function displayAllCategories() {
  // Show the loader while fetching data
  document.getElementById('loader').style.display = 'block';

  fetch('https://api.spotify.com/v1/browse/categories', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const categories = data.categories.items;
      const allCategoriesContainer = document.createElement('div');
      allCategoriesContainer.classList.add('all-categories-container');

      // Create the Back button
      const backButton = document.createElement('button');
      backButton.textContent = 'Back';
      backButton.classList.add('back-button');
      backButton.addEventListener('click', () => {
        allCategoriesContainer.style.display = 'none'; // Hide all categories
        categoriesContainer.style.display = 'block'; // Show the main categories again
      });

      allCategoriesContainer.appendChild(backButton);

      // Display all categories
      categories.forEach((category) => {
        const categoryElement = document.createElement('div');
        categoryElement.classList.add('category-item');

        categoryElement.innerHTML = `
          <img src="${category.icons[0].url}" alt="${category.name}">
          <p class="category-name">${category.name}</p>
        `;
        allCategoriesContainer.appendChild(categoryElement);
      });

      // Hide the main categories and show the full list
      categoriesContainer.style.display = 'none';
      document.body.appendChild(allCategoriesContainer);
      
      // Hide loader after the content is loaded
      document.getElementById('loader').style.display = 'none';
    })
    .catch((error) => {
      console.error('Error fetching all categories:', error);
      document.getElementById('loader').style.display = 'none';
    });
}

// Fetch playlists for the user with pagination
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
        console.log('Fetched playlists:', data);  // Log the fetched data
        
        allPlaylists = allPlaylists.concat(data.items);

        // Check if there's another page to fetch
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
function searchSpotify(query) {
  fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=10`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Search results:', data);  // Log the search results
      const playlists = data.playlists.items;
      displayPlaylists(playlists); // Display search results as playlists
    })
    .catch((error) => console.error('Error performing search:', error));
}


// Display the playlists or show a message if empty
function displayPlaylists(playlists) {
  playlistsContainer.innerHTML = ''; // Clear previous playlist items

  if (playlists.length === 0) {
    playlistsContainer.innerHTML = '<p>No playlists available</p>'; // Message if no playlists
    return;
  }

  playlists.forEach((playlist) => {
    const playlistElement = document.createElement('div');
    playlistElement.classList.add('playlist-item');
    playlistElement.innerHTML = `
      <img src="${playlist.images[0]?.url}" alt="${playlist.name}" />
      <p>${playlist.name}</p>
    `;
    
    // Link to the playlist page with the playlist ID
    playlistElement.addEventListener('click', () => {
      window.location.href = `playlist.html?id=${playlist.id}`; // Redirect to playlist page with playlist ID
    });
    
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
