/* global L */

const DEFAULT_FX_VND_PER_USD = 25000;

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function formatVnd(vnd) {
  if (vnd === null || vnd === undefined) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(vnd);
}

function formatUsd(usd) {
  if (usd === null || usd === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(usd);
}

function moneyBoth(vnd, fx) {
  if (vnd === null || vnd === undefined) return "—";
  const usd = vnd / fx;
  return `${formatVnd(vnd)} (~${formatUsd(usd)})`;
}

function rangeBoth(minVnd, maxVnd, fx) {
  if (!Number.isFinite(minVnd) || !Number.isFinite(maxVnd)) return "—";
  return `${moneyBoth(minVnd, fx)} – ${moneyBoth(maxVnd, fx)}`;
}

function minutesToPretty(min) {
  if (!Number.isFinite(min)) return "—";
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}

function googleMapsSearchUrl(query) {
  const q = String(query || "").trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function placeWebsiteUrl(place) {
  if (place.website) return place.website;
  const q = place.address ? `${place.name}, ${place.address}` : place.name;
  return googleMapsSearchUrl(q);
}

const CATEGORIES = {
  hotel: { key: "hotel", label: "Hotel", color: "#ffd36a" },
  work: { key: "work", label: "Work", color: "#ff7a7a" },
  history: { key: "history", label: "History", color: "#a4ff7a" },
  market: { key: "market", label: "Markets / shopping", color: "#7aa2ff" },
  tailor: { key: "tailor", label: "Custom clothing", color: "#ff7ad9" },
  view: { key: "view", label: "City views / photography", color: "#7af0ff" },
  nature: { key: "nature", label: "Nature / day trips", color: "#c8a6ff" },
};

// Coordinates are approximate (good enough for planning + mapping).
const PLACES = {
  jabil_b3: {
    id: "jabil_b3",
    name: "Jabil B3 (Factory)",
    category: "work",
    address: "No. 1, N6 Street, Tan Phu, Thu Duc, HCMC",
    lat: 10.8435,
    lng: 106.7920,
    website: "https://www.jabil.com/",
    hours: "Business hours (per your schedule): 09:00–17:00 (Jun 8–11)",
    notes: "Work location (Jun 8–11, 9:00–17:00).",
  },

  villa_5a_nguyen_dinh_chieu: {
    id: "villa_5a_nguyen_dinh_chieu",
    name: "Villa (5A Nguyễn Đình Chiểu)",
    category: "hotel",
    area: "District 1 (Đa Kao)",
    address: "5A (villa), Nguyễn Đình Chiểu, Đa Kao, Quận 1, Hồ Chí Minh, Vietnam",
    // Coordinates: provided by you.
    lat: 10.78954984007047,
    lng: 106.70149474232778,
    website: null,
    hours: "24/7 (residential address; access depends on your host)",
    amenities: {
      spa: "—",
      gym: "—",
      view: "Central District 1 base (night walks nearby)",
    },
    nightlyRangeVnd: null,
    commuteToJabilMinutes: [40, 75],
    whyNight: "Added per request: your villa address marker.",
    sourceNote: "Geocoded approximately via Photon (OpenStreetMap-based).",
  },

  // Option B hotels (Thao Dien / An Khanh)
  mia_saigon: {
    id: "mia_saigon",
    name: "Mia Saigon Luxury Boutique Hotel",
    category: "hotel",
    area: "Option B: Thao Dien (District 2 / Thu Duc City)",
    address: "No. 2–4 Street 10, An Khanh, Thu Duc, HCMC",
    lat: 10.8106,
    lng: 106.7337,
    website: "https://www.miasaigon.com/",
    hours: "24/7 (hotel)",
    amenities: {
      spa: true,
      gym: true,
      view: "Riverside (Saigon River) boutique resort feel",
    },
    nightlyRangeVnd: [5500000, 10000000],
    commuteToJabilMinutes: [25, 45],
    whyNight: "Quiet riverside setting; good for evening views + photos (river / sunset).",
    sourceNote: "Amenities info from official site (spa + gym + riverside).",
  },
  villa_song: {
    id: "villa_song",
    name: "Villa Sông Saigon",
    category: "hotel",
    area: "Option B: Thao Dien (District 2 / Thu Duc City)",
    address: "197/2 Nguyen Van Huong, An Khanh, Thu Duc, HCMC",
    lat: 10.8078,
    lng: 106.7333,
    website: "https://www.villasong.com/",
    hours: "24/7 (hotel)",
    amenities: {
      spa: "Nearby / partner style (confirm when booking)",
      gym: "Small fitness / partner options (confirm)",
      view: "Riverside / garden",
    },
    nightlyRangeVnd: [4500000, 8000000],
    commuteToJabilMinutes: [25, 45],
    whyNight: "Romantic riverside boutique; calmer nights than District 1.",
    sourceNote: "Riverside boutique positioning from official site.",
  },

  // Option C hotels (District 1)
  reverie_saigon: {
    id: "reverie_saigon",
    name: "The Reverie Saigon",
    category: "hotel",
    area: "Option C: District 1 (downtown)",
    address: "Times Square Building, Nguyen Hue, District 1, HCMC",
    lat: 10.7733,
    lng: 106.7041,
    website: "https://www.thereveriesaigon.com/",
    hours: "24/7 (hotel)",
    amenities: {
      spa: true,
      gym: true,
      view: "High-floor skyline + river/city perspective",
    },
    nightlyRangeVnd: [11000000, 22000000],
    commuteToJabilMinutes: [40, 70],
    whyNight: "Best ‘night sightseeing’ from the hotel itself (high-floor views).",
    sourceNote: "Official site highlights spectacular views + spa/pool.",
  },
  caravelle_saigon: {
    id: "caravelle_saigon",
    name: "Caravelle Saigon",
    category: "hotel",
    area: "Option C: District 1 (downtown)",
    address: "19–23 Lam Son Square, District 1, HCMC",
    lat: 10.7767,
    lng: 106.7034,
    website: "https://www.caravellehotel.com/",
    hours: "24/7 (hotel)",
    amenities: {
      spa: true,
      gym: true,
      view: "Central landmarks; easy night photography around Opera House",
    },
    nightlyRangeVnd: [6500000, 13000000],
    commuteToJabilMinutes: [40, 70],
    whyNight: "Prime location for night walks: Opera House, Dong Khoi, Nguyen Hue.",
    sourceNote: "Official site lists spa + pool/fitness pages.",
  },
  park_hyatt_saigon: {
    id: "park_hyatt_saigon",
    name: "Park Hyatt Saigon",
    category: "hotel",
    area: "Option C: District 1 (downtown)",
    address: "Lam Son Square area, District 1, HCMC",
    lat: 10.7774,
    lng: 106.7030,
    website: "https://www.hyatt.com/en-US/hotel/vietnam/park-hyatt-saigon/saiph",
    hours: "24/7 (hotel)",
    amenities: {
      spa: true,
      gym: true,
      view: "Classic District 1 night scenes (Opera House / Dong Khoi)",
    },
    nightlyRangeVnd: [9500000, 19000000],
    commuteToJabilMinutes: [40, 70],
    whyNight: "Luxury base near the best-lit ‘postcard’ streets at night.",
    sourceNote: "Hyatt listing (confirm live rates + amenities when booking).",
  },

  // Venues
  nguyen_hue: {
    id: "nguyen_hue",
    name: "Nguyen Hue Walking Street",
    category: "view",
    address: "Nguyen Hue Blvd, District 1, HCMC",
    lat: 10.7734,
    lng: 106.7045,
    entranceFeeVndPerPerson: 0,
    hours: "Open-air public street: typically accessible 24/7",
    suggestedMinutes: 60,
    notes: "Night city lights, people-watching, easy photos.",
  },
  central_post_office: {
    id: "central_post_office",
    name: "Saigon Central Post Office",
    category: "history",
    address: "2 Cong xa Paris, District 1, HCMC",
    lat: 10.7798,
    lng: 106.6991,
    entranceFeeVndPerPerson: 0,
    hours: "Operating hours vary; check the website link for today’s hours",
    suggestedMinutes: 40,
    notes: "Colonial-era architecture; great quick stop after work.",
  },
  war_remnants: {
    id: "war_remnants",
    name: "War Remnants Museum",
    category: "history",
    address: "28 Vo Van Tan, District 3, HCMC",
    lat: 10.779475,
    lng: 106.692132,
    entranceFeeVndPerPerson: 40000,
    hours: "Operating hours vary; check the website link for today’s hours",
    suggestedMinutes: 90,
    notes: "Major history museum; plan time for intense exhibits.",
  },
  independence_palace: {
    id: "independence_palace",
    name: "Independence Palace (Reunification Hall)",
    category: "history",
    address: "135 Nam Ky Khoi Nghia, District 1, HCMC",
    lat: 10.776944,
    lng: 106.695278,
    entranceFeeVndPerPerson: 65000,
    hours: "Operating hours vary; check the website link for today’s hours",
    suggestedMinutes: 90,
    notes: "Key Vietnam War / reunification landmark; excellent photo angles.",
  },
  ben_thanh: {
    id: "ben_thanh",
    name: "Ben Thanh Market",
    category: "market",
    address: "Le Loi St, District 1, HCMC",
    lat: 10.7726,
    lng: 106.6980,
    entranceFeeVndPerPerson: 0,
    hours: "Operating hours vary; check the website link for today’s hours",
    suggestedMinutes: 75,
    notes: "Iconic market for souvenirs + browsing. Expect bargaining.",
  },
  saigon_square: {
    id: "saigon_square",
    name: "Saigon Square",
    category: "market",
    address: "77-89 Nam Ky Khoi Nghia, District 1, HCMC",
    lat: 10.7716,
    lng: 106.7027,
    entranceFeeVndPerPerson: 0,
    hours: "Operating hours vary; check the website link for today’s hours",
    suggestedMinutes: 60,
    notes: "Indoor shopping; good if it rains.",
  },
  tailor_dong_khoi: {
    id: "tailor_dong_khoi",
    name: "Tailor / Custom Clothing Area (Dong Khoi / Le Thanh Ton)",
    category: "tailor",
    address: "Dong Khoi & Le Thanh Ton area, District 1, HCMC",
    lat: 10.7771,
    lng: 106.7042,
    entranceFeeVndPerPerson: 0,
    hours: "Shop hours vary by store; check the website link for nearby options",
    suggestedMinutes: 90,
    notes: "Browse custom shirts/suits/ao dai. Confirm timelines + fittings.",
  },
  bitexco_skydeck: {
    id: "bitexco_skydeck",
    name: "Saigon Skydeck (Bitexco Financial Tower)",
    category: "view",
    address: "2 Hai Trieu, District 1, HCMC",
    lat: 10.7719,
    lng: 106.7049,
    entranceFeeVndPerPerson: 240000,
    hours: "Operating hours vary; check the website link for today’s hours",
    suggestedMinutes: 75,
    notes: "Best payoff at sunset/night. Ticket prices can change; verify day-of.",
  },
  opera_house: {
    id: "opera_house",
    name: "Saigon Opera House (Municipal Theatre) – exterior",
    category: "view",
    address: "07 Cong Truong Lam Son, District 1, HCMC",
    lat: 10.7766,
    lng: 106.7032,
    entranceFeeVndPerPerson: 0,
    hours: "Exterior viewing: open public area (24/7)",
    suggestedMinutes: 25,
    notes: "Classic night photos around Lam Son Square.",
  },
  tao_dan: {
    id: "tao_dan",
    name: "Tao Dan Park",
    category: "nature",
    address: "Truong Dinh, District 1, HCMC",
    lat: 10.7696,
    lng: 106.6924,
    entranceFeeVndPerPerson: 0,
    hours: "Park hours vary; check the website link for today’s hours",
    suggestedMinutes: 30,
    notes: "Green break after museum; quick stroll.",
  },
  landmark_81: {
    id: "landmark_81",
    name: "Landmark 81 (riverfront area) – exterior",
    category: "view",
    address: "Vinhomes Central Park, Binh Thanh / Thu Duc edge",
    lat: 10.7942,
    lng: 106.7218,
    entranceFeeVndPerPerson: 0,
    hours: "Outdoor area: typically accessible daily; mall/building hours vary",
    suggestedMinutes: 75,
    notes: "Easy night skyline photos; good low-effort evening.",
  },
  ao_dai_museum: {
    id: "ao_dai_museum",
    name: "Ao Dai Museum (Bao tang Ao Dai)",
    category: "tailor",
    address: "Long Phuoc / Thu Duc area (confirm exact route)",
    lat: 10.8498,
    lng: 106.8236,
    entranceFeeVndPerPerson: 100000,
    hours: "Operating hours vary; check the website link for today’s hours",
    suggestedMinutes: 90,
    notes: "Local cultural stop; aligns with custom clothing interest.",
  },
  cu_chi: {
    id: "cu_chi",
    name: "Cu Chi Tunnels (Ben Dinh area)",
    category: "nature",
    address: "Cu Chi District, HCMC",
    lat: 11.060833,
    lng: 106.528611,
    entranceFeeVndPerPerson: 110000,
    hours: "Operating hours vary; check the website link for today’s hours",
    suggestedMinutes: 150,
    notes: "Day trip; plan for heat + walking. Some parts are narrow.",
  },
  mekong_mytho: {
    id: "mekong_mytho",
    name: "Mekong Delta (My Tho / boat tour start area)",
    category: "nature",
    address: "My Tho, Tien Giang (day trip)",
    lat: 10.3563,
    lng: 106.3607,
    entranceFeeVndPerPerson: null,
    hours: "Day tours vary; confirm pickup/start time with your operator",
    suggestedMinutes: 330,
    notes: "Usually sold as a package tour (boat + sites).",
  },
  sgn_airport: {
    id: "sgn_airport",
    name: "Tan Son Nhat International Airport (SGN)",
    category: "view",
    address: "Tan Binh District, HCMC",
    lat: 10.8188,
    lng: 106.6519,
    entranceFeeVndPerPerson: 0,
    hours: "24/7",
    suggestedMinutes: 0,
    notes: "Departure.",
  },
};

const HOTEL_GROUPS = {
  B: {
    key: "B",
    label: "Option B: Thao Dien (D2)",
    placeIds: ["mia_saigon", "villa_song"],
    vibe: "More relaxed; still close-ish to factory. Great riverside evenings.",
  },
  C: {
    key: "C",
    label: "Option C: District 1",
    placeIds: ["reverie_saigon", "caravelle_saigon", "park_hyatt_saigon"],
    vibe: "Best nightly sightseeing on foot; longer commute to factory.",
  },
};

// Itinerary is expressed as ordered stops with time blocks.
// Transport costs/times are estimates from Thu Duc/Thao Dien base unless stated.
const ITINERARY = [
  {
    id: "2026-06-07",
    dateLabel: "Sun, Jun 7",
    title: "Arrival + easy night near hotel",
    tags: ["arrival", "city views"],
    stops: [
      {
        time: "17:00–19:00",
        placeId: "__BASE_HOTEL__",
        labelOverride: "Check-in + settle (your hotel)",
        travelMinutesFromPrev: null,
        transportVndFromPrev: null,
        stayMinutes: 120,
        costs: [],
        notes: "Have catering delivered; keep this night low-effort.",
      },
      {
        time: "19:30–21:00",
        placeId: "landmark_81",
        travelMinutesFromPrev: 25,
        transportVndFromPrev: 180000,
        stayMinutes: 90,
        costs: [{ label: "Entrance", vndPerPerson: 0 }],
        notes: "Riverside night photos; easy walk.",
      },
    ],
  },
  {
    id: "2026-06-08",
    dateLabel: "Mon, Jun 8",
    title: "Work + classic District 1 night walk",
    tags: ["work", "history", "photos"],
    stops: [
      {
        time: "09:00–17:00",
        placeId: "jabil_b3",
        travelMinutesFromPrev: null,
        transportVndFromPrev: null,
        stayMinutes: 480,
        costs: [],
        notes: "Work day.",
      },
      {
        time: "18:00–19:00",
        placeId: "nguyen_hue",
        travelMinutesFromPrev: 45,
        transportVndFromPrev: 300000,
        stayMinutes: 60,
        costs: [{ label: "Entrance", vndPerPerson: 0 }],
        notes: "Night lights + people-watching.",
      },
      {
        time: "19:10–19:50",
        placeId: "central_post_office",
        travelMinutesFromPrev: 12,
        transportVndFromPrev: 60000,
        stayMinutes: 40,
        costs: [{ label: "Entrance", vndPerPerson: 0 }],
        notes: "Quick architecture/photo stop.",
      },
      {
        time: "20:05–20:30",
        placeId: "opera_house",
        travelMinutesFromPrev: 12,
        transportVndFromPrev: 60000,
        stayMinutes: 25,
        costs: [{ label: "Entrance", vndPerPerson: 0 }],
        notes: "Exterior night photos.",
      },
    ],
  },
  {
    id: "2026-06-09",
    dateLabel: "Tue, Jun 9",
    title: "Work + War Remnants Museum",
    tags: ["work", "history"],
    stops: [
      {
        time: "09:00–17:00",
        placeId: "jabil_b3",
        travelMinutesFromPrev: null,
        transportVndFromPrev: null,
        stayMinutes: 480,
        costs: [],
        notes: "Work day.",
      },
      {
        time: "18:05–19:35",
        placeId: "war_remnants",
        travelMinutesFromPrev: 50,
        transportVndFromPrev: 340000,
        stayMinutes: 90,
        costs: [{ label: "Ticket", vndPerPerson: PLACES.war_remnants.entranceFeeVndPerPerson }],
        notes: "Plan emotional bandwidth; exhibits are intense.",
      },
      {
        time: "19:45–20:15",
        placeId: "tao_dan",
        travelMinutesFromPrev: 10,
        transportVndFromPrev: 50000,
        stayMinutes: 30,
        costs: [{ label: "Entrance", vndPerPerson: 0 }],
        notes: "Decompress with a short green break.",
      },
    ],
  },
  {
    id: "2026-06-10",
    dateLabel: "Wed, Jun 10",
    title: "Work + markets + custom clothing browsing",
    tags: ["work", "markets", "custom clothing"],
    stops: [
      {
        time: "09:00–17:00",
        placeId: "jabil_b3",
        travelMinutesFromPrev: null,
        transportVndFromPrev: null,
        stayMinutes: 480,
        costs: [],
        notes: "Work day.",
      },
      {
        time: "18:05–19:20",
        placeId: "ben_thanh",
        travelMinutesFromPrev: 50,
        transportVndFromPrev: 340000,
        stayMinutes: 75,
        costs: [{ label: "Entrance", vndPerPerson: 0 }],
        notes: "Souvenir browsing; keep valuables secure.",
      },
      {
        time: "19:30–20:30",
        placeId: "saigon_square",
        travelMinutesFromPrev: 8,
        transportVndFromPrev: 45000,
        stayMinutes: 60,
        costs: [{ label: "Entrance", vndPerPerson: 0 }],
        notes: "Indoor shopping if it rains.",
      },
      {
        time: "20:40–22:10",
        placeId: "tailor_dong_khoi",
        travelMinutesFromPrev: 8,
        transportVndFromPrev: 45000,
        stayMinutes: 90,
        costs: [{ label: "Entrance", vndPerPerson: 0 }],
        notes: "If ordering, confirm fitting schedule before you leave (you depart Jun 15).",
      },
    ],
  },
  {
    id: "2026-06-11",
    dateLabel: "Thu, Jun 11",
    title: "Work + skyline night (Skydeck)",
    tags: ["work", "city views"],
    stops: [
      {
        time: "09:00–17:00",
        placeId: "jabil_b3",
        travelMinutesFromPrev: null,
        transportVndFromPrev: null,
        stayMinutes: 480,
        costs: [],
        notes: "Work day.",
      },
      {
        time: "18:20–19:35",
        placeId: "bitexco_skydeck",
        travelMinutesFromPrev: 45,
        transportVndFromPrev: 300000,
        stayMinutes: 75,
        costs: [{ label: "Ticket", vndPerPerson: PLACES.bitexco_skydeck.entranceFeeVndPerPerson }],
        notes: "Aim for golden hour into night.",
      },
      {
        time: "19:50–20:15",
        placeId: "opera_house",
        travelMinutesFromPrev: 10,
        transportVndFromPrev: 50000,
        stayMinutes: 25,
        costs: [{ label: "Entrance", vndPerPerson: 0 }],
        notes: "Quick night photos on the way back.",
      },
    ],
  },
  {
    id: "2026-06-12",
    dateLabel: "Fri, Jun 12",
    title: "Independence Palace + Cu Chi Tunnels day trip",
    tags: ["day trip", "history", "nature"],
    stops: [
      {
        time: "08:30–10:00",
        placeId: "independence_palace",
        travelMinutesFromPrev: 45,
        transportVndFromPrev: 300000,
        stayMinutes: 90,
        costs: [{ label: "Ticket", vndPerPerson: PLACES.independence_palace.entranceFeeVndPerPerson }],
        notes: "Go early to avoid crowds/heat. Palace hours vary; verify day-of.",
      },
      {
        time: "10:15–12:15",
        placeId: "cu_chi",
        travelMinutesFromPrev: 120,
        transportVndFromPrev: 1800000,
        stayMinutes: 0,
        costs: [],
        notes: "Private car (estimate, total for the trip/day): confirm with driver/tour.",
      },
      {
        time: "12:15–14:45",
        placeId: "cu_chi",
        travelMinutesFromPrev: 0,
        transportVndFromPrev: 0,
        stayMinutes: 150,
        costs: [{ label: "Entrance", vndPerPerson: PLACES.cu_chi.entranceFeeVndPerPerson }],
        notes: "Bring hat, water, mosquito protection.",
      },
    ],
    alternateCosts: [
      { label: "Group tour alternative (per person)", vndPerPerson: 900000 },
    ],
  },
  {
    id: "2026-06-13",
    dateLabel: "Sat, Jun 13",
    title: "Free day staying local to the hotel",
    tags: ["local", "custom clothing", "photos"],
    stops: [
      {
        time: "10:30–12:00",
        placeId: "ao_dai_museum",
        travelMinutesFromPrev: 35,
        transportVndFromPrev: 220000,
        stayMinutes: 90,
        costs: [{ label: "Ticket (typical)", vndPerPerson: PLACES.ao_dai_museum.entranceFeeVndPerPerson }],
        notes: "Local cultural stop near Thu Duc; good for photos.",
      },
      {
        time: "19:00–20:30",
        placeId: "landmark_81",
        travelMinutesFromPrev: 25,
        transportVndFromPrev: 180000,
        stayMinutes: 90,
        costs: [{ label: "Entrance", vndPerPerson: 0 }],
        notes: "Easy local evening; keep it flexible.",
      },
    ],
  },
  {
    id: "2026-06-14",
    dateLabel: "Sun, Jun 14",
    title: "Mekong Delta day trip",
    tags: ["day trip", "nature", "photography"],
    stops: [
      {
        time: "07:00–09:15",
        placeId: "mekong_mytho",
        travelMinutesFromPrev: 135,
        transportVndFromPrev: 2200000,
        stayMinutes: 0,
        costs: [],
        notes: "Private car (estimate, total for the day): confirm with driver/tour.",
      },
      {
        time: "09:15–14:45",
        placeId: "mekong_mytho",
        travelMinutesFromPrev: 0,
        transportVndFromPrev: 0,
        stayMinutes: 330,
        costs: [{ label: "Tour package (typical, per person)", vndPerPerson: 1000000 }],
        notes: "Most operators bundle boats + sites; verify what’s included.",
      },
    ],
  },
  {
    id: "2026-06-15",
    dateLabel: "Mon, Jun 15",
    title: "Departure",
    tags: ["airport"],
    stops: [
      {
        time: "(timing depends on flight)",
        placeId: "sgn_airport",
        travelMinutesFromPrev: 70,
        transportVndFromPrev: 420000,
        stayMinutes: 0,
        costs: [],
        notes: "Leave earlier during morning rush.",
      },
    ],
  },
];

function resolvePlaceId(placeId, baseHotelId) {
  if (placeId === "__BASE_HOTEL__") return baseHotelId;
  return placeId;
}

function iconForCategory(categoryKey) {
  const cat = CATEGORIES[categoryKey] || { color: "#ffffff" };
  return {
    color: cat.color,
    fillColor: cat.color,
    fillOpacity: 0.85,
    radius: categoryKey === "hotel" ? 8 : categoryKey === "work" ? 8 : 7,
    weight: 2,
    opacity: 0.9,
  };
}

function buildPopupHtml(place, fx) {
  const fee = place.entranceFeeVndPerPerson;
  const feeLine = fee === undefined ? "" : `<div><b>Entrance:</b> ${moneyBoth(fee, fx)} <span class="muted">(per person)</span></div>`;
  const minsLine = place.suggestedMinutes ? `<div><b>Time at venue:</b> ~${minutesToPretty(place.suggestedMinutes)}</div>` : "";
  const addrLine = place.address ? `<div><b>Address:</b> ${place.address}</div>` : "";
  const hoursLine = place.hours ? `<div><b>Hours:</b> ${place.hours}</div>` : `<div><b>Hours:</b> Check website (varies)</div>`;
  const url = placeWebsiteUrl(place);
  const siteLine = `<div><b>Website:</b> <a href="${url}" target="_blank" rel="noreferrer">open</a></div>`;
  const notesLine = place.notes ? `<div style="margin-top:6px;color:#a8b4d3">${place.notes}</div>` : "";

  return `
    <div style="min-width:260px">
      <div style="font-weight:700; margin-bottom:6px">${place.name}</div>
      ${addrLine}
      ${hoursLine}
      ${feeLine}
      ${minsLine}
      ${siteLine}
      ${notesLine}
    </div>
  `;
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const child of children) node.appendChild(child);
  return node;
}

function setActiveTab(activeKey) {
  const tabB = document.getElementById("tabB");
  const tabC = document.getElementById("tabC");
  tabB.classList.toggle("tab--active", activeKey === "B");
  tabC.classList.toggle("tab--active", activeKey === "C");
}

function computeDayCostSummary(day, fx) {
  let perPersonVnd = 0;
  let totalVnd = 0;

  for (const s of day.stops) {
    for (const c of (s.costs || [])) {
      if (Number.isFinite(c.vndPerPerson)) perPersonVnd += c.vndPerPerson;
      if (Number.isFinite(c.vndTotal)) totalVnd += c.vndTotal;
    }
    if (Number.isFinite(s.transportVndFromPrev)) totalVnd += s.transportVndFromPrev;
  }

  const perPersonUsd = perPersonVnd / fx;
  const totalUsd = totalVnd / fx;

  return {
    perPersonVnd,
    totalVnd,
    perPersonUsd,
    totalUsd,
  };
}

async function osrmRoute(a, b) {
  const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM error ${res.status}`);
  const json = await res.json();
  if (!json.routes || !json.routes[0] || !json.routes[0].geometry) throw new Error("OSRM: no routes");
  return json.routes[0].geometry;
}

function straightLineGeoJson(a, b) {
  return {
    type: "LineString",
    coordinates: [
      [a.lng, a.lat],
      [b.lng, b.lat],
    ],
  };
}

function ensurePlace(placeId) {
  const p = PLACES[placeId];
  if (!p) throw new Error(`Unknown place: ${placeId}`);
  return p;
}

function buildDaySummaryHtml(day, fx, baseHotelId) {
  const resolved = {
    ...day,
    stops: day.stops.map(s => ({ ...s, placeId: resolvePlaceId(s.placeId, baseHotelId) })),
  };

  const cost = computeDayCostSummary(resolved, fx);

  const lines = resolved.stops.map((s, idx) => {
    const place = ensurePlace(s.placeId);
    const label = s.labelOverride || place.name;

    const travel = Number.isFinite(s.travelMinutesFromPrev)
      ? `• Travel: ~${minutesToPretty(s.travelMinutesFromPrev)}`
      : "";

    const transport = Number.isFinite(s.transportVndFromPrev)
      ? `• Transport: ${moneyBoth(s.transportVndFromPrev, fx)}`
      : "";

    const venueFee = (s.costs || []).find(c => Number.isFinite(c.vndPerPerson) && (c.label || "").toLowerCase().includes("ticket"))
      || (s.costs || []).find(c => Number.isFinite(c.vndPerPerson) && (c.label || "").toLowerCase().includes("entrance"));

    const venueFeeLine = venueFee
      ? `• ${venueFee.label}: ${moneyBoth(venueFee.vndPerPerson, fx)} per person`
      : "";

    const stay = Number.isFinite(s.stayMinutes) && s.stayMinutes > 0
      ? `• Time there: ~${minutesToPretty(s.stayMinutes)}`
      : (place.suggestedMinutes ? `• Time there: ~${minutesToPretty(place.suggestedMinutes)}` : "");

    const notes = s.notes || place.notes;
    const notesLine = notes ? `<div style="margin-top:4px">${notes}</div>` : "";

    const meta = [travel, transport, venueFeeLine, stay].filter(Boolean).join(" ");

    return `
      <div style="padding:8px 0; border-top: ${idx === 0 ? "none" : "1px solid rgba(255,255,255,0.08)"}">
        <div><b>${s.time}</b> • ${label}</div>
        <div>${meta}</div>
        ${notesLine}
      </div>
    `;
  }).join("");

  const alt = (day.alternateCosts || []).map(c => {
    if (Number.isFinite(c.vndPerPerson)) return `<div>Alt: <b>${c.label}</b> — ${moneyBoth(c.vndPerPerson, fx)} per person</div>`;
    return "";
  }).join("");

  return `
    <div>
      <div><b>${day.dateLabel}</b> — ${day.title}</div>
      <div style="margin-top:6px">
        <b>Estimated costs (excludes food):</b>
        <div>Per person (tickets/packages): ${moneyBoth(cost.perPersonVnd, fx)}</div>
        <div>Transport + shared items (total): ${moneyBoth(cost.totalVnd, fx)}</div>
        ${alt ? `<div style="margin-top:6px">${alt}</div>` : ""}
      </div>
      <div style="margin-top:10px">${lines}</div>
    </div>
  `;
}

function createHotelCard(hotel, fx) {
  const [minVnd, maxVnd] = hotel.nightlyRangeVnd || [null, null];
  const commute = hotel.commuteToJabilMinutes;

  const amenities = hotel.amenities || {};
  const spaText = amenities.spa === true ? "Yes" : (amenities.spa || "Confirm");
  const gymText = amenities.gym === true ? "Yes" : (amenities.gym || "Confirm");
  const viewText = amenities.view || "—";

  return el("div", { class: "card" }, [
    el("div", { class: "card__title" }, [
      el("h3", { text: hotel.name }),
      el("span", { class: "badge", text: hotel.area || "" }),
    ]),
    el("div", { class: "card__body" }, [
      el("div", { class: "kv" }, [
        el("b", { text: "Nightly (typical)" }),
        el("div", { text: rangeBoth(minVnd, maxVnd, fx) }),
      ]),
      el("div", { class: "kv" }, [
        el("b", { text: "Commute to Jabil" }),
        el("div", { text: commute ? `${commute[0]}–${commute[1]} min (traffic-dependent)` : "—" }),
      ]),
      el("div", { class: "kv" }, [
        el("b", { text: "Spa" }),
        el("div", { text: spaText }),
      ]),
      el("div", { class: "kv" }, [
        el("b", { text: "Gym" }),
        el("div", { text: gymText }),
      ]),
      el("div", { class: "kv" }, [
        el("b", { text: "View / vibe" }),
        el("div", { text: viewText }),
      ]),
      el("div", { class: "kv" }, [
        el("b", { text: "Why for nights" }),
        el("div", { text: hotel.whyNight || "—" }),
      ]),
      el("div", { class: "kv" }, [
        el("b", { text: "Link" }),
        (hotel.website ? el("a", { href: hotel.website, target: "_blank", rel: "noreferrer", text: "Official site" }) : el("span", { text: "—" })),
      ]),
    ]),
  ]);
}

function buildDayList(activeDayId, fx, onSelect) {
  const host = document.getElementById("dayList");
  host.innerHTML = "";

  for (const d of ITINERARY) {
    const cost = computeDayCostSummary(d, fx);
    const meta = `${d.tags.join(" • ")} • tickets: ${moneyBoth(cost.perPersonVnd, fx)} pp • transport: ${moneyBoth(cost.totalVnd, fx)}`;

    const item = el("div", {
      class: `dayItem ${d.id === activeDayId ? "dayItem--active" : ""}`,
    }, [
      el("div", { class: "dayItem__title", text: `${d.dateLabel} — ${d.title}` }),
      el("div", { class: "dayItem__meta", text: meta }),
    ]);

    item.addEventListener("click", () => onSelect(d.id));
    host.appendChild(item);
  }
}

function buildHotelList(activeGroupKey, fx) {
  const host = document.getElementById("hotelList");
  host.innerHTML = "";

  const group = HOTEL_GROUPS[activeGroupKey];
  for (const id of group.placeIds) {
    const hotel = ensurePlace(id);
    host.appendChild(createHotelCard(hotel, fx));
  }
}

function placeMarker(map, place, fx) {
  const opts = iconForCategory(place.category);
  const marker = L.circleMarker([place.lat, place.lng], opts);
  marker.bindPopup(buildPopupHtml(place, fx));
  marker.addTo(map);
  return marker;
}

function computeBounds(placeIds) {
  const pts = placeIds
    .map(id => PLACES[id])
    .filter(Boolean)
    .map(p => [p.lat, p.lng]);

  if (pts.length === 0) return null;
  return L.latLngBounds(pts);
}

async function main() {
  const fxInput = document.getElementById("fxRate");
  const fitAllBtn = document.getElementById("fitAll");
  const daySummary = document.getElementById("daySummary");

  let fx = DEFAULT_FX_VND_PER_USD;
  let activeHotelGroupKey = "B";
  let activeDayId = ITINERARY[0].id;
  let baseHotelId = "mia_saigon";

  const map = L.map("map", { zoomControl: true }).setView([10.78, 106.70], 12);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const allMarkersLayer = L.layerGroup().addTo(map);
  const dayMarkersLayer = L.layerGroup().addTo(map);
  const routesLayer = L.layerGroup().addTo(map);

  const routeCache = new Map();

  function renderAllStaticMarkers() {
    allMarkersLayer.clearLayers();

    // Show all hotels + work + main venues.
    const ids = Object.keys(PLACES);
    for (const id of ids) {
      const p = PLACES[id];
      // Keep the map readable: show hotels, work, and core venues.
      const show = p.category === "hotel" || p.category === "work" || p.category !== "view" || ["nguyen_hue", "bitexco_skydeck", "landmark_81", "opera_house"].includes(p.id);
      if (!show) continue;
      placeMarker(map, p, fx).addTo(allMarkersLayer);
    }
  }

  function buildBaseHotelPicker() {
    const controls = document.querySelector(".header__controls");

    const wrap = el("label", { class: "control" }, [
      el("span", { text: "Route start hotel" }),
    ]);

    const select = el("select", { id: "baseHotel", class: "select" });

    const hotelIds = [...HOTEL_GROUPS.B.placeIds, ...HOTEL_GROUPS.C.placeIds];
    for (const id of hotelIds) {
      const p = ensurePlace(id);
      const opt = el("option", { value: id, text: `${p.name} (${p.area.includes("Option B") ? "B" : "C"})` });
      select.appendChild(opt);
    }

    select.value = baseHotelId;
    select.addEventListener("change", () => {
      baseHotelId = select.value;
      renderActiveDay();
    });

    wrap.appendChild(select);
    controls.insertBefore(wrap, controls.firstChild);
  }

  async function drawRouteBetween(aId, bId, color) {
    const a = ensurePlace(aId);
    const b = ensurePlace(bId);
    const key = `${aId}::${bId}`;

    let geom = routeCache.get(key);
    if (!geom) {
      try {
        geom = await osrmRoute(a, b);
      } catch {
        geom = straightLineGeoJson(a, b);
      }
      routeCache.set(key, geom);
    }

    const coords = geom.coordinates.map(([lng, lat]) => [lat, lng]);
    const pl = L.polyline(coords, {
      color,
      weight: 4,
      opacity: 0.85,
    });
    pl.addTo(routesLayer);
  }

  async function renderActiveDay() {
    dayMarkersLayer.clearLayers();
    routesLayer.clearLayers();

    const day = ITINERARY.find(d => d.id === activeDayId) || ITINERARY[0];

    const resolvedStops = day.stops.map(s => ({ ...s, placeId: resolvePlaceId(s.placeId, baseHotelId) }));

    // Markers: base hotel + all day stops.
    const dayPlaceIds = new Set([baseHotelId, ...resolvedStops.map(s => s.placeId)]);
    for (const pid of dayPlaceIds) {
      const p = ensurePlace(pid);
      const m = placeMarker(map, p, fx);
      m.addTo(dayMarkersLayer);
    }

    // Routes: base hotel -> first non-hotel stop (or first stop), then between stops.
    const orderedStops = resolvedStops.map(s => s.placeId);
    const routePoints = [baseHotelId, ...orderedStops];

    const color = "#7aa2ff";
    for (let i = 0; i < routePoints.length - 1; i++) {
      await drawRouteBetween(routePoints[i], routePoints[i + 1], color);
    }

    // Summary panel
    daySummary.innerHTML = buildDaySummaryHtml(day, fx, baseHotelId);

    // Fit bounds to day
    const b = computeBounds([...dayPlaceIds]);
    if (b) map.fitBounds(b.pad(0.12));

    buildDayList(activeDayId, fx, (id) => {
      activeDayId = id;
      renderActiveDay();
    });
  }

  function renderHotels() {
    buildHotelList(activeHotelGroupKey, fx);
  }

  function rerenderAll() {
    renderAllStaticMarkers();
    renderHotels();
    buildDayList(activeDayId, fx, (id) => {
      activeDayId = id;
      renderActiveDay();
    });
    renderActiveDay();
  }

  // UI wiring
  fxInput.value = String(fx);
  fxInput.addEventListener("input", () => {
    fx = clampNumber(fxInput.value, 15000, 40000, DEFAULT_FX_VND_PER_USD);
    rerenderAll();
  });

  document.getElementById("tabB").addEventListener("click", () => {
    activeHotelGroupKey = "B";
    setActiveTab("B");
    renderHotels();
  });

  document.getElementById("tabC").addEventListener("click", () => {
    activeHotelGroupKey = "C";
    setActiveTab("C");
    renderHotels();
  });

  fitAllBtn.addEventListener("click", () => {
    const b = computeBounds(Object.keys(PLACES));
    if (b) map.fitBounds(b.pad(0.12));
  });

  buildBaseHotelPicker();
  setActiveTab(activeHotelGroupKey);
  rerenderAll();

  // Helps Leaflet render correctly when the mobile layout changes.
  window.addEventListener("resize", () => {
    map.invalidateSize({ animate: false });
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const host = document.getElementById("daySummary");
  if (host) host.textContent = String(err);
});
