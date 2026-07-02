const API_BASE = "https://www.paris-cine.info";
const CACHE_KEY      = "pci_movies_cache";
const WATCHLIST_KEY  = "pci_watchlist";
const CULTES_CUTOFF = 2017;

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
let currentDate   = "";

const SORT_LABELS = {
  alpha: { asc: "A → Z",   desc: "Z → A"   },
  year:  { asc: "Année ↑", desc: "Année ↓" },
  imdb:  { asc: "IMDb ↑",  desc: "IMDb ↓"  },
};
const SORT_DEFAULT_DIR = { alpha: "asc", year: "desc", imdb: "desc" };
let watchlist     = [];
let _searchToken  = 0;

let movieListEl, villetteListEl, watchlistEl, countLabelEl, searchEl;
let timeFilterEl, versionFilterEl, showtimeFiltersEl, sortBarEl, footerSourceEl;

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function genreLabels(geString) {
  if (!geString) return "";
  return geString.split(",").map((g) => GENRES[g] || g).join(", ");
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

function updateCount() {
  let visible = 0;
  for (const li of movieListEl.children) {
    if (!li.classList.contains("hidden") && !li.classList.contains("time-hidden")) visible++;
  }
  countLabelEl.textContent = `${visible} film${visible !== 1 ? "s" : ""} aujourd'hui`;
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
  for (const s of filtered) {
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
    showtimesEl.appendChild(row);
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
    btn.classList.remove("bookmarked");
  } else {
    watchlist.push({ id: movie.id, ti: movie.ti, o_ti: movie.o_ti || "", di: movie.di || "", ye: movie.ye || "", im_r: movie.im_r || "", savedAt: currentDate });
    btn.textContent = "♥";
    btn.classList.add("bookmarked");
  }
  await storage.set({ [WATCHLIST_KEY]: watchlist });
  updateWatchlistTab();
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
  for (const m of [...watchlist].reverse()) {
    const div = document.createElement("div");
    div.className = "watchlist-entry";
    div.style.cursor = "pointer";
    div.dataset.title = m.ti || "";
    div.dataset.year  = m.ye ? String(m.ye) : "0";
    div.dataset.imdb  = m.im_r ? String(m.im_r) : "0";
    div._showtimes = null;
    div._loaded = false;

    const titleLine = document.createElement("div");
    titleLine.className = "watchlist-title";
    const titleText = document.createElement("span");
    titleText.textContent = m.ti;
    titleLine.appendChild(titleText);
    if (m.im_r) {
      const badge = document.createElement("span");
      badge.className = "movie-rating";
      badge.textContent = `★ ${m.im_r}`;
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
      if (bookmarkBtn) { bookmarkBtn.textContent = "♡"; bookmarkBtn.classList.remove("bookmarked"); }
      updateWatchlistTab();
      renderWatchlist();
    });
    titleLine.appendChild(removeBtn);
    div.appendChild(titleLine);

    if (m.o_ti && m.o_ti !== m.ti) {
      const original = document.createElement("div");
      original.className = "watchlist-original";
      original.textContent = m.o_ti;
      div.appendChild(original);
    }
    const meta = document.createElement("div");
    meta.className = "watchlist-meta";
    meta.textContent = [m.di, m.ye].filter(Boolean).join(" · ");
    div.appendChild(meta);

    const savedDate = document.createElement("div");
    savedDate.className = "watchlist-saved";
    savedDate.textContent = `Épinglé le ${new Date(m.savedAt + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`;
    div.appendChild(savedDate);

    const panel = document.createElement("div");
    panel.className = "showtime-panel";
    div.appendChild(panel);

    div.addEventListener("click", async () => {
      const open = panel.classList.toggle("open");
      if (!open) return;
      if (!div._loaded) {
        div._loaded = true;
        panel.innerHTML = '<ul class="showtimes"><li class="loading">Chargement des séances…</li></ul>';
        try {
          div._showtimes = await getShowtimes(m.id);
          renderDayTabs(panel, div._showtimes);
        } catch {
          panel.innerHTML = '<ul class="showtimes"><li class="empty">Impossible de charger les séances.</li></ul>';
        }
      }
    });

    watchlistEl.appendChild(div);
  }
  countLabelEl.textContent = `${watchlist.length} film${watchlist.length !== 1 ? "s" : ""} épinglé${watchlist.length !== 1 ? "s" : ""}`;
  sortWatchlistEntries();
}

// ── Movie rows ────────────────────────────────────────────────────────────────

