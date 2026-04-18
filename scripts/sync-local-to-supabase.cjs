/**
 * Sync local safaris and destinations to Supabase
 * Run: node scripts/sync-local-to-supabase.cjs
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Safari data (16 safaris)
const safaris = [
  { id: "2-days-masai-mara", title: "2 Days Masai Mara From Nairobi", location: "Maasai Mara National Reserve", duration: "2 Days / 1 Night", price: 500, rating: 4.8, reviews: 100, image: "/images/maasai-mara-real.webp", description: "A two-day trip to the Maasai Mara can be a thrilling experience! Your days here will be filled with game drives, tracking the big cats plus elephant, leopard, buffalo, giraffe, and plenty more – over 95 mammals make their home here.", highlights: ["Big Five Game Drives", "Mara River", "Savannah Sunsets", "Professional Driver Guide"], category: "Wildlife Safari", stripePriceId: "" },
  { id: "3-days-masai-mara", title: "3 Days Masai Mara Safari", location: "Maasai Mara National Reserve", duration: "3 Days / 2 Nights", price: 900, rating: 4.9, reviews: 12, image: "/images/maasai-mara-authentic.webp", description: "Masai Mara is one of the premier game reserves in Africa. This Kenya vacation, by road, takes you into the Great Rift Valley and onwards to the plains of the Mara. The accommodation is in quality safari lodges and the tour includes 4 exciting, fully private game drives.", highlights: ["Extended Game Drives", "Great Rift Valley Views", "Quality Lodge Accommodation", "4 Private Game Drives"], category: "Wildlife Safari", stripePriceId: "" },
  { id: "4-days-wildebeest-migration", title: "4 Days Wildebeest Migration Safari", location: "Masai Mara Game Reserve", duration: "4 Days / 3 Nights", price: 1600, rating: 5.0, reviews: 10, image: "/images/Wild beast migration 2.webp", description: "The Masai Mara is Kenya's finest and most outstanding wildlife sanctuary where gentle rolling grassland ensures animals are never out of sight. The sensation of the great wildebeest migration between July and October is unparalleled.", highlights: ["Great Migration Tracking", "River Crossings", "Predator Action", "Luxury Tented Camp"], category: "Wildlife Safari", stripePriceId: "" },
  { id: "5-days-mara-nakuru-naivasha", title: "5 Days Masai Mara, Lake Nakuru, Lake Naivasha", location: "Masai Mara, Lake Nakuru, Lake Naivasha", duration: "5 Days / 4 Nights", price: 1700, rating: 4.8, reviews: 10, image: "/images/beautiful-shot-three-cute-giraffes-field-with-trees-blue-sky.webp", description: "Experience the best of Kenya's wildlife! From the endless plains of Masai Mara to the pink flamingos of Lake Nakuru and the scenic beauty of Lake Naivasha. This tour covers three incredible destinations in one unforgettable journey.", highlights: ["Three Premium Parks", "Flamingo Viewing", "Boat Safari at Naivasha", "Rift Valley Exploration"], category: "Wildlife Safari", stripePriceId: "" },
  { id: "4-days-mara-nakuru-amboseli", title: "4 Days Masai Mara – Lake Nakuru-Amboseli Safari", location: "Masai Mara, Lake Nakuru, Amboseli", duration: "4 Days / 3 Nights", price: 1800, rating: 4.9, reviews: 100, image: "/images/olga-budko-bFmjyv5uiAU-unsplash.webp", description: "An action-packed circuit combining the predators of the Mara, the flamingos of Nakuru, and Amboseli's elephants beneath Kilimanjaro. Visit Lake Nakuru National Park known for fantastic array of bird-life including flamingos, and Amboseli famous for its massive elephants.", highlights: ["Three Premium Parks", "Flamingos & Rhinos", "Kilimanjaro Views", "Big Five"], category: "Wildlife Safari", stripePriceId: "" },
  { id: "4-days-mara-nakuru", title: "4 Days Masai Mara, Lake Nakuru Safari", location: "Nairobi, Masai Mara, Nakuru", duration: "4 Days / 3 Nights", price: 1800, rating: 4.8, reviews: 50, image: "/images/dawn-w-FmUx8z_Tz4A-unsplash.webp", description: "Split your adventure between the rich savannah plains of the Masai Mara and the flamingo-filled rift valley sanctuary of Lake Nakuru. You may spot buffalo, waterbuck, white rhino and the rare Rothschild's giraffe.", highlights: ["Big Cat Tracking", "Rift Valley Lakes", "Endangered Rhino Spotting", "Baboon Cliff Panorama"], category: "Wildlife Safari", stripePriceId: "" },
  { id: "6-days-mara-nakuru-amboseli", title: "6 Days Masai Mara, Lake Nakuru & Amboseli Safari", location: "Kenya Multipark", duration: "6 Days / 5 Nights", price: 1900, rating: 4.9, reviews: 100, image: "/images/amboseli-real.webp", description: "6 Days Mara Nakuru Amboseli Safari – Incredible holiday Tour package designed to match the modern traveler's safari delights. In 6-days you shall explore Masai Mara, Lake Nakuru, Amboseli and Tsavo West best known for un-believable wildlife encounters.", highlights: ["Extended Time in Parks", "Ultimate Big Five Route", "Diverse Ecosystems", "All Park Entrance Fees Included"], category: "Wildlife Safari", stripePriceId: "" },
  { id: "lake-nakuru-rhino-retreat", title: "Lake Elementaita", location: "Lake Nakuru, Kenya", duration: "2 Days / 1 Night", price: 850, rating: 4.8, reviews: 133, image: "/images/destiations/Lake Nakuru/lake elementaita.webp", description: "Experience the vibrant pink shores of Lake Nakuru, a sanctuary for endangered black and white rhinos and millions of flamingos.", highlights: ["Endangered Rhinos", "Flamingo Flocks", "Baboon Cliff Panorama"], category: "Wildlife Safari", stripePriceId: "price_1TDSApDpOZ9uljPI7dMRcShK" },
  { id: "lake-naivasha-boat-safari", title: "Lake Naivasha Boat Safari", location: "Lake Naivasha, Kenya", duration: "3 Days / 2 Nights", price: 920, rating: 4.8, reviews: 151, image: "/images/destiations/Lake%20Naivash/Sopa%20boat%20rides.webp", description: "Glide past hippos on a boat safari and walk alongside giraffes and zebras on Crescent Island in the Great Rift Valley.", highlights: ["Boat Safari", "Crescent Island Walk", "Hell's Gate Explore"], category: "Adventure Safari", stripePriceId: "price_1TDSAqDpOZ9uljPIxcWH53hR" },
  { id: "diani-beach-escape", title: "Diani Beach & Coast Escape", location: "Diani Beach, Kenya", duration: "6 Days / 5 Nights", price: 2100, rating: 4.9, reviews: 287, image: "/images/diani-beach-new.webp", description: "Unwind on the pristine white sands of Diani Beach with turquoise waters, Swahili culture, and tropical relaxation.", highlights: ["White Sand Beaches", "Snorkeling & Diving", "Swahili Cuisine"], category: "Beach Holiday", stripePriceId: "" },
  { id: "kenya-grand-circuit", title: "Kenya Grand Circuit (Mara, Nakuru, Amboseli)", location: "Kenya Multipark", duration: "10 Days / 9 Nights", price: 4200, rating: 4.9, reviews: 256, image: "/images/maasai-mara-authentic.webp", description: "The ultimate East African journey combining the magnificent Great Migration, the flamingo-ringed lakes, and the shadow of Kilimanjaro.", highlights: ["Three National Parks", "Big Five Guaranteed", "Ultimate Safari Experience"], category: "Wildlife Safari", stripePriceId: "" },
  { id: "mount-kenya-climbing-expedition", title: "Mount Kenya Climbing Expedition", location: "Mount Kenya, Kenya", duration: "6 Days / 5 Nights", price: 1550, rating: 4.8, reviews: 94, image: "/images/mount-kenya.webp", description: "Summit Point Lenana on Africa's second-highest peak, traversing through diverse moorlands and dramatic volcanic peaks.", highlights: ["Point Lenana Summit", "Alpine Scenery", "High-Altitude Trekking"], category: "Adventure", stripePriceId: "" },
  { id: "ol-pejeta-rhino-sanctuary", title: "Ol Pejeta Rhino Sanctuary", location: "Laikipia, Kenya", duration: "3 Days / 2 Nights", price: 1150, rating: 4.9, reviews: 112, image: "/images/maasai-mara.webp", description: "Visit the home of the world's last northern white rhinos and enjoy incredible sightings of chimpanzees and the Big Five.", highlights: ["Northern White Rhinos", "Chimpanzee Sanctuary", "Night Game Drives"], category: "Wildlife Safari", stripePriceId: "" },
  { id: "lamu-swahili-cultural-dhow", title: "Lamu Swahili Cultural & Dhow Safari", location: "Lamu Island, Kenya", duration: "5 Days / 4 Nights", price: 1350, rating: 4.7, reviews: 86, image: "/images/lamu-island.webp", description: "Step back in time in the UNESCO World Heritage town of Lamu. Experience Swahili culture, narrow alleys, and sunset dhow cruises.", highlights: ["Lamu Old Town", "Sunset Dhow Cruise", "Shela Beach Relaxation"], category: "Cultural Tour", stripePriceId: "" },
  { id: "hells-gate-cycling-adventure", title: "Hell's Gate & Naivasha Cycling Adventure", location: "Lake Naivasha, Kenya", duration: "2 Days / 1 Night", price: 650, rating: 4.8, reviews: 143, image: "/images/alex-ning-0OI3i8bqjkk-unsplash.webp", description: "Cycle alongside zebras and giraffes in Hell's Gate National Park before a relaxing boat ride on Lake Naivasha.", highlights: ["Park Cycling", "Gorge Exploration", "Boat Safari"], category: "Adventure", stripePriceId: "" },
  { id: "bwindi-gorilla-trekking", title: "Bwindi Gorilla Trekking (Uganda)", location: "Bwindi, Uganda", duration: "3 Days / 2 Nights", price: 1950, rating: 5.0, reviews: 64, image: "/images/bwindi-authentic.webp", description: "Trek through the dense Impenetrable Forest of Bwindi for a once-in-a-lifetime encounter with the majestic mountain gorillas.", highlights: ["Gorilla Trekking", "Primate Encounters", "Breathtaking Scenery"], category: "Wildlife Safari", stripePriceId: "" },
];

// Destination data
const destinations = [
  { id: "masai-mara", name: "Masai Mara National Reserve", country: "Kenya", description: "Kenya's premier wildlife sanctuary famous for the Great Migration and Big Five sightings.", image: "/images/maasai-mara-real.webp", safariCount: 8, story: "The Masai Mara is Kenya's finest and most outstanding wildlife sanctuary...", features: ["Great Migration", "Big Five", "Hot Air Balloon"] },
  { id: "serengeti", name: "Serengeti National Park", country: "Tanzania", description: "World-renowned endless plains hosting the largest terrestrial migration.", image: "/images/serengeti.webp", safariCount: 5, story: "The Serengeti ecosystem is one of the oldest on Earth...", features: ["Great Migration", "Big Cats", "Balloon Safari"] },
  { id: "zanzibar", name: "Zanzibar", country: "Tanzania", description: "Paradise island with pristine beaches, coral reefs, and rich Swahili culture.", image: "/images/zanzibar-beach.webp", safariCount: 2, story: "Zanzibar has been a crossroads of civilizations for centuries...", features: ["Beaches", "Spices", "Stone Town"] },
  { id: "amboseli", name: "Amboseli National Park", country: "Kenya", description: "Famous for its large elephant herds and stunning Kilimanjaro views.", image: "/images/amboseli-real.webp", safariCount: 4, story: "Amboseli lies at the foot of Africa's highest mountain...", features: ["Elephants", "Kilimanjaro Views", "Wetlands"] },
  { id: "lake-nakuru", name: "Lake Nakuru National Park", country: "Kenya", description: "Flamingo-filled rift valley lake and rhino sanctuary.", image: "/images/destiations/Lake Nakuru/lake elementaita.webp", safariCount: 3, story: "Lake Nakuru is a shallow alkaline lake in the Rift Valley...", features: ["Flamingos", "Rhinos", "Bird Sanctuary"] },
  { id: "tsavo", name: "Tsavo National Park", country: "Kenya", description: "Africa's largest park complex with red elephants and rugged landscapes.", image: "/images/tsavo.webp", safariCount: 2, story: "Tsavo is the wild Africa that exists in your imagination...", features: ["Red Elephants", "Mzima Springs", "Volcanic Landscape"] },
];

async function syncSafaris() {
  console.log(`\n📦 Syncing ${safaris.length} safaris...`);
  
  for (const safari of safaris) {
    const payload = {
      id: safari.id,
      title: safari.title,
      location: safari.location,
      duration: safari.duration,
      price: safari.price,
      rating: safari.rating,
      reviews: safari.reviews,
      image: safari.image,
      description: safari.description,
      highlights: safari.highlights,
      category: safari.category,
      stripe_price_id: safari.stripePriceId || '',
    };

    const { error } = await supabase.from('safaris').upsert(payload);
    if (error) {
      console.error(`  ❌ ${safari.id}: ${error.message}`);
    } else {
      console.log(`  ✅ ${safari.title}`);
    }
  }
}

async function syncDestinations() {
  console.log(`\n🌍 Syncing ${destinations.length} destinations...`);
  
  for (const dest of destinations) {
    const payload = {
      id: dest.id,
      name: dest.name,
      country: dest.country,
      description: dest.description,
      image: dest.image,
      safari_count: dest.safariCount || 0,
    };

    const { error } = await supabase.from('destinations').upsert(payload);
    if (error) {
      console.error(`  ❌ ${dest.id}: ${error.message}`);
    } else {
      console.log(`  ✅ ${dest.name}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting sync to Supabase...\n');
  
  try {
    await syncSafaris();
    await syncDestinations();
    
    console.log('\n✨ Sync complete! Admin and user sides now use the same data.');
    console.log('   Any changes in admin will reflect on user side automatically.');
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

main();