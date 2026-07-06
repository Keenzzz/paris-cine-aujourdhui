const API_BASE = "/proxy";
const CACHE_KEY      = "pci_movies_cache";
const WATCHLIST_KEY  = "pci_watchlist";
const CULTES_CUTOFF = 2017;
const SHOWTIMES_REVEAL_COUNT = 2;
const VILLETTE_INFO_URL = "https://www.lavillette.com/manifestations/cinema-en-plein-air-26/";

const storage = {
  async get(key) {
    try {
      const raw = localStorage.getItem(key);
      return { [key]: raw ? JSON.parse(raw) : undefined };
    } catch { return { [key]: undefined }; }
  },
  async set(obj) {
    for (const [k, v] of Object.entries(obj))
      localStorage.setItem(k, JSON.stringify(v));
  },
};

const GENRES = {
  act: "Action", adv: "Aventures", ani: "Animation", com: "Comédie",
  doc: "Documentaire", dra: "Drame", hor: "Épouvante-horreur", fam: "Famille",
  fan: "Fantastique", his: "Historique", mys: "Mystère", pol: "Policier",
  rom: "Romance", sci: "Science-fiction", thr: "Thriller", wes: "Western",
  mar: "Arts Martiaux", bio: "Biographique", cod: "Comédie dramatique",
  cmu: "Comédie musicale", ero: "Érotique", spy: "Espionnage", noi: "Film Noir",
  war: "Guerre", jud: "Judiciaire", mus: "Musique",
};

const TIME_WINDOWS = {
  morning:   { min: 0,  max: 12 },
  afternoon: { min: 12, max: 18 },
  evening:   { min: 18, max: 24 },
};

const LV = "https://www.lavillette.com/wp-content/uploads/2026/06/";

const VILLETTE_PROGRAM = [
  { date:"2026-07-22", title:"Mon voisin Totoro",                         director:"Hayao Miyazaki",                                  year:"1988", version:"VF",    duration:"1h27",   jeune:true,  img:LV+"MON-VOISIN-TOTORO-photo_1013218-©-1988-Studio-Ghibli-scaled.jpg" },
  { date:"2026-07-22", title:"Le Règne animal",                           director:"Thomas Cailley",                                  year:"2023", version:"VF",    duration:"2h10",   jeune:false, img:LV+"Photo-3_LE-REGNE-ANIMAL_©-2023-NORD-OUEST-FILMS-STUDIOCANAL-FRANCE-2-CINEMA-ARTEMIS-PRODUCTIONS-scaled.jpg" },
  { date:"2026-07-23", title:"La petite taupe aime la nature",            director:"Zdeněk Miler",                                    year:"2020", version:"VF",    duration:"44 min", jeune:true,  img:LV+"chewing_1.jpg" },
  { date:"2026-07-23", title:"Le Nouveau Monde",                          director:"Terrence Malick",                                 year:"2006", version:"VOSTF", duration:"2h16",   jeune:false, img:LV+"le-nouveau-monde.jpg" },
  { date:"2026-07-24", title:"Ernest et Célestine",                       director:"Benjamin Renner, Vincent Patar, Stéphane Aubier", year:"2012", version:"VF",    duration:"1h20",   jeune:true,  img:LV+"ernest-et-celestine-e1781509894605.jpg" },
  { date:"2026-07-24", title:"Le Projet Blair Witch",                     director:"Daniel Myrick, Eduardo Sánchez",                  year:"1999", version:"VOSTF", duration:"1h21",   jeune:false, img:LV+"blair-witch.jpg" },
  { date:"2026-07-25", title:"Flow, le chat qui n'avait plus peur de l'eau", director:"Gints Zilbalodis",                            year:"2024", version:"VF",    duration:"1h25",   jeune:true,  img:LV+"Flow-©-UFODISTRIBUTION-1-scaled.jpg" },
  { date:"2026-07-25", title:"Into the Wild",                             director:"Sean Penn",                                       year:"2008", version:"VOSTF", duration:"2h28",   jeune:false, img:LV+"into-the-wild-2.jpg" },
  { date:"2026-07-26", title:"Arriety, le petit monde des chapardeurs",   director:"Hiromasa Yonebayashi",                            year:"2011", version:"VF",    duration:"1h34",   jeune:true,  img:LV+"ARRIETTY-photo_c0659_t2.0082-©-2010-Studio-Ghibli-NDHDMTW.jpg" },
  { date:"2026-07-26", title:"Princesse Mononoké",                        director:"Hayao Miyazaki",                                  year:"1997", version:"VOSTF", duration:"2h15",   jeune:false, img:LV+"PRINCESSE-MONONOKE-photo_1001848-©-1997-Studio-Ghibli-ND-scaled-e1780580003138.jpg" },
  { date:"2026-07-29", title:"Yuku et la fleur de l'Himalaya",            director:"Arnaud Demuynck, Rémi Durin",                     year:"2022", version:"VF",    duration:"1h05",   jeune:true,  img:LV+"Visuel-Yuku-6.jpg" },
  { date:"2026-07-29", title:"Petite maman",                              director:"Céline Sciamma",                                  year:"2021", version:"VOSTF", duration:"1h13",   jeune:false, img:LV+"pm-lilies-films3-scaled.jpg" },
  { date:"2026-07-30", title:"Les amis animaux",                          director:"Eva Lindström",                                   year:"2014", version:"VF",    duration:"36 min", jeune:true,  img:LV+"louis_1.jpg" },
  { date:"2026-07-30", title:"Le Mal n'existe pas",                       director:"Ryûsuke Hamaguchi",                               year:"2023", version:"VOSTF", duration:"1h46",   jeune:false, img:LV+"LE-MAL-NEXISTE-PAS_COUV_TWITTER_1500x500-e1780579824103.jpg" },
  { date:"2026-07-31", title:"Zarafa",                                    director:"Rémi Bezançon, Jean-Christophe Lie",              year:"2012", version:"VF",    duration:"1h18",   jeune:true,  img:LV+"ZARAFA-©-2011-PRIMA-LINEA-PRODUCTIONS-PATHE-PRODUCTION-FRANCE-3-CINEMA-CHAOCORP-SCOPE-PICTURES-4.webp" },
  { date:"2026-07-31", title:"Sleepy Hollow",                             director:"Tim Burton",                                      year:"1999", version:"VOSTF", duration:"1h45",   jeune:false, img:LV+"johnny-depp-sleepy-hollow.avif" },
  { date:"2026-08-01", title:"Mary et la fleur de la sorcière",           director:"Hiromasa Yonebayashi",                            year:"2017", version:"VF",    duration:"1h43",   jeune:true,  img:LV+"MARY_ET_LA_FLEUR_DE_LA_SORCIERE_Photo_3©2017_M.F-scaled.jpg" },
  { date:"2026-08-01", title:"King Kong",                                 director:"Peter Jackson",                                   year:"2005", version:"VOSTF", duration:"3h",     jeune:false, img:LV+"King-Kong-2.jpg" },
  { date:"2026-08-02", title:"Cro Man",                                   director:"Nick Park",                                       year:"2018", version:"VF",    duration:"1h29",   jeune:true,  img:LV+"cro-man.webp" },
  { date:"2026-08-02", title:"Dersou Ouzala",                             director:"Akira Kurosawa",                                  year:"1975", version:"VOSTF", duration:"2h21",   jeune:false, img:LV+"Dersou-Ouzala-©Mosfilm-Cinema-Concern-7.png" },
  { date:"2026-08-05", title:"La Guerre des boutons",                     director:"Yves Robert",                                     year:"1962", version:"VF",    duration:"1h30",   jeune:true,  img:LV+"2011-08-11_09-14-43_petit_gibus_et_son_frere_-_copie-scaled.jpg" },
  { date:"2026-08-05", title:"Night Moves",                               director:"Kelly Reichardt",                                 year:"2013", version:"VOSTF", duration:"1h52",   jeune:false, img:LV+"NIGHT-MOVES-4-©Tipping-Point-Productions-LLC-scaled.jpg" },
  { date:"2026-08-06", title:"Le Gruffalo",                               director:"Max Lang, Jakob Schuh",                           year:"2009", version:"VF",    duration:"45 min", jeune:true,  img:LV+"epinard_1.jpg" },
  { date:"2026-08-06", title:"Onoda – 10 000 nuits dans la jungle",       director:"Arthur Harari",                                   year:"2021", version:"VOSTF", duration:"2h47",   jeune:false, img:LV+"onoda-1.jpg" },
  { date:"2026-08-07", title:"Le Jour des corneilles",                    director:"Jean-Christophe Dessaint",                        year:"2012", version:"VF",    duration:"1h35",   jeune:true,  img:LV+"image-15-scaled.jpg" },
  { date:"2026-08-07", title:"Dead Man",                                  director:"Jim Jarmusch",                                    year:"1995", version:"VOSTF", duration:"2h01",   jeune:false, img:LV+"Dead-Man-c-DR-3-scaled.jpg" },
  { date:"2026-08-08", title:"Panda Petit Panda",                         director:"Isao Takahata, Hayao Miyazaki",                   year:"1972", version:"VF",    duration:"1h11",   jeune:true,  img:LV+"Visuels-Panda-petit-panda-12.jpg" },
  { date:"2026-08-08", title:"Twin Peaks – Fire Walk with Me",            director:"David Lynch",                                     year:"1992", version:"VOSTF", duration:"2h15",   jeune:false, img:LV+"TwinPeaks-Fire-walk-with-me-©-mk2-Films-1.jpg" },
  { date:"2026-08-09", title:"Sauvages",                                  director:"Claude Barras",                                   year:"2024", version:"VF",    duration:"1h27",   jeune:true,  img:LV+"SAUVAGES_6.jpg" },
  { date:"2026-08-09", title:"Miséricorde",                               director:"Alain Guiraudie",                                 year:"2024", version:"VOSTF", duration:"1h43",   jeune:false, img:LV+"MISERICORDE-4-copyright-CG-Cinema--scaled.jpg" },
  { date:"2026-08-12", title:"Le Chêne",                                  director:"Michel Seydoux, Laurent Charbonnier",             year:"2022", version:"VF",    duration:"1h20",   jeune:true,  img:LV+"2021-12-21_LE-CHENE_PHOTO_04-e1781511693492.jpg" },
  { date:"2026-08-12", title:"Le Daim",                                   director:"Quentin Dupieux",                                 year:"2019", version:"VOSTF", duration:"1h20",   jeune:false, img:LV+"LE_DAIM_Photo_1©Atelier-de-Production-scaled.jpg" },
  { date:"2026-08-13", title:"Pierre et le loup",                         director:"Suzie Templeton, Pierre-Luc Granjon",             year:"2006", version:"VF",    duration:"41 min", jeune:true,  img:LV+"pierre_1-scaled.jpg" },
  { date:"2026-08-13", title:"Winter's Bone",                             director:"Debra Granik",                                    year:"2010", version:"VOSTF", duration:"1h40",   jeune:false, img:LV+"WintersBone_photo7-scaled.jpg" },
  { date:"2026-08-14", title:"Kirikou et la Sorcière",                    director:"Michel Ocelot",                                   year:"1998", version:"VF",    duration:"1h10",   jeune:true,  img:LV+"Kirikou-02.jpg" },
  { date:"2026-08-14", title:"Stand by Me",                               director:"Rob Reiner",                                      year:"1986", version:"VOSTF", duration:"1h30",   jeune:false, img:LV+"Stand-by-me-©2026-COLUMBIA-PICTURES-INDUSTRIES-INC-scaled.jpg" },
  { date:"2026-08-15", title:"Le Peuple loup",                            director:"Tomm Moore, Ross Stewart",                        year:"2020", version:"VF",    duration:"1h43",   jeune:true,  img:LV+"Le-peuple-loup-©-2020-Cartoon-Saloon-WolfWalkers-Ltd-Melusine-Productions-5-scaled.jpeg" },
  { date:"2026-08-15", title:"Seul au monde",                             director:"Robert Zemeckis",                                 year:"2000", version:"VOSTF", duration:"2h23",   jeune:false, img:LV+"seul-au-monde-1-1920x1080-1.jpg" },
  { date:"2026-08-16", title:"Mia et le Migou",                           director:"Jacques-Rémy Girerd",                             year:"2008", version:"VF",    duration:"1h31",   jeune:true,  img:LV+"mia-1-scaled.jpg" },
  { date:"2026-08-16", title:"Moonrise Kingdom",                          director:"Wes Anderson",                                    year:"2012", version:"VOSTF", duration:"1h34",   jeune:false, img:LV+"moonrise-kingdom-scaled.webp" },
];

