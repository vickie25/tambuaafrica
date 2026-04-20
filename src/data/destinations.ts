export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  story?: string;
  features?: string[];
  image: string;
  images?: string[];
  safariCount: number;
}

export const destinations: Destination[] = [
  {
    id: "tsavo",
    name: "Tsavo National Park",
    country: "Kenya",
    description:
      "A vast red-earth wilderness comprising Tsavo East and West, famous for its 'red elephants', the Mzima Springs, and rugged volcanic landscapes.",
    story:
      "Tsavo is the wild Africa that exists in your imagination—vast, untamed, and refreshingly free from the complexities of tourism infrastructure. This colossal park draws you into genuine frontier territory where red dust hangs in the air like an ancient signature, where enormous bull elephants roam freely, and where your game drive might reveal lions that have never seen a tourist vehicle before.",
    features: [
      "Africa's largest park complex: Tsavo East and West combine to create over 20,000 km² of pristine wilderness",
      "Red elephant phenomenon: Famous red dust covers both elephants and landscape, creating striking safari photographs",
      "Ancient volcanic landscape: Chyulu Hills, lava flows, and underground springs create dramatic geological formations",
      "Remote and undisturbed: Far from tourist crowds, offering genuine wilderness experiences",
    ],
    image: "/images/destiations/Tsavo/voi safari lodge4.webp",
    images: [
      "/images/destiations/Tsavo/voi safari lodge4.webp",
      "/images/destiations/Tsavo/Chilling kilaguni serena lodge.webp",
      "/images/destiations/Tsavo/Kilaguni serena safari lodge food sfood.webp",
      "/images/destiations/Tsavo/Kilaguni lodge.webp",
    ],
    safariCount: 5,
  },
  {
    id: "masai-mara",
    name: "Maasai Mara",
    country: "Kenya",
    description:
      "The world-renowned home of the Great Migration, offering the highest density of predators and breath-taking savannah vistas.",
    story:
      "Masai Mara stands as the crown jewel of African safaris, where the rhythm of nature beats in thunderous hoofbeats and golden dust clouds. Each year, the phenomenon of the Great Migration transforms the landscape into a living stage where survival hangs in the balance—thousands of wildebeest and zebras navigate crocodile-filled rivers while prides of lions watch from the grasslands. The Mara's amber plains stretch endlessly beneath impossibly vast African skies, where every game drive reveals a new chapter: a cheetah sprint at dawn, a rare leopard in an acacia tree, or a family of elephants moving serenely through the bush.",
    features: [
      "The Great Migration: Witness up to 1.5 million wildebeest, zebras, and gazelles crossing the Mara River in the spectacle of nature's most dramatic annual event",
      "Exceptional predator viewing: One of Africa's highest concentrations of lions, leopards, and cheetahs—ideal for photography and wildlife encounters",
      "Pristine ecosystem: Covers 1,510 square kilometers of intact savannah with diverse habitats from riverine forests to open plains",
      "Maasai cultural immersion: Home to the Maasai people, offering authentic visits to traditional warrior bomas and insights into pastoral life",
    ],
    image: "/images/destiations/Maasai Mara/masai mara sopa lodge.webp",
    images: [
      "/images/destiations/Maasai Mara/masai mara sopa lodge.webp",
      "/images/destiations/Maasai Mara/bonfire marariver.webp",
      "/images/destiations/Maasai Mara/Mara river standard lodge.webp",
    ],
    safariCount: 6,
  },
  {
    id: "samburu",
    name: "Samburu National Reserve",
    country: "Kenya",
    description:
      "A rugged northern frontier known for rare wildlife species, the Ewaso Ng'iro River, and the vibrant Samburu culture.",
    story:
      "Samburu is Kenya's northern secret — a semi-desert landscape where the Ewaso Ng'iro River cuts a ribbon of improbable green through the heat shimmer, and where wildlife evolution has taken its own remarkable path. The animals here exist nowhere else on Earth in the same combination, shaped by millions of years of adaptation to this precise, beautiful harshness.",
    features: [
      "Samburu Special Five: Grevy's zebra, reticulated giraffe, gerenuk, Somali ostrich, and Beisa oryx — all endemic to this region",
      "Ewaso Ng'iro River: Permanent water source creating dense wildlife corridors with crocodile, hippo, and 350+ bird species",
      "Remote northern wilderness: Far fewer visitors than southern parks, delivering authentic encounters",
      "Samburu culture: One of Kenya's most vivid indigenous communities, famed for beadwork, ochre, and warrior traditions",
    ],
    image: "/images/destiations/Samburu/Saruni.webp",
    images: [
      "/images/destiations/Samburu/Saruni.webp",
      "/images/destiations/Samburu/Sopa lodge.webp",
      "/images/destiations/Samburu/Game drive samburu lodge river side.webp",
    ],
    safariCount: 4,
  },
  {
    id: "nakuru",
    name: "Lake Nakuru National Park",
    country: "Kenya",
    description:
      "A sanctuary for rhinos and flamingos set against the backdrop of the Great Rift Valley, featuring dramatic escarpments and acacia woodlands.",
    story:
      "Lake Nakuru turns pink at dawn — not from the light, but from the flamingos. Millions of them sometimes ring the lake's edges in an unbroken coral necklace, so dense and so vivid that first-time visitors literally stop breathing. Behind this spectacle, rhinos graze on the hillside above, leopards move between the yellow fever trees, and the Great Rift Valley escarpment frames everything in geological magnificence.",
    features: [
      "Lake Nakuru flamingos: Up to 2 million pink flamingos can ring the lake simultaneously in one of the world's greatest ornithological spectacles",
      "Rhino sanctuary: Both endangered black and southern white rhinos find refuge in the park's protected sanctuary",
      "Rift Valley setting: Set within Africa's Great Rift Valley, surrounded by dramatic escarpment scenery",
      "Rothschild's giraffe: One of Africa's rarest giraffe subspecies thrives in this park",
    ],
    image: "/images/destiations/Lake Nakuru/Ziwa bush lodge rooms.webp",
    images: [
      "/images/destiations/Lake Nakuru/Ziwa bush lodge rooms.webp",
      "/images/destiations/Lake Nakuru/Lake Nakutu lodge.webp",
      "/images/destiations/Lake Nakuru/ziwa lodge ambience.webp",
      "/images/destiations/Lake Nakuru/Ziwa bush lodge night view.webp",
    ],
    safariCount: 5,
  },
  {
    id: "naivasha",
    name: "Lake Naivasha",
    country: "Kenya",
    description:
      "A beautiful freshwater lake in the Rift Valley, perfect for boat safaris, birdwatching, and exploring Crescent Island.",
    story:
      "Lake Naivasha is where the Rift Valley exhales. After the drama of Nakuru's flamingos and the red dust of Tsavo, Naivasha offers the lushness and cool that only 1,800 metres of altitude and a freshwater lake can provide. Hippos graze the lawn at dusk, eagles soar over papyrus beds, and the cycling trail through Hell's Gate — where geothermal steam vents beside a gorge that could swallow a city block — is unlike anything else in Kenya.",
    features: [
      "Freshwater Rift Valley lake: Africa's only major freshwater lake in the Rift Valley, surrounded by papyrus and fever trees",
      "Hell's Gate National Park: Unique cycling-inside-the-park experience through gorges and hot springs",
      "Crescent Island: Walking safari among zebra, giraffe, and wildebeest on an island within the lake",
      "Hippo herds: One of Kenya's densest hippo populations, viewable by boat at close range",
    ],
    image: "/images/destiations/Lake Naivasha/Sopa resort.webp",
    images: [
      "/images/destiations/Lake Naivasha/Sopa resort.webp",
      "/images/destiations/Lake Naivasha/Sopa boat rides.webp",
      "/images/destiations/Lake Naivasha/Kongoni lodge.webp",
    ],
    safariCount: 4,
  },
  {
    id: "amboseli",
    name: "Amboseli National Park",
    country: "Kenya",
    description:
      "Famous for its large elephant herds and the most iconic views of Mount Kilimanjaro towering over the plains.",
    story:
      "Amboseli National Park is where Africa's most iconic peak meets Africa's most magnificent giants, creating a landscape of timeless beauty and raw wilderness. The snow-capped crown of Mount Kilimanjaro dominates the horizon, a constant sentinel over fields of red dust where earth-toned elephant herds move with ancient grace.",
    features: [
      "Mount Kilimanjaro backdrop: Stunning views of Africa's highest peak (5,895m) framed by elephant herds, creating iconic photography opportunities",
      "Africa's finest elephant viewing: Over 1,600 elephants concentrate around wetlands, providing unparalleled observation experiences",
      "Volcanic geology: Ancient lava flows and ash deposits create the park's distinctive gray landscape and nutrient-rich wetlands",
      "Ol Tukai wetlands: Swampy groundwater-fed oasis supporting dense wildlife concentrations in otherwise arid terrain",
    ],
    image: "/images/destiations/Ambosel/Tawi lodge.webp",
    images: [
      "/images/destiations/Ambosel/Tawi lodge.webp",
      "/images/destiations/Ambosel/Oloitukai.webp",
      "/images/destiations/Ambosel/kibo.webp",
    ],
    safariCount: 5,
  },
  {
    id: "diani",
    name: "Diani Beach",
    country: "Kenya",
    description:
      "Voted regularly as Africa's leading beach destination, Diani Beach is a stunning tropical paradise boasting endless stretches of powdery white sand, swaying palms, and warm, crystal-clear turquoise waters. Dive into vibrant coral reefs, indulge in rich Swahili culture, and unwind in world-class resorts along the spectacular Kenyan coast.",
    image: "/images/diani-beach-coast.webp",
    images: [
      "/images/diani-beach-coast.webp",
      "/images/diani-beach.webp",
      "/images/diani-beach-new.webp",
      "/images/diani-extra-1.png",
      "/images/diani-extra-2.png",
      "/images/deckchair-beach.webp",
    ],
    safariCount: 2,
  },
  {
    id: "chale-island",
    name: "Chale Island",
    country: "Kenya",
    description:
      "A breathtaking private coral island rising from the turquoise Indian Ocean off Diani Beach — Kenya's most exclusive island escape, accessible only by boat.",
    story:
      "Chale Island is Kenya's best-kept coastal secret — a coral jewel adrift in the glittering Indian Ocean, separated from the rest of the world by five minutes of blue water. The island wears its age lightly: ancient coral rock formations frame a modern luxury retreat where the heart-shaped infinity pool becomes less a amenity than a statement of intent. Each dawn brings new sea turtle sightings in the shallows, each dusk a sunset that sets the Indian Ocean on fire. Dining here, with bare feet in the sand and fresh Swahili seafood on the table, is as close to paradise as East Africa gets.",
    features: [
      "Private coral island: A 10-acre paradise rising from the Indian Ocean, accessible exclusively by motorboat — total seclusion from the mainland",
      "Iconic heart-shaped infinity pool: Carved into the coral cliff edge with a jaw-dropping drop into the turquoise sea below",
      "World-class marine biodiversity: A pristine house reef supports sea turtles, dolphins, over 200 coral fish species, and vibrant coral gardens",
      "Swahili-Arabic heritage architecture: Hand-carved timber, painted tiles, and ocean-facing verandas echo centuries of coastal craftsmanship",
    ],
    image: "/images/Chale Island.webp",
    images: [
      "/images/Chale Island.webp",
      "/images/chale Hotel.webp",
      "/images/chale-extra-1.webp",
      "/images/chale-extra-2.webp",
      "/images/chale-extra-3.webp",
    ],
    safariCount: 1,
  },
  {
    id: "watamu",
    name: "Watamu",
    country: "Kenya",
    description:
      "A pristine coastal paradise north of Mombasa, where the Indian Ocean meets Kenya's most spectacular marine park — famous for coral reefs, sea turtles, world-class game fishing, and warm turquoise waters.",
    story:
      "Watamu is where Kenya's coast reveals its most untouched face. The town sits between two of the country's greatest natural treasures — a marine park of extraordinary coral richness and a coastal forest that predates recorded history. Sport fishing boats leave at dawn in search of world-record marlin; by mid-morning the reef is alive with snorkelers chasing sea turtles through coral gardens. The pace here is dictated entirely by the Indian Ocean: slow when the tide is out, unhurried when it's in, and always accompanied by the kind of light that makes every moment feel golden.",
    features: [
      "Watamu Marine National Park: One of Kenya's most biodiverse marine reserves — pristine coral gardens, whale sharks, manta rays, and nesting sea turtles",
      "World-class game fishing: Blue-water fisheries ranked among Africa's best for marlin, sailfish, wahoo, and yellowfin tuna",
      "Arabuko-Sokoke Forest: Adjacent to Africa's largest coastal forest — home to rare elephants, golden-rumped elephant shrews, and 230+ bird species",
      "Watamu Beach: A sweeping arc of white sand with warm, calm turquoise waters sheltered by a natural bay — one of Kenya's most beautiful beaches",
    ],
    image: "/images/watamu-beach.webp",
    images: [
      "/images/watamu-beach.webp",
      "/images/watamu-hotel.webp",
      "/images/watamu-bay.webp",
    ],
    safariCount: 1,
  },
  {
    id: "wasini",
    name: "Wasini Island",
    country: "Kenya",
    description:
      "A serene, vehicle-free coral island off Kenya's southern coast. Gateway to Kisite Mpunguti Marine Park, offering spectacular dolphin spotting, pristine snorkeling, and authentic Swahili culture.",
    story:
      "Wasini Island forces you to slow down. The moment you step off the boat onto its sandy paths, time seems to stretch. There are no engines here—only the rustle of wind through massive baobab trees and the lap of the ocean against coral cliffs. Days are spent sailing out on traditional dhows to Kisite Mpunguti, sliding into warm waters to swim alongside pods of playful dolphins, and returning to mainland to feast on Swahili seafood platters. It's a glimpse into the Kenyan coast as it was centuries ago.",
    features: [
      "Kisite Mpunguti Marine Park: Simply the best snorkeling and diving in Kenya, heavily populated with resident dolphins and untouched coral.",
      "Traditional dhow sailing: The only way to access the marine park is via traditional wooden dhows, preserving ancient seafaring culture.",
      "Vehicle-free serenity: Wasini has zero cars and zero paved roads, offering a completely undisturbed island experience.",
      "Swahili culture & cuisine: Known for its ancient ruins, Baobab trees, and phenomenal fresh crab and coconut rice dishes.",
    ],
    image: "/images/wasini-island-1.webp",
    images: [
      "/images/wasini-island-1.webp",
      "/images/wasini-island-2.webp",
    ],
    safariCount: 1,
  },
  {
    id: "mombasa-north-coast",
    name: "Mombasa North Coast",
    country: "Kenya",
    description:
      "A vibrant stretch of white sandy beaches along the Indian Ocean, featuring lively resorts, historical sites like Fort Jesus, and excellent warm-water marine life.",
    story:
      "The North Coast of Mombasa vibrates with energy. It's the classic Kenyan beach holiday: wide shores lined with whispering palms leading down to the impossibly warm Indian Ocean. Here, mornings might involve windsurfing across the reef, while afternoons are for exploring the ancient, spice-scented alleyways of Mombasa's Old Town or diving into the history of Fort Jesus. As the sun sets, the resorts come alive, offering a perfect blend of Swahili hospitality and international luxury right on the water's edge.",
    features: [
      "Pristine Beaches: Long stretches of white sand including Nyali, Bamburi, and Shanzu beaches right on the warm Indian Ocean edge.",
      "Vibrant Resort Culture: Home to Kenya's most lively and entertaining coastal resorts with extensive pools and watersports.",
      "Mombasa Marine National Park: Incredible snorkeling and glass-bottom boat tours exploring rich coral gardens just offshore.",
      "Historic Mombasa Town: Easy access to the 16th-century Fort Jesus, the iconic Mombasa Tusks, and the bustling Old Town.",
    ],
    image: "/images/mombasa-north-1.webp",
    images: [
      "/images/mombasa-north-1.webp",
      "/images/mombasa-north-2.webp",
      "/images/mombasa-north-3.webp",
    ],
    safariCount: 1,
  },
];