function buildMovieRow(movie) {
  const li = document.createElement("li");
  li.className = "movie";
  li.dataset.year = movie.ye ? String(movie.ye) : "";
  li.dataset.movieId = String(movie.id);
  li.dataset.title = movie.ti || "";
  li.dataset.imdb = movie.im_r ? String(movie.im_r) : "0";
  li._showtimes = null;

  const img = document.createElement("img");
  img.className = "poster";
  img.loading = "lazy";
  img.src = `${API_BASE}/get_poster.php?id=${movie.id}`;
  img.alt = "";
  li.appendChild(img);

  const main = document.createElement("div");
  main.className = "movie-main";

  const titleDiv = document.createElement("div");
  titleDiv.className = "movie-title";
  const titleText = document.createElement("span");
  titleText.textContent = movie.ti;
  titleDiv.appendChild(titleText);

  if (movie.im_r) {
    const badge = document.createElement("span");
    badge.className = "movie-rating";
    badge.textContent = `★ ${movie.im_r}`;
    titleDiv.appendChild(badge);
  }

  const bookmarkBtn = document.createElement("button");
  bookmarkBtn.className = "bookmark-btn" + (isBookmarked(movie.id) ? " bookmarked" : "");
  bookmarkBtn.textContent = isBookmarked(movie.id) ? "♥" : "♡";
  bookmarkBtn.dataset.bookmarkId = String(movie.id);
  bookmarkBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleBookmark(movie, bookmarkBtn);
  });
  titleDiv.appendChild(bookmarkBtn);
  main.appendChild(titleDiv);

  if (movie.o_ti && movie.o_ti !== movie.ti) {
    const original = document.createElement("div");
    original.className = "movie-original-title";
    original.textContent = movie.o_ti;
    main.appendChild(original);
  }

  const meta = document.createElement("div");
  meta.className = "movie-meta";
  meta.textContent = [movie.di, genreLabels(movie.ge), movie.du, movie.ye].filter(Boolean).join(" · ");
  main.appendChild(meta);

  const panel = document.createElement("div");
  panel.className = "showtime-panel";
  main.appendChild(panel);
  li.appendChild(main);

  let loaded = false;
  li.addEventListener("click", async () => {
    const open = panel.classList.toggle("open");
    if (!open) return;
    if (!loaded) {
      loaded = true;
      panel.innerHTML = '<ul class="showtimes"><li class="loading">Chargement des séances…</li></ul>';
      try {
        li._showtimes = await getShowtimes(movie.id);
        renderDayTabs(panel, li._showtimes);
      } catch {
        panel.innerHTML = '<ul class="showtimes"><li class="empty">Impossible de charger les séances.</li></ul>';
      }
    }
  });

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
    if (activeSort === "imdb")  return dir * ((parseFloat(a.dataset.imdb) || 0) - (parseFloat(b.dataset.imdb) || 0));
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
    if (activeSort === "imdb") {
      return dir * ((parseFloat(a.dataset.imdb) || 0) - (parseFloat(b.dataset.imdb) || 0));
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
    if (!inTitle && !inMeta) {
      li.classList.add("hidden");
      toCheckCinema.push(li);
    }
  }

  updateCount();

  if (toCheckCinema.length > 0) {
    await Promise.all(toCheckCinema.map(async (li) => {
      try {
        if (!li._showtimes) li._showtimes = await getShowtimes(li.dataset.movieId);
        if (token !== _searchToken) return;
        if (li._showtimes.some((s) => s.title?.toLowerCase().includes(q))) {
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
      getShowtimes(li.dataset.movieId)
        .then((showtimes) => {
          li._showtimes = showtimes;
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
    const poster = document.createElement("img");
    poster.className = "villette-poster";
    poster.loading = "lazy";
    poster.src = f.img;
    poster.alt = "";
    div.appendChild(poster);
    const info = document.createElement("div");
    info.className = "villette-info";
    const titleLine = document.createElement("div");
    titleLine.className = "villette-title";
    const titleLink = document.createElement("a");
    titleLink.href = "https://www.lavillette.com/manifestations/cinema-en-plein-air-26/";
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

// ── Tab switching ─────────────────────────────────────────────────────────────

function switchToMovieTab() {
  movieListEl.style.display = "";
  villetteListEl.style.display = "none";
  watchlistEl.style.display = "none";
  showtimeFiltersEl.style.display = "";
  sortBarEl.style.display = "";
  footerSourceEl.innerHTML = 'données non officielles <a href="https://www.paris-cine.info" target="_blank" rel="noopener">paris-cine.info</a>';
  applyFilters();
}

function switchToVilletteTab() {
  movieListEl.style.display = "none";
  villetteListEl.style.display = "block";
  watchlistEl.style.display = "none";
  showtimeFiltersEl.style.display = "none";
  sortBarEl.style.display = "none";
  footerSourceEl.innerHTML = '<a href="https://www.lavillette.com/manifestations/cinema-en-plein-air-26/" target="_blank" rel="noopener">lavillette.com</a>';
  renderVilletteList();
}

function switchToWatchlistTab() {
  movieListEl.style.display = "none";
  villetteListEl.style.display = "none";
  watchlistEl.style.display = "block";
  showtimeFiltersEl.style.display = "none";
  sortBarEl.style.display = "";
  footerSourceEl.innerHTML = 'données non officielles <a href="https://www.paris-cine.info" target="_blank" rel="noopener">paris-cine.info</a>';
  renderWatchlist();
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
  timeFilterEl      = document.getElementById("time-filter");
  versionFilterEl   = document.getElementById("version-filter");
  showtimeFiltersEl = document.getElementById("showtime-filters");
  sortBarEl         = document.getElementById("sort-bar");
  footerSourceEl    = document.getElementById("footer-source");

  currentDate = todayISO();
  dateLabelEl.textContent = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });

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
  countLabelEl.textContent = `${movies.length} film${movies.length !== 1 ? "s" : ""} aujourd'hui`;

  const fragment = document.createDocumentFragment();
  for (const movie of movies) fragment.appendChild(buildMovieRow(movie));
  movieListEl.appendChild(fragment);

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
      else switchToMovieTab();
    });
  }

  timeFilterEl.addEventListener("change", () => {
    activeWindow = timeFilterEl.value;
    applyShowtimeFilters();
  });

  versionFilterEl.addEventListener("change", () => {
    activeVersion = versionFilterEl.value;
    applyShowtimeFilters();
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
}

init();