let activeTab     = "all";
let activeWindow  = "all";
let activeVersion = "all";
let activeSort    = "alpha";
let activeSortDir = "asc";
let activeView    = "list";
let currentDate   = "";

const SORT_LABELS = {
  alpha:      { asc: "A → Z",        desc: "Z → A"        },
  year:       { asc: "Année ↑",      desc: "Année ↓"       },
  letterboxd: { asc: "Letterboxd ↑", desc: "Letterboxd ↓"  },
};
const SORT_DEFAULT_DIR = { alpha: "asc", year: "desc", letterboxd: "desc" };
let watchlist     = [];
let moviesToday   = [];
let _searchToken  = 0;

let movieListEl, villetteListEl, watchlistEl, countLabelEl, searchEl;
let showtimeFiltersEl, sortBarEl, footerSourceEl, mapPanelEl, mapRailEl, layoutEl, watchlistHintEl;

const CINEMAS_URL = "cinemas.json";
let cinemaCoords  = {};
let cineMap       = null;
let cineClusterGroup = null;
let cineMarkers   = new Map();
let selectedCinema = null;
let userMarker    = null;
let mapTimeFilterMin = null;
const DEFAULT_RUNTIME_MIN = 150;

function initDropdown(rootEl, onSelect) {
  const trigger = rootEl.querySelector(".dd-trigger");
  const label = rootEl.querySelector(".dd-label");
  const menu = rootEl.querySelector(".dd-menu");
  const options = Array.from(menu.querySelectorAll(".dd-opt"));

  function close() {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }
  function open() {
    for (const other of document.querySelectorAll(".dd-menu")) {
      if (other !== menu) { other.hidden = true; }
    }
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
  }

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (menu.hidden) open(); else close();
  });

  for (const opt of options) {
    opt.addEventListener("click", () => {
      for (const o of options) o.setAttribute("aria-selected", "false");
      opt.setAttribute("aria-selected", "true");
      label.textContent = opt.textContent;
      rootEl.dataset.value = opt.dataset.value;
      close();
      onSelect(opt.dataset.value);
    });
  }

  document.addEventListener("click", (e) => {
    if (!rootEl.contains(e.target)) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) close();
  });
}

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function getMoviesForToday(date) {
  const cached = await storage.get(CACHE_KEY);
  const entry = cached[CACHE_KEY];
  if (entry && entry.date === date) return entry.movies;
  const res = await fetch(`${API_BASE}/get_movies.php?day=${date}`);
  if (!res.ok) throw new Error(`get_movies.php a répondu ${res.status}`);
  const json = await res.json();
  const movies = (json.data || []).slice().sort((a, b) => a.ti.localeCompare(b.ti, "fr"));
  await storage.set({ [CACHE_KEY]: { date, movies } });
  return movies;
}

async function getShowtimes(movieId) {
  const res = await fetch(`${API_BASE}/get_showtimes.php?mov_id=${movieId}`);
  if (!res.ok) throw new Error(`get_showtimes.php a répondu ${res.status}`);
  const json = await res.json();
  return (json.showtimes || [])
    .filter((s) => s.start)
    .sort((a, b) => a.start.localeCompare(b.start));
}

function ensureShowtimes(el, movieId) {
  if (!el._showtimesPromise) {
    el._showtimesPromise = getShowtimes(movieId)
      .then((showtimes) => { el._showtimes = showtimes; return showtimes; })
      .catch((err) => { el._showtimesPromise = null; throw err; });
  }
  return el._showtimesPromise;
}

async function mapWithConcurrency(items, limit, fn) {
  let i = 0;
  const workers = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (i < items.length) {
      const item = items[i++];
      await fn(item);
    }
  });
  await Promise.all(workers);
}

