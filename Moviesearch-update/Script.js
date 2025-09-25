
const API_KEY = "29020c5430d4626e3749dd409932bd60";
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

// Search Section
async function searchMovie() {
  const movieName = document.getElementById('movieInput').value.trim();
  if (!movieName) return;
  console.log(movieName);

  const url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(movieName)}&include_adult=false`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(data);

  const movies = data.results.filter(item => item.media_type !== "person");
  const resultDiv = document.getElementById('movieResult');

  const movieCards = movies.map(movie =>`
 <div class="bg-white shadow rounded p-4 w-[300px]">
    ${movie.poster_path
      ? `<img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" 
             alt="${movie.title || movie.name}" 
            class="rounded mb-3 w-full h-40 object-cover">`
      : `<div class="bg-gray-200 h-32 mb-3 flex items-center justify-center text-gray-500">No image</div>`}
    <h2 class="text-lg font-semibold mb-1">${movie.title || movie.name}</h2>
    <p class="text-gray-600 text-sm mb-2">
      <strong>Release Date:</strong> ${movie.release_date || movie.first_air_date}
    </p>
    <p class="text-yellow-600 text-sm mb-2">
  ⭐ Rating: ${movie.vote_average} / 10
</p>
<p class="text-blue-600 text-sm mb-2">
  🔥 Popularity: ${movie.popularity ? movie.popularity.toFixed(1) : 'N/A'}
</p>
    <p class="text-gray-800 text-sm flex-1 myText line-clamp-6 hover:line-clamp-none cursor-pointer">
      ${movie.overview || 'No description available.'}
    </p>
  </div>
`).join('');


  resultDiv.innerHTML = movieCards;
}

document.getElementById('movieInput').addEventListener('input', function (e) {
  console.log(e);
  let textL = document.getElementById('movieInput');
  const text = textL.value.trim();

  if (text.length >= 3) {
    searchMovie();
  } else {
    document.getElementById('movieResult').innerHTML = "";
  }
  if (e.key === 'Enter') {
    searchMovie();
  }
});

// trending Section
const trendingGrid = document.getElementById("trendingGrid");
const trendTabs = document.querySelectorAll(".trend-tab");

function cardHTML(item) {
  const title  = item.title || item.name || "Untitled";
  const year   = (item.release_date || item.first_air_date || "").slice(0, 4) || "N/A";
  const rating = typeof item.vote_average === "number" ? item.vote_average.toFixed(1) : "–";
  const img    = item.poster_path ? `${IMG}${item.poster_path}` : null;

  return `
    <div class="relative w-56 sm:w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg bg-gray-900">
      ${
        img
          ? `<img src="${img}" alt="${title}" class="w-full h-72 object-cover">`
          : `<div class="w-full h-72 bg-gray-700 flex items-center justify-center text-gray-300">No image</div>`
      }
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

      <div class="absolute bottom-12 left-3 right-3">
        <h3 class="text-white font-semibold text-base sm:text-lg line-clamp-1">${title}</h3>
      </div>

      <div class="absolute bottom-3 left-3 right-3 flex items-center gap-2">
        <span class="text-white/90 text-[11px] sm:text-xs bg-white/10 backdrop-blur px-2 py-1 rounded-full">★ ${rating}</span>
        <span class="text-white/90 text-[11px] sm:text-xs bg-white/10 backdrop-blur px-2 py-1 rounded-full">${year}</span>
      </div>
    </div>
  `;
}
async function loadTrending(time = "day") {
  trendingGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">Loading...</p>`;
  try {
    const res = await fetch(`${BASE}/trending/all/${time}?api_key=${API_KEY}`);
    const data = await res.json();
    const items = Array.isArray(data.results) ? data.results : [];
    const movies = items.filter(i => i.media_type === "movie");
    const tv     = items.filter(i => i.media_type === "tv");

    trendingGrid.innerHTML = `
      <div class="col-span-full">
        <h3 class="text-xl font-bold mb-3 text-white">🎬 Movies</h3>
        <div class="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          ${movies.length ? movies.map(cardHTML).join("") : `<p class="text-gray-400">No movies trending.</p>`}
        </div>
      </div>

      <div class="col-span-full mt-8">
        <h3 class="text-xl font-bold mb-3 text-white">📺 TV Series</h3>
        <div class="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          ${tv.length ? tv.map(cardHTML).join("") : `<p class="text-gray-400">No TV shows trending.</p>`}
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    trendingGrid.innerHTML = `<p class="col-span-full text-center text-red-500">Error loading trending data.</p>`;
  }
}
trendTabs.forEach(btn => {
  btn.addEventListener("click", () => {
    trendTabs.forEach(b => b.classList.remove("bg-white", "shadow"));
    btn.classList.add("bg-white", "shadow");
    loadTrending(btn.dataset.trending || "day");
  });
});

loadTrending("day");
// Popular Section
const popularGrid = document.getElementById("popularGrid");
const popTabs = document.querySelectorAll(".pop-tab");

function popUrl(kind, page = 1) {
  switch (kind) {
    case "streaming":
      return `${BASE}/discover/movie?api_key=${API_KEY}&with_watch_monetization_types=flatrate&sort_by=popularity.desc&page=${page}`;
    case "tv":
      return `${BASE}/tv/popular?api_key=${API_KEY}&page=${page}`;
    case "rent":
      return `${BASE}/discover/movie?api_key=${API_KEY}&with_watch_monetization_types=rent&sort_by=popularity.desc&page=${page}`;
    case "theaters":
      return `${BASE}/movie/now_playing?api_key=${API_KEY}&page=${page}`;
    default:
      return `${BASE}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&page=${page}`;
  }
}

async function loadPopular(kind = "streaming", page = 1) {
  popularGrid.innerHTML = `<p class="text-center text-gray-500">Loading…</p>`;
  try {
    const res = await fetch(popUrl(kind, page));
    const data = await res.json();
    const items = Array.isArray(data.results) ? data.results.slice(0, 12) : [];
    popularGrid.innerHTML = items.length
      ? items.map(cardHTML).join("")
      : `<p class="text-center text-gray-400">No results.</p>`;
    popularGrid.scrollLeft = 0; // ← reset scroll position
  } catch (e) {
    console.error(e);
    popularGrid.innerHTML = `<p class="text-center text-red-500">Error loading popular.</p>`;
  }
}
// tab clicks
popTabs.forEach(btn => {
  btn.addEventListener("click", () => {
    popTabs.forEach(b => b.classList.remove("bg-white","shadow"));
    btn.classList.add("bg-white","shadow");
    loadPopular(btn.dataset.pop);
  });
});
// initial
loadPopular("streaming");