function createPosterImg(src, className) {
  const img = document.createElement("img");
  img.className = `${className} poster-loading`;
  img.loading = "lazy";
  img.alt = "";
  const clearLoading = () => img.classList.remove("poster-loading");
  img.addEventListener("load", clearLoading, { once: true });
  img.addEventListener("error", clearLoading, { once: true });
  img.src = src;
  return img;
}

function loadRowShowtimes(el, movieId, panel) {
  return ensureShowtimes(el, movieId)
    .then((showtimes) => renderDayTabs(panel, showtimes))
    .catch(() => {
      panel.innerHTML = '<ul class="showtimes"><li class="empty">Impossible de charger les séances.</li></ul>';
    });
}

function groupByDate(showtimes) {
  const map = {};
  for (const s of showtimes) {
    const d = s.start.slice(0, 10);
    if (!map[d]) map[d] = [];
    map[d].push(s);
  }
  return map;
}

function formatDayTab(date) {
  if (date === currentDate) return "Aujourd'hui";
  const d = new Date(date + "T12:00:00");
  const tom = new Date(); tom.setDate(tom.getDate() + 1);
  if (date === tom.toISOString().slice(0, 10)) return "Demain";
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
}

function renderDayTabs(panel, showtimes) {
  const byDate = groupByDate(showtimes);
  const dates = Object.keys(byDate).sort();
  panel.innerHTML = "";
  if (dates.length === 0) {
    panel.innerHTML = '<ul class="showtimes"><li class="empty">Pas de séance trouvée.</li></ul>';
    return;
  }
  const defaultDate = dates.includes(currentDate) ? currentDate : dates[0];
  const tabsDiv = document.createElement("div");
  tabsDiv.className = "day-tabs";
  const listEl = document.createElement("ul");
  listEl.className = "showtimes";
  for (const date of dates) {
    const btn = document.createElement("button");
    btn.className = "day-tab" + (date === defaultDate ? " active" : "");
    btn.dataset.date = date;
    btn.textContent = formatDayTab(date);
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.querySelector(".day-tab.active").classList.remove("active");
      btn.classList.add("active");
      renderShowtimesList(listEl, byDate[date]);
    });
    tabsDiv.appendChild(btn);
  }
  panel.appendChild(tabsDiv);
  panel.appendChild(listEl);
  renderShowtimesList(listEl, byDate[defaultDate]);
}

function showtimeMatchesFilters(s) {
  const matchesTime = activeWindow === "all" || (() => {
    const hour = parseInt(s.start.slice(11, 13), 10);
    const w = TIME_WINDOWS[activeWindow];
    return hour >= w.min && hour < w.max;
  })();
  const matchesVersion = activeVersion === "all"
    || (activeVersion === "vo" && s.type && /^VO/i.test(s.type))
    || (activeVersion === "vf" && (!s.type || /^VF/i.test(s.type)));
  return matchesTime && matchesVersion;
}

function countVisibleCinemas() {
  const cinemas = new Set();
  for (const li of movieListEl.children) {
    if (li.classList.contains("hidden") || li.classList.contains("time-hidden")) continue;
    if (!li._showtimes) continue;
    for (const s of li._showtimes) {
      if (!s.start.startsWith(currentDate)) continue;
      if ((activeWindow !== "all" || activeVersion !== "all") && !showtimeMatchesFilters(s)) continue;
      if (s.title) cinemas.add(s.title);
    }
  }
  return cinemas.size;
}

function updateCount() {
  let visible = 0;
  for (const li of movieListEl.children) {
    if (!li.classList.contains("hidden") && !li.classList.contains("time-hidden")) visible++;
  }
  const cinemaCount = countVisibleCinemas();
  const cinemaPart = cinemaCount > 0 ? ` · dans ${cinemaCount} cinéma${cinemaCount !== 1 ? "s" : ""}` : "";
  countLabelEl.textContent = `${visible} film${visible !== 1 ? "s" : ""} aujourd'hui${cinemaPart}`;

  const noResultsEl = document.getElementById("no-results");
  if (noResultsEl) {
    noResultsEl.classList.toggle("visible", visible === 0 && searchEl.value.trim() !== "");
  }
}

function removeEmptyMovieRow(li) {
  moviesToday = moviesToday.filter((m) => String(m.id) !== li.dataset.movieId);
  li.remove();
  const statCountEl = document.getElementById("stat-count");
  if (statCountEl) statCountEl.textContent = String(moviesToday.length);
  updateCount();
}

function buildShowtimeRow(s) {
  const time = s.start.slice(11, 16);
  const row = document.createElement("li");
  const link = document.createElement("a");
  link.href = s.book || API_BASE;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = `${time} — `;
  const theatreSpan = document.createElement("span");
  theatreSpan.className = "theatre";
  theatreSpan.textContent = s.title;
  link.appendChild(theatreSpan);
  row.appendChild(link);
  if (s.type) {
    const lang = document.createElement("span");
    lang.className = "lang-badge";
    lang.textContent = s.type;
    row.appendChild(lang);
  }
  return row;
}

function renderShowtimesList(showtimesEl, showtimes) {
  showtimesEl.innerHTML = "";
  const noFilter = activeWindow === "all" && activeVersion === "all";
  const filtered = noFilter ? showtimes : showtimes.filter(showtimeMatchesFilters);
  if (filtered.length === 0) {
    const emptyLi = document.createElement("li");
    emptyLi.className = "empty";
    emptyLi.textContent = noFilter ? "Pas de séance trouvée aujourd'hui." : "Pas de séance dans ce créneau.";
    showtimesEl.appendChild(emptyLi);
    return;
  }

  const hasOverflow = filtered.length > SHOWTIMES_REVEAL_COUNT;
  const shown = hasOverflow ? filtered.slice(0, SHOWTIMES_REVEAL_COUNT) : filtered;
  for (const s of shown) showtimesEl.appendChild(buildShowtimeRow(s));

  if (hasOverflow) {
    const hidden = filtered.slice(SHOWTIMES_REVEAL_COUNT);
    const moreLi = document.createElement("li");
    moreLi.className = "showtimes-more";
    const moreBtn = document.createElement("button");
    moreBtn.type = "button";
    moreBtn.className = "showtimes-more-btn";
    moreBtn.textContent = `Voir ${hidden.length} séance${hidden.length !== 1 ? "s" : ""} de plus`;
    moreBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      moreLi.remove();
      for (const s of hidden) showtimesEl.appendChild(buildShowtimeRow(s));
    });
    moreLi.appendChild(moreBtn);
    showtimesEl.appendChild(moreLi);
  }
}

function refreshOpenShowtimes() {
  for (const li of movieListEl.children) {
    const panel = li.querySelector(".showtime-panel.open");
    if (!panel || !li._showtimes) continue;
    const activeTab = panel.querySelector(".day-tab.active");
    if (!activeTab) continue;
    const byDate = groupByDate(li._showtimes);
    const listEl = panel.querySelector(".showtimes");
    if (listEl) renderShowtimesList(listEl, byDate[activeTab.dataset.date] || []);
  }
}

// ── Watchlist ─────────────────────────────────────────────────────────────────

function isBookmarked(movieId) {
  return watchlist.some((m) => m.id === movieId);
}

async function toggleBookmark(movie, btn) {
  const idx = watchlist.findIndex((m) => m.id === movie.id);
  if (idx >= 0) {
    watchlist.splice(idx, 1);
    btn.textContent = "♡";
    btn.title = "Ajouter à Ma liste";
    btn.classList.remove("bookmarked");
  } else {
    watchlist.push({ id: movie.id, ti: movie.ti, o_ti: movie.o_ti || "", di: movie.di || "", ye: movie.ye || "", lb_r: movie.lb_r || "", savedAt: currentDate });
    btn.textContent = "♥";
    btn.title = "Retirer de Ma liste";
    btn.classList.add("bookmarked");
  }
  await storage.set({ [WATCHLIST_KEY]: watchlist });
  updateWatchlistTab();
  renderRailWatchlistToday(moviesToday);
}

function updateWatchlistTab() {
  const btn = document.querySelector('[data-tab="watchlist"]');
  if (!btn) return;
  btn.textContent = watchlist.length > 0 ? `Ma liste (${watchlist.length})` : "Ma liste";
}


function renderWatchlist() {
  watchlistEl.innerHTML = "";
  if (watchlist.length === 0) {
    const empty = document.createElement("div");
    empty.className = "watchlist-empty";
    empty.textContent = "Aucun film épinglé. Cliquez sur ♡ dans la liste pour ajouter un film.";
    watchlistEl.appendChild(empty);
    countLabelEl.textContent = "0 film épinglé";
    return;
  }
  const toLoad = [];
  for (const m of [...watchlist].reverse()) {
    const div = document.createElement("div");
    div.className = "watchlist-entry";
    div.dataset.title = m.ti || "";
    div.dataset.year  = m.ye ? String(m.ye) : "0";
    div.dataset.rating = m.lb_r ? String(m.lb_r) : "0";
    div._showtimes = null;

    const poster = createPosterImg(`${API_BASE}/get_poster.php?id=${m.id}`, "poster");
    div.appendChild(poster);

    const main = document.createElement("div");
    main.className = "watchlist-main";

    const info = document.createElement("div");
    info.className = "watchlist-info";

    const titleLine = document.createElement("div");
    titleLine.className = "watchlist-title";
    const titleText = document.createElement("span");
    titleText.textContent = m.ti;
    titleLine.appendChild(titleText);
    if (m.lb_r) {
      const badge = document.createElement("span");
      badge.className = "movie-rating";
      badge.textContent = `★ ${m.lb_r}`;
      titleLine.appendChild(badge);
    }
    const removeBtn = document.createElement("button");
    removeBtn.className = "watchlist-remove";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      watchlist = watchlist.filter((x) => x.id !== m.id);
      await storage.set({ [WATCHLIST_KEY]: watchlist });
      const bookmarkBtn = movieListEl.querySelector(`[data-bookmark-id="${m.id}"]`);
      if (bookmarkBtn) { bookmarkBtn.textContent = "♡"; bookmarkBtn.title = "Ajouter à Ma liste"; bookmarkBtn.classList.remove("bookmarked"); }
      updateWatchlistTab();
      renderRailWatchlistToday(moviesToday);
      renderWatchlist();
    });
    titleLine.appendChild(removeBtn);
    info.appendChild(titleLine);

    if (m.o_ti && m.o_ti !== m.ti) {
      const original = document.createElement("div");
      original.className = "watchlist-original";
      original.textContent = m.o_ti;
      info.appendChild(original);
    }
    const meta = document.createElement("div");
    meta.className = "watchlist-meta";
    meta.textContent = [m.di, m.ye].filter(Boolean).join(" · ");
    info.appendChild(meta);

    const savedDate = document.createElement("div");
    savedDate.className = "watchlist-saved";
    savedDate.textContent = `Épinglé le ${new Date(m.savedAt + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`;
    info.appendChild(savedDate);
    main.appendChild(info);

    const panel = document.createElement("div");
    panel.className = "showtime-panel open";
    panel.innerHTML = '<ul class="showtimes"><li class="loading">Chargement des séances…</li></ul>';
    main.appendChild(panel);
    div.appendChild(main);

    toLoad.push(() => loadRowShowtimes(div, m.id, panel));
    watchlistEl.appendChild(div);
  }
  countLabelEl.textContent = `${watchlist.length} film${watchlist.length !== 1 ? "s" : ""} épinglé${watchlist.length !== 1 ? "s" : ""}`;
  sortWatchlistEntries();
  mapWithConcurrency(toLoad, 6, (load) => load());
}

// ── Movie rows ────────────────────────────────────────────────────────────────

function buildMovieRow(movie) {
  const li = document.createElement("li");
  li.className = "movie";
  li.dataset.year = movie.ye ? String(movie.ye) : "";
  li.dataset.movieId = String(movie.id);
  li.dataset.title = movie.ti || "";
  li.dataset.rating = movie.lb_r ? String(movie.lb_r) : "0";
  li.dataset.genres = movie.ge || "";
  li.dataset.duration = movie.du || "";
  li._showtimes = null;

  const img = createPosterImg(`${API_BASE}/get_poster.php?id=${movie.id}`, "poster");
  li.appendChild(img);

  const main = document.createElement("div");
  main.className = "movie-main";

  const info = document.createElement("div");
  info.className = "movie-info";

  const titleDiv = document.createElement("div");
  titleDiv.className = "movie-title";
  const titleText = document.createElement("span");
  titleText.textContent = movie.ti;
  titleDiv.appendChild(titleText);

  if (movie.lb_r) {
    const badge = document.createElement("span");
    badge.className = "movie-rating";
    badge.textContent = `★ ${movie.lb_r}`;
    titleDiv.appendChild(badge);
  }

  const bookmarkBtn = document.createElement("button");
  bookmarkBtn.className = "bookmark-btn" + (isBookmarked(movie.id) ? " bookmarked" : "");
  bookmarkBtn.textContent = isBookmarked(movie.id) ? "♥" : "♡";
  bookmarkBtn.title = isBookmarked(movie.id) ? "Retirer de Ma liste" : "Ajouter à Ma liste";
  bookmarkBtn.dataset.bookmarkId = String(movie.id);
  bookmarkBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleBookmark(movie, bookmarkBtn);
  });
  titleDiv.appendChild(bookmarkBtn);
  info.appendChild(titleDiv);

  if (movie.o_ti && movie.o_ti !== movie.ti) {
    const original = document.createElement("div");
    original.className = "movie-original-title";
    original.textContent = movie.o_ti;
    info.appendChild(original);
  }

  const meta = document.createElement("div");
  meta.className = "movie-meta";
  meta.textContent = [movie.di, movie.du, movie.ye].filter(Boolean).join(" · ");
  info.appendChild(meta);

  if (movie.ge) {
    const genresDiv = document.createElement("div");
    genresDiv.className = "movie-genres";
    for (const code of movie.ge.split(",")) {
      const label = GENRES[code] || code;
      const tag = document.createElement("button");
      tag.type = "button";
      tag.className = "genre-tag";
      tag.textContent = `#${label}`;
      tag.addEventListener("click", (e) => {
        e.stopPropagation();
        searchEl.value = label;
        searchEl.dispatchEvent(new Event("input", { bubbles: true }));
        searchEl.focus();
      });
      genresDiv.appendChild(tag);
    }
    info.appendChild(genresDiv);
  }
  main.appendChild(info);

  const panel = document.createElement("div");
  panel.className = "showtime-panel open";
  panel.innerHTML = '<ul class="showtimes"><li class="loading">Chargement des séances…</li></ul>';
  main.appendChild(panel);
  li.appendChild(main);
  li._loadShowtimes = () => loadRowShowtimes(li, movie.id, panel);

  return li;
}

// ── Filters ───────────────────────────────────────────────────────────────────

function updateSortBtns() {
  for (const btn of document.querySelectorAll(".sort-btn")) {
    const sort = btn.dataset.sort;
    const dir = sort === activeSort ? activeSortDir : SORT_DEFAULT_DIR[sort];
    btn.textContent = SORT_LABELS[sort][dir];
  }
}

function sortWatchlistEntries() {
  const items = Array.from(watchlistEl.querySelectorAll(".watchlist-entry"));
  const dir = activeSortDir === "asc" ? 1 : -1;
  items.sort((a, b) => {
    if (activeSort === "alpha") return dir * a.dataset.title.localeCompare(b.dataset.title, "fr");
    if (activeSort === "year")  return dir * ((parseInt(a.dataset.year, 10) || 0) - (parseInt(b.dataset.year, 10) || 0));
    if (activeSort === "letterboxd") return dir * ((parseFloat(a.dataset.rating) || 0) - (parseFloat(b.dataset.rating) || 0));
    return 0;
  });
  for (const item of items) watchlistEl.appendChild(item);
}

function sortMovieList() {
  const items = Array.from(movieListEl.children);
  const dir = activeSortDir === "asc" ? 1 : -1;
  items.sort((a, b) => {
    if (activeSort === "alpha") {
      return dir * a.dataset.title.localeCompare(b.dataset.title, "fr");
    }
    if (activeSort === "year") {
      return dir * ((parseInt(a.dataset.year, 10) || 0) - (parseInt(b.dataset.year, 10) || 0));
    }
    if (activeSort === "letterboxd") {
      return dir * ((parseFloat(a.dataset.rating) || 0) - (parseFloat(b.dataset.rating) || 0));
    }
    return 0;
  });
  for (const item of items) movieListEl.appendChild(item);
}

async function applyFilters() {
  const token = ++_searchToken;
  const q = searchEl.value.trim().toLowerCase();

  for (const li of movieListEl.children) {
    const movieYear = parseInt(li.dataset.year, 10);
    const yearMatch = activeTab === "all" || (activeTab === "cultes" && movieYear <= CULTES_CUTOFF);
    li.classList.toggle("hidden", !yearMatch);
  }

  if (q === "") {
    updateCount();
    if (activeWindow !== "all" || activeVersion !== "all") applyShowtimeFilters();
    return;
  }

  const toCheckCinema = [];
  for (const li of movieListEl.children) {
    if (li.classList.contains("hidden")) continue;
    const inTitle = li.dataset.title.toLowerCase().includes(q);
    const inMeta  = li.querySelector(".movie-meta")?.textContent.toLowerCase().includes(q) ?? false;
    const inGenre = (li.dataset.genres || "").split(",").some((code) => (GENRES[code] || code).toLowerCase().includes(q));
    if (!inTitle && !inMeta && !inGenre) {
      li.classList.add("hidden");
      toCheckCinema.push(li);
    }
  }

  updateCount();

  if (toCheckCinema.length > 0) {
    await Promise.all(toCheckCinema.map(async (li) => {
      try {
        const showtimes = li._showtimes || await ensureShowtimes(li, li.dataset.movieId);
        if (token !== _searchToken) return;
        if (showtimes.some((s) => s.title?.toLowerCase().includes(q))) {
          li.classList.remove("hidden");
          updateCount();
        }
      } catch { /* reste caché */ }
    }));
  }

  if (token !== _searchToken) return;
  if (activeWindow !== "all" || activeVersion !== "all") applyShowtimeFilters();
}

async function applyShowtimeFilters() {
  const noFilter = activeWindow === "all" && activeVersion === "all";
  if (noFilter) {
    for (const li of movieListEl.children) li.classList.remove("time-hidden");
    refreshOpenShowtimes();
    updateCount();
    return;
  }
  const toFetch = [];
  for (const li of movieListEl.children) {
    if (li.classList.contains("hidden")) { li.classList.remove("time-hidden"); continue; }
    if (li._showtimes !== null) {
      const today = li._showtimes.filter(s => s.start.startsWith(currentDate));
      li.classList.toggle("time-hidden", !today.some(showtimeMatchesFilters));
    } else {
      toFetch.push(li);
    }
  }
  updateCount();
  if (toFetch.length > 0) {
    await Promise.all(toFetch.map((li) =>
      ensureShowtimes(li, li.dataset.movieId)
        .then((showtimes) => {
          const today = showtimes.filter(s => s.start.startsWith(currentDate));
          li.classList.toggle("time-hidden", !today.some(showtimeMatchesFilters));
          updateCount();
        })
        .catch(() => li.classList.remove("time-hidden"))
    ));
  }
  refreshOpenShowtimes();
}

// ── Villette tab ──────────────────────────────────────────────────────────────

function formatVilletteDate(iso) {
  return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function renderVilletteList() {
  const q = searchEl.value.trim().toLowerCase();
  villetteListEl.innerHTML = "";
  const entries = VILLETTE_PROGRAM.filter(
    (f) => q === "" || f.title.toLowerCase().includes(q) || f.director.toLowerCase().includes(q)
  );
  let lastDate = null;
  for (const f of entries) {
    if (f.date !== lastDate) {
      lastDate = f.date;
      const sep = document.createElement("div");
      sep.className = "villette-date"
        + (f.date < currentDate ? " past" : f.date === currentDate ? " today" : "");
      sep.textContent = f.date === currentDate
        ? "Aujourd'hui — " + formatVilletteDate(f.date)
        : formatVilletteDate(f.date);
      villetteListEl.appendChild(sep);
    }
    const div = document.createElement("div");
    div.className = "villette-entry" + (f.date < currentDate ? " past" : "");
    const poster = createPosterImg(f.img, "villette-poster");
    div.appendChild(poster);
    const info = document.createElement("div");
    info.className = "villette-info";
    const titleLine = document.createElement("div");
    titleLine.className = "villette-title";
    const titleLink = document.createElement("a");
    titleLink.href = VILLETTE_INFO_URL;
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";
    titleLink.textContent = `${f.title} (${f.year})`;
    titleLine.appendChild(titleLink);
    if (f.jeune) {
      const badge = document.createElement("span");
      badge.className = "villette-badge";
      badge.textContent = "Jeune public";
      titleLine.appendChild(badge);
    }
    info.appendChild(titleLine);
    const meta = document.createElement("div");
    meta.className = "villette-meta";
    meta.textContent = [f.jeune ? "18h00" : "21h00", f.director, f.version, f.duration].filter(Boolean).join(" · ");
    info.appendChild(meta);
    div.appendChild(info);
    villetteListEl.appendChild(div);
  }
  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.style.cssText = "padding:20px 12px;color:#888;font-style:italic;font-size:12px;";
    empty.textContent = "Aucune séance trouvée.";
    villetteListEl.appendChild(empty);
  }
  countLabelEl.textContent = `${entries.length} séance${entries.length !== 1 ? "s" : ""} · Prairie du triangle · Gratuit`;
}

// ── Rail (colonne latérale) ─────────────────────────────────────────────────

function openMovieFromRail(movieId) {
  const allTabBtn = document.querySelector('.tab[data-tab="all"]');
  if (activeTab !== "all" && allTabBtn) allTabBtn.click();
  if (searchEl.value.trim() !== "") {
    searchEl.value = "";
    applyFilters();
  }
  const target = movieListEl.querySelector(`[data-movie-id="${movieId}"]`);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderRailFeature(movies) {
  const block = document.getElementById("rail-feature-block");
  const el = document.getElementById("rail-feature");
  const rated = movies.filter((m) => m.lb_r);
  if (rated.length === 0) {
    block.style.display = "none";
    return;
  }
  const top3 = rated
    .slice()
    .sort((a, b) => parseFloat(b.lb_r) - parseFloat(a.lb_r))
    .slice(0, 3);
  el.innerHTML = "";
  for (const m of top3) {
    const item = document.createElement("div");
    item.className = "rail-feat-item";
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    const img = createPosterImg(`${API_BASE}/get_poster.php?id=${m.id}`, "rail-feat-poster");
    item.appendChild(img);
    const body = document.createElement("div");
    body.className = "rail-feat-body";
    const title = document.createElement("div");
    title.className = "rail-feat-title";
    title.textContent = m.ti;
    body.appendChild(title);
    const meta = document.createElement("div");
    meta.className = "rail-feat-meta";
    meta.textContent = [`★ ${m.lb_r}`, m.di].filter(Boolean).join(" · ");
    body.appendChild(meta);
    item.appendChild(body);
    item.onclick = () => openMovieFromRail(m.id);
    item.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openMovieFromRail(m.id); }
    };
    el.appendChild(item);
  }
}

function renderRailWatchlistToday(movies) {
  const block = document.getElementById("rail-watchlist-block");
  const countEl = document.getElementById("rail-watchlist-count");
  const el = document.getElementById("rail-watchlist-today");
  const todayIds = new Set(movies.map((m) => String(m.id)));
  const matches = watchlist.filter((w) => todayIds.has(String(w.id)));
  if (matches.length === 0) {
    block.style.display = "none";
    return;
  }
  block.style.display = "";
  countEl.textContent = matches.length === 1
    ? "1 film de votre liste passe aujourd'hui"
    : `${matches.length} films de votre liste passent aujourd'hui`;
  el.innerHTML = "";
  for (const m of matches) {
    const item = document.createElement("div");
    item.className = "rail-watchlist-item";
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.textContent = m.ti;
    item.onclick = () => openMovieFromRail(m.id);
    item.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openMovieFromRail(m.id); }
    };
    el.appendChild(item);
  }
}

function renderRailVillette() {
  const block = document.getElementById("rail-villette-block");
  const el = document.getElementById("rail-villette");
  const upcoming = VILLETTE_PROGRAM.filter((f) => f.date >= currentDate).slice(0, 5);
  if (upcoming.length === 0) {
    block.style.display = "none";
    return;
  }
  el.innerHTML = "";
  for (const f of upcoming) {
    const link = document.createElement("a");
    link.className = "rail-villette-item";
    link.href = VILLETTE_INFO_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    const d = new Date(f.date + "T12:00:00");
    const dateStr = d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    const title = document.createElement("div");
    title.className = "t";
    title.textContent = `${f.title} (${f.year})`;
    const meta = document.createElement("span");
    meta.className = "d";
    meta.textContent = `La Villette · ${dateStr} · ${f.jeune ? "18h00" : "21h00"}`;
    link.appendChild(title);
    link.appendChild(meta);
    el.appendChild(link);
  }
}

// ── View toggle (list / grid) ────────────────────────────────────────────────

function setView(view) {
  activeView = view;
  for (const btn of document.querySelectorAll(".view-btn")) {
    btn.classList.toggle("active", btn.dataset.view === view);
  }
  movieListEl.classList.toggle("grid-view", view === "grid");
  watchlistEl.classList.toggle("grid-view", view === "grid");
}

// ── Scroll to top ─────────────────────────────────────────────────────────────

let backToTopBtn;

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateBackToTopVisibility() {
  backToTopBtn.classList.toggle("visible", window.scrollY > 200);
}

// ── Tab switching ─────────────────────────────────────────────────────────────

function showOnlyList(activeEl) {
  for (const el of [movieListEl, villetteListEl, watchlistEl]) {
    el.classList.toggle("tab-active", el === activeEl);
  }
}

function switchToMovieTab() {
  showOnlyList(movieListEl);
  showtimeFiltersEl.style.display = "";
  sortBarEl.style.display = "";
  watchlistHintEl.style.display = "none";
  footerSourceEl.innerHTML = 'données non officielles <a href="https://www.paris-cine.info" target="_blank" rel="noopener">paris-cine.info</a>';
  applyFilters();
  syncMobileTabPlacement();
}

function switchToVilletteTab() {
  showOnlyList(villetteListEl);
  showtimeFiltersEl.style.display = "none";
  sortBarEl.style.display = "none";
  watchlistHintEl.style.display = "none";
  footerSourceEl.innerHTML = '<a href="https://www.lavillette.com/manifestations/cinema-en-plein-air-26/" target="_blank" rel="noopener">lavillette.com</a>';
  renderVilletteList();
  syncMobileTabPlacement();
}

function switchToWatchlistTab() {
  showOnlyList(watchlistEl);
  showtimeFiltersEl.style.display = "none";
  sortBarEl.style.display = "";
  watchlistHintEl.style.display = "block";
  footerSourceEl.innerHTML = 'données non officielles <a href="https://www.paris-cine.info" target="_blank" rel="noopener">paris-cine.info</a>';
  renderWatchlist();
  syncMobileTabPlacement();
}

function switchToMapTab() {
  showOnlyList(null);
  showtimeFiltersEl.style.display = "";
  sortBarEl.style.display = "none";
  watchlistHintEl.style.display = "none";
  syncMobileTabPlacement();
}

function switchToMarathonTab() {
  showOnlyList(null);
  showtimeFiltersEl.style.display = "none";
  sortBarEl.style.display = "none";
  watchlistHintEl.style.display = "none";
  syncMobileTabPlacement();
}

function syncMobileTabPlacement() {
  syncMapPlacement();
  syncMarathonPlacement();
}

function syncMapPlacement() {
  if (!mapRailEl) return;
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  const showOnMobile = isMobile && activeTab === "map";
  mapRailEl.classList.toggle("tab-active", showOnMobile);

  if (showOnMobile) {
    if (mapRailEl.nextElementSibling !== movieListEl) {
      movieListEl.parentElement.insertBefore(mapRailEl, movieListEl);
    }
    if (cineMap) setTimeout(() => cineMap.invalidateSize(), 50);
  } else if (mapRailEl.parentElement !== layoutEl) {
    layoutEl.appendChild(mapRailEl);
    if (cineMap) setTimeout(() => cineMap.invalidateSize(), 50);
  }
}

function syncMarathonPlacement() {
  const marathonBlockEl = document.getElementById("marathon-block");
  if (!marathonBlockEl || !mapRailEl || !mapPanelEl) return;
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  const showOnMobile = isMobile && activeTab === "marathon";
  marathonBlockEl.classList.toggle("tab-active", showOnMobile);

  if (showOnMobile) {
    if (marathonBlockEl.nextElementSibling !== movieListEl) {
      movieListEl.parentElement.insertBefore(marathonBlockEl, movieListEl);
    }
  } else if (marathonBlockEl.parentElement !== mapRailEl) {
    mapRailEl.insertBefore(marathonBlockEl, mapPanelEl);
  }
}

// ── Carte des cinémas ───────────────────────────────────────────────────────

async function loadCinemaCoords() {
  try {
    const res = await fetch(CINEMAS_URL);
    if (!res.ok) throw new Error(`cinemas.json a répondu ${res.status}`);
    cinemaCoords = await res.json();
  } catch {
    cinemaCoords = {};
  }
}

function initCineMap() {
  if (cineMap || typeof L === "undefined") return;
  const mapEl = document.getElementById("cine-map");
  if (!mapEl) return;
  cineMap = L.map(mapEl, { scrollWheelZoom: true, zoomControl: true }).setView([48.8566, 2.3522], 11.5);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
    attribution: '© OpenStreetMap contributors © <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  }).addTo(cineMap);

  fetch("arrondissements.geojson")
    .then((res) => res.json())
    .then((geojson) => {
      L.geoJSON(geojson, {
        style: { color: "#4f8f80", weight: 1.2, opacity: 0.55, fill: false },
        interactive: false,
      }).addTo(cineMap);
    })
    .catch(() => {});

  cineClusterGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 60,
    iconCreateFunction: (cluster) => L.divIcon({
      className: "cine-cluster",
      html: `<span>${cluster.getChildCount()}</span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    }),
  });
  cineMap.addLayer(cineClusterGroup);
}

const CHAIN_PREFIXES = ["UGC", "Pathé", "MK2", "CGR"];

function isChainCinema(name) {
  return CHAIN_PREFIXES.some((p) => name.startsWith(p));
}

function cinePinIcon(count, name) {
  const indep = !isChainCinema(name);
  return L.divIcon({
    className: "cine-pin" + (indep ? " cine-pin-indep" : ""),
    html: `<span>${count}</span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function buildCinemaAggregation() {
  const byCinema = new Map();
  for (const li of movieListEl.children) {
    if (!li._showtimes) continue;
    if (activeTab === "cultes" && !(parseInt(li.dataset.year, 10) <= CULTES_CUTOFF)) continue;
    const movieTitle = li.dataset.title;
    for (const s of li._showtimes) {
      if (!s.title || !s.start) continue;
      if (!showtimeMatchesFilters(s)) continue;
      if (!byCinema.has(s.title)) byCinema.set(s.title, { today: 0, byDate: {} });
      const entry = byCinema.get(s.title);
      const date = s.start.slice(0, 10);
      if (date === currentDate) entry.today++;
      if (!entry.byDate[date]) entry.byDate[date] = [];
      entry.byDate[date].push({
        time: s.start.slice(11, 16), movieTitle, type: s.type, book: s.book,
        durationMin: parseDurationMinutes(li.dataset.duration),
      });
    }
  }
  return byCinema;
}

function sessionActiveAtMinute(item, minute) {
  const [hh, mm] = item.time.split(":").map(Number);
  const start = hh * 60 + mm;
  const duration = item.durationMin || DEFAULT_RUNTIME_MIN;
  return minute >= start && minute <= start + duration;
}

function updateCineMapMarkers() {
  if (!cineMap || !cineClusterGroup) return;
  const byCinema = buildCinemaAggregation();

  for (const [name, coords] of Object.entries(cinemaCoords)) {
    const entry = byCinema.get(name);
    let activeSessions = null;
    let count = entry ? entry.today : 0;
    if (entry && mapTimeFilterMin !== null) {
      activeSessions = (entry.byDate[currentDate] || []).filter((it) => sessionActiveAtMinute(it, mapTimeFilterMin));
      count = activeSessions.length;
    }
    if (count === 0) {
      const existing = cineMarkers.get(name);
      if (existing) { cineClusterGroup.removeLayer(existing); cineMarkers.delete(name); }
      continue;
    }
    let marker = cineMarkers.get(name);
    if (!marker) {
      marker = L.marker([coords.lat, coords.lon], { icon: cinePinIcon(count, name) });
      marker.on("click", () => { selectedCinema = name; renderCinemaPanel(name); });
      cineMarkers.set(name, marker);
      cineClusterGroup.addLayer(marker);
    } else {
      marker.setIcon(cinePinIcon(count, name));
    }
    const tooltip = activeSessions && activeSessions.length
      ? `${name} — ${activeSessions.map((s) => s.movieTitle).join(", ")}`
      : name;
    marker.bindTooltip(tooltip);
  }

  if (selectedCinema) renderCinemaPanel(selectedCinema);
}

// ── Filtre horaire sur la carte ─────────────────────────────────────────────

function formatSliderTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function roundedNowMinutes() {
  const now = new Date();
  const min = Math.round((now.getHours() * 60 + now.getMinutes()) / 15) * 15;
  return Math.min(1439, Math.max(600, min));
}

function initMapTimeFilter() {
  const toggle = document.getElementById("map-time-toggle");
  const row = document.getElementById("map-time-slider-row");
  const slider = document.getElementById("map-time-slider");
  const valueEl = document.getElementById("map-time-slider-value");
  if (!toggle || !row || !slider || !valueEl) return;

  slider.value = String(roundedNowMinutes());
  valueEl.textContent = formatSliderTime(Number(slider.value));

  toggle.addEventListener("click", () => {
    const next = toggle.getAttribute("aria-pressed") !== "true";
    toggle.setAttribute("aria-pressed", String(next));
    toggle.classList.toggle("active", next);
    row.hidden = !next;
    mapTimeFilterMin = next ? Number(slider.value) : null;
    updateCineMapMarkers();
  });

  slider.addEventListener("input", () => {
    valueEl.textContent = formatSliderTime(Number(slider.value));
    if (toggle.getAttribute("aria-pressed") === "true") {
      mapTimeFilterMin = Number(slider.value);
      updateCineMapMarkers();
    }
  });
}

// ── Géolocalisation « autour de moi » ───────────────────────────────────────

function userLocationIcon() {
  return L.divIcon({ className: "user-loc-pin", html: "<span></span>", iconSize: [14, 14], iconAnchor: [7, 7] });
}

function nearestCinemas(lat, lon, limit = 5) {
  return Object.entries(cinemaCoords)
    .map(([name, coords]) => ({ name, coords, distKm: haversineKm(lat, lon, coords.lat, coords.lon) }))
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, limit);
}

function renderNearbyPanel(lat, lon) {
  const nearest = nearestCinemas(lat, lon, 5);
  mapPanelEl.innerHTML = "";

  const title = document.createElement("p");
  title.className = "map-panel-title";
  title.textContent = "Cinémas les plus proches";
  mapPanelEl.appendChild(title);

  const list = document.createElement("ul");
  list.className = "nearby-list";
  for (const n of nearest) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nearby-btn";
    const distLabel = n.distKm < 1 ? `${Math.round(n.distKm * 1000)} m` : `${n.distKm.toFixed(1)} km`;
    const nameSpan = document.createElement("span");
    nameSpan.className = "nearby-name";
    nameSpan.textContent = n.name;
    const distSpan = document.createElement("span");
    distSpan.className = "nearby-dist";
    distSpan.textContent = distLabel;
    btn.appendChild(nameSpan);
    btn.appendChild(distSpan);
    btn.addEventListener("click", () => {
      selectedCinema = n.name;
      cineMap.setView([n.coords.lat, n.coords.lon], 15);
      renderCinemaPanel(n.name);
    });
    li.appendChild(btn);
    list.appendChild(li);
  }
  mapPanelEl.appendChild(list);
}

function initGeoloc() {
  const btn = document.getElementById("geoloc-btn");
  const statusEl = document.getElementById("geoloc-status");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      if (statusEl) statusEl.textContent = "Géolocalisation non disponible sur ce navigateur.";
      return;
    }
    btn.disabled = true;
    btn.textContent = "📍 Localisation…";
    if (statusEl) statusEl.textContent = "";

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        btn.disabled = false;
        btn.textContent = "📍 Autour de moi";
        if (!userMarker) {
          userMarker = L.marker([latitude, longitude], { icon: userLocationIcon(), zIndexOffset: 1000 }).addTo(cineMap);
          userMarker.bindTooltip("Vous êtes ici");
        } else {
          userMarker.setLatLng([latitude, longitude]);
        }
        cineMap.setView([latitude, longitude], 14);
        selectedCinema = null;
        renderNearbyPanel(latitude, longitude);
      },
      (err) => {
        btn.disabled = false;
        btn.textContent = "📍 Autour de moi";
        if (statusEl) {
          statusEl.textContent = err.code === err.PERMISSION_DENIED
            ? "Position refusée — autorisez la géolocalisation pour voir les cinémas proches."
            : "Impossible de récupérer votre position.";
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
}

// ── Idée de marathon ────────────────────────────────────────────────────────

function parseDurationMinutes(du) {
  if (!du) return null;
  const hMatch = du.match(/(\d+)\s*h/);
  const remainder = hMatch ? du.slice(du.indexOf(hMatch[0]) + hMatch[0].length) : du;
  const mMatch = remainder.match(/(\d+)/);
  if (!hMatch && !mMatch) return null;
  return (hMatch ? parseInt(hMatch[1], 10) : 0) * 60 + (mMatch ? parseInt(mMatch[1], 10) : 0);
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MARATHON_MAX_WALK_KM = 1.2;
const MARATHON_MIN_GAP = 5;
const MARATHON_MAX_GAP = 90;

const MARATHON_TIME_WINDOWS = [
  { min: 0, max: 719 },    // matin : avant 12h00
  { min: 720, max: 1079 }, // après-midi : 12h00–17h59
  { min: 1080, max: 1439 }, // soir : 18h00+
];

function marathonComboKey(combo) {
  return `${combo.a.cinema}|${combo.a.time}|${combo.b.cinema}|${combo.b.time}`;
}

function computeMarathonCombos() {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const sessions = [];
  for (const li of movieListEl.children) {
    if (!li._showtimes) continue;
    const durationMin = parseDurationMinutes(li.dataset.duration);
    if (!durationMin) continue;
    for (const s of li._showtimes) {
      if (!s.start || !s.title || !s.start.startsWith(currentDate)) continue;
      if (!cinemaCoords[s.title]) continue;
      const [hh, mm] = s.start.slice(11, 16).split(":").map(Number);
      const startMin = hh * 60 + mm;
      if (startMin < nowMin) continue;
      sessions.push({ cinema: s.title, movieTitle: li.dataset.title, time: s.start.slice(11, 16), book: s.book, startMin, endMin: startMin + durationMin });
    }
  }

  const all = [];
  for (const a of sessions) {
    for (const b of sessions) {
      if (a.cinema === b.cinema) continue;
      const gap = b.startMin - a.endMin;
      if (gap < MARATHON_MIN_GAP || gap > MARATHON_MAX_GAP) continue;
      const coordsA = cinemaCoords[a.cinema];
      const coordsB = cinemaCoords[b.cinema];
      const distKm = haversineKm(coordsA.lat, coordsA.lon, coordsB.lat, coordsB.lon);
      if (distKm > MARATHON_MAX_WALK_KM) continue;
      const walkMin = Math.max(1, Math.round((distKm / 5) * 60));
      if (gap < walkMin + MARATHON_MIN_GAP) continue;
      all.push({ a, b, walkMin, gap });
    }
  }
  if (all.length === 0) return [];

  all.sort((x, y) => x.gap - y.gap);

  const picked = [];
  const usedKeys = new Set();
  for (const w of MARATHON_TIME_WINDOWS) {
    const match = all.find((c) => c.a.startMin >= w.min && c.a.startMin <= w.max && !usedKeys.has(marathonComboKey(c)));
    if (match) { picked.push(match); usedKeys.add(marathonComboKey(match)); }
  }
  for (const c of all) {
    if (picked.length >= 3) break;
    const key = marathonComboKey(c);
    if (!usedKeys.has(key)) { picked.push(c); usedKeys.add(key); }
  }

  return picked.slice(0, 3).sort((x, y) => x.a.startMin - y.a.startMin);
}

function renderMarathonBlock() {
  const block = document.getElementById("marathon-block");
  const content = document.getElementById("marathon-content");
  if (!block || !content) return;
  const combos = computeMarathonCombos();
  block.classList.toggle("has-combo", combos.length > 0);
  if (combos.length === 0) return;
  content.innerHTML = "";

  function buildLeg(leg) {
    const div = document.createElement("div");
    div.className = "marathon-leg";
    const film = document.createElement("a");
    film.className = "marathon-film";
    film.href = leg.book || API_BASE;
    film.target = "_blank";
    film.rel = "noopener noreferrer";
    film.textContent = leg.movieTitle;
    const meta = document.createElement("div");
    meta.className = "marathon-meta";
    meta.textContent = `${leg.cinema} · ${leg.time}`;
    div.appendChild(film);
    div.appendChild(meta);
    return div;
  }

  for (const combo of combos) {
    const card = document.createElement("div");
    card.className = "marathon-combo";
    card.appendChild(buildLeg(combo.a));
    const walk = document.createElement("div");
    walk.className = "marathon-walk";
    walk.textContent = `${combo.walkMin} min à pied`;
    card.appendChild(walk);
    card.appendChild(buildLeg(combo.b));
    content.appendChild(card);
  }
}

function formatPanelDate(date) {
  if (date === currentDate) return "Aujourd'hui";
  const d = new Date(date + "T12:00:00");
  const tom = new Date(); tom.setDate(tom.getDate() + 1);
  if (date === tom.toISOString().slice(0, 10)) return "Demain";
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

function renderCinemaPanel(name) {
  const byCinema = buildCinemaAggregation();
  const entry = byCinema.get(name);
  mapPanelEl.innerHTML = "";

  const title = document.createElement("p");
  title.className = "map-panel-title";
  title.textContent = name;
  mapPanelEl.appendChild(title);

  if (!entry || Object.keys(entry.byDate).length === 0) {
    const empty = document.createElement("p");
    empty.className = "map-panel-empty";
    empty.textContent = "Pas de séance trouvée pour ce cinéma.";
    mapPanelEl.appendChild(empty);
    return;
  }

  const dates = Object.keys(entry.byDate).sort();
  const defaultDate = dates.includes(currentDate) ? currentDate : dates[0];

  const tabsDiv = document.createElement("div");
  tabsDiv.className = "day-tabs";
  const listEl = document.createElement("ul");
  listEl.className = "showtimes";

  function renderList(date) {
    listEl.innerHTML = "";
    const items = entry.byDate[date].slice().sort((a, b) => a.time.localeCompare(b.time));
    for (const it of items) {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = it.book || API_BASE;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = `${it.time} — ${it.movieTitle}`;
      li.appendChild(link);
      if (it.type) {
        const lang = document.createElement("span");
        lang.className = "lang-badge";
        lang.textContent = it.type;
        li.appendChild(lang);
      }
      listEl.appendChild(li);
    }
  }

  for (const date of dates) {
    const btn = document.createElement("button");
    btn.className = "day-tab" + (date === defaultDate ? " active" : "");
    btn.textContent = formatPanelDate(date);
    btn.addEventListener("click", () => {
      tabsDiv.querySelector(".day-tab.active").classList.remove("active");
      btn.classList.add("active");
      renderList(date);
    });
    tabsDiv.appendChild(btn);
  }

  mapPanelEl.appendChild(tabsDiv);
  mapPanelEl.appendChild(listEl);
  renderList(defaultDate);
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  const statusEl    = document.getElementById("status");
  movieListEl       = document.getElementById("movie-list");
  villetteListEl    = document.getElementById("villette-list");
  watchlistEl       = document.getElementById("watchlist-list");
  const dateLabelEl = document.getElementById("date-label");
  countLabelEl      = document.getElementById("count-label");
  searchEl          = document.getElementById("search");
  showtimeFiltersEl = document.getElementById("showtime-filters");
  watchlistHintEl   = document.getElementById("watchlist-hint");
  sortBarEl         = document.getElementById("sort-bar");
  footerSourceEl    = document.getElementById("footer-source");
  backToTopBtn      = document.getElementById("back-to-top");
  mapPanelEl        = document.getElementById("map-panel");
  mapRailEl         = document.getElementById("map-rail");
  layoutEl          = document.getElementById("layout");

  currentDate = todayISO();
  dateLabelEl.textContent = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });

  const cinemasPromise = loadCinemaCoords();
  initCineMap();
  initMapTimeFilter();
  initGeoloc();

  const stored = await storage.get(WATCHLIST_KEY);
  watchlist = stored[WATCHLIST_KEY] || [];
  updateWatchlistTab();

  statusEl.textContent = "Chargement des films…";
  let movies;
  try {
    movies = await getMoviesForToday(currentDate);
  } catch (err) {
    statusEl.textContent = `Erreur : ${err.message}`;
    statusEl.classList.add("error");
    return;
  }
  statusEl.textContent = "";
  moviesToday = movies;
  countLabelEl.textContent = `${movies.length} film${movies.length !== 1 ? "s" : ""} aujourd'hui`;

  const statCountEl = document.getElementById("stat-count");
  if (statCountEl) statCountEl.textContent = String(movies.length);
  renderRailFeature(movies);
  renderRailWatchlistToday(movies);
  renderRailVillette();

  const fragment = document.createDocumentFragment();
  const rows = movies.map(buildMovieRow);
  for (const row of rows) fragment.appendChild(row);
  movieListEl.appendChild(fragment);
  await cinemasPromise;
  mapWithConcurrency(rows, 6, (li) => li._loadShowtimes().then(() => {
    if (li._showtimes && li._showtimes.length === 0) {
      removeEmptyMovieRow(li);
      return;
    }
    if (activeTab !== "villette" && activeTab !== "watchlist") updateCount();
    updateCineMapMarkers();
  })).then(renderMarathonBlock);

  searchEl.addEventListener("input", () => {
    if (activeTab === "villette") renderVilletteList();
    else if (activeTab === "watchlist") renderWatchlist();
    else applyFilters();
  });

  for (const btn of document.querySelectorAll(".tab")) {
    btn.addEventListener("click", () => {
      document.querySelector(".tab.active").classList.remove("active");
      btn.classList.add("active");
      activeTab = btn.dataset.tab;
      if (activeTab === "villette") switchToVilletteTab();
      else if (activeTab === "watchlist") switchToWatchlistTab();
      else if (activeTab === "map") switchToMapTab();
      else if (activeTab === "marathon") switchToMarathonTab();
      else switchToMovieTab();
      updateCineMapMarkers();
    });
  }

  window.matchMedia("(max-width: 760px)").addEventListener("change", syncMobileTabPlacement);

  initDropdown(document.getElementById("time-filter-dd"), (value) => {
    activeWindow = value;
    applyShowtimeFilters();
    updateCineMapMarkers();
  });

  initDropdown(document.getElementById("version-filter-dd"), (value) => {
    activeVersion = value;
    applyShowtimeFilters();
    updateCineMapMarkers();
  });

  for (const btn of document.querySelectorAll(".sort-btn")) {
    btn.addEventListener("click", () => {
      if (activeSort === btn.dataset.sort) {
        activeSortDir = activeSortDir === "asc" ? "desc" : "asc";
      } else {
        document.querySelector(".sort-btn.active").classList.remove("active");
        btn.classList.add("active");
        activeSort = btn.dataset.sort;
        activeSortDir = SORT_DEFAULT_DIR[activeSort];
      }
      updateSortBtns();
      if (activeTab === "watchlist") sortWatchlistEntries();
      else sortMovieList();
    });
  }
  updateSortBtns();

  for (const btn of document.querySelectorAll(".view-btn")) {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  }

  document.getElementById("rail-word").addEventListener("click", scrollToTop);
  backToTopBtn.addEventListener("click", scrollToTop);
  window.addEventListener("scroll", updateBackToTopVisibility);

  showOnlyList(movieListEl);
}

init();
