// destinations-lodges.ts - Curated destination lodges with local images

export interface Lodge {
  id: string;
  name: string;
  category: "luxury" | "mid-range" | "budget" | "camp";
  description: string;
  story: string;
  features: string[];
  image: string;
  images?: string[];
  website?: string;
}

export interface DestinationLodges {
  destinationId: string;
  destinationName: string;
  lodges: Lodge[];
}

export const destinationLodges: DestinationLodges[] = [
  {
    destinationId: "tsavo",
    destinationName: "Tsavo",
    lodges: [
      {
        id: "ngutuni-lodge",
        name: "Ngutuni Lodge",
        category: "mid-range",
        description: "Nestled in a private 10,000-acre game sanctuary surrounded on three sides by Tsavo East National Park, Ngutuni Lodge sits against the spectacular backdrop of the Sagala Hills. The lodge overlooks a highly active, softly illuminated waterhole that draws elephants, short-maned lions, zebras, and giraffes day and night.",
        story: "Ngutuni is where Tsavo's magic becomes personal. Built from large timber poles with plunging thatched roofs and waxed timber decking, the lodge blends traditional African design with every modern comfort. Each of the 48 en-suite rooms faces the waterhole, so wildlife encounters happen from your private balcony with a cold drink in hand.",
        features: [
          "Private 10,000-acre game sanctuary surrounded on three sides by Tsavo East",
          "Exclusive night game drives not permitted inside the national park",
          "24/7 illuminated waterhole drawing Big Five and 500+ bird species",
          "48 en-suite rooms with waterhole-facing private balconies",
          "20 minutes from Voi SGR train station,  convenient from Nairobi or Mombasa",
        ],
        image: "/images/destiations/Tsavo/ngutuni.webp",
        images: [
          "/images/destiations/Tsavo/ngutuni.webp",
          "/images/destiations/Tsavo/Ngutuni loudge enviroment.webp",
          "/images/destiations/Tsavo/ngutuni lodge rooms.webp",
        ],
        website: "https://tsavo-lodges.co.ke/",
      },
      {
        id: "voi-safari-lodge",
        name: "Voi Safari Lodge",
        category: "mid-range",
        description: "Strategically situated inside the Tsavo East National Park, Voi Safari Lodge is one of the most innovatively conceived wildlife retreats in Kenya. Offering panoramic views of the park from every corner, three illuminated waterholes, and a spherical restaurant, it combines comfort with spectacular wildlife encounters.",
        story: "Voi Safari Lodge stands high above the town of Voi, overlooking a vast expanse of the African bush. Its iconic underground wildlife photo hide, Mudanda Rock sundowner dinners, and three day-and-night waterholes make it one of Tsavo's most complete safari experiences,  accessible from Nairobi, Mombasa, or by the SGR train.",
        features: [
          "53 park-facing modern interconnecting rooms with lounge area",
          "Underground wildlife photo hide for intimate animal photography",
          "Three waterholes offering continuous day and night wildlife drama",
          "Sundowner dinners atop the iconic Mudanda Rock",
          "Swimming pool, 3 bars, main spherical restaurant with park panorama",
          "Access to Lugard Falls, Yatta Plateau (world's longest lava flow), Aruba Dam",
        ],
        image: "/images/destiations/Tsavo/Voi safari lodge3.webp",
        images: [
          "/images/destiations/Tsavo/Voi safari lodge3.webp",
          "/images/destiations/Tsavo/voi safari lodge4.webp",
          "/images/destiations/Tsavo/Rooms voi lodge.webp",
          "/images/destiations/Tsavo/voi lodge swimming pool.webp",
          "/images/destiations/Tsavo/voi ambience.webp",
        ],
        website: "https://voisafarilodge.com/",
      },
      {
        id: "red-elephant-lodge",
        name: "Red Elephant Lodge",
        category: "budget",
        description: "Positioned just 700 metres from Voi Gate,  the main entrance to Tsavo East National Park,  Red Elephant Safari Lodge sits on six acres of untouched wilderness with unobstructed views directly into the national park. Named for Tsavo's iconic crimson-dusted bull elephants.",
        story: "Red Elephant Lodge channels Tsavo's rugged authenticity,  traditional stone and timber bush houses with four-poster beds draped in mosquito nets, campfires glowing in a central pit while traditional Kenyan tribal dancers perform beneath the stars. It's not glamour,  it's the real Tsavo: raw, red, and unforgettable.",
        features: [
          "Located 700m from Voi Gate with direct views into Tsavo East",
          "Bush houses with four-poster beds and waterhole-facing verandas",
          "Nightly campfire with traditional multi-tribal dance performances",
          "Six acres of private wilderness for free wildlife observation",
          "Tsavo East Airstrip just 2 km away for fly-in guests",
        ],
        image: "/images/destiations/Tsavo/Red Elephant lodge.webp",
        images: [
          "/images/destiations/Tsavo/Red Elephant lodge.webp",
          "/images/destiations/Tsavo/Elephants at red elephant lodge.webp",
          "/images/destiations/Tsavo/red elephant lodge rooms.webp",
        ],
        website: "https://redelephantlodge.com/",
      },
      {
        id: "kilaguni-serena",
        name: "Kilaguni Serena Safari Lodge",
        category: "luxury",
        description: "The first lodge ever built inside a Kenyan national park, Kilaguni Serena Safari Lodge stands in Tsavo West framed by Mount Kilimanjaro and the rolling Chyulu Hills. Built entirely from volcanic stone with thatched roofs, its 56 rooms all face a wildlife-rich waterhole. Kenya's first fully solar-powered lodge.",
        story: "To stand at Kilaguni's stone-built bar watching elephants wade into the waterhole as Kilimanjaro turns pink at dusk is to understand why this lodge has remained iconic since 1962. The volcanic terrain,  lava flows, Mzima Springs, the eerie Shetani Caves,  creates a landscape unlike anywhere else in Kenya.",
        features: [
          "Kenya's first national park lodge, opened 1962,  now fully solar-powered",
          "Wildlife-rich waterhole with elephants, buffalo and lion daily",
          "Lion Rock private sundowner experience above the historic plains",
          "Proximity to Mzima Springs, Shetani Lava Flow & Caves",
          "56 volcanic stone rooms with Kilimanjaro and Chyulu Hills views",
          "Conference facilities and bush dining experiences",
        ],
        image: "/images/destiations/Tsavo/Kilaguni lodge.webp",
        images: [
          "/images/destiations/Tsavo/Kilaguni lodge.webp",
          "/images/destiations/Tsavo/Kilaguni outside.webp",
          "/images/destiations/Tsavo/Kilaguni HOTEL ROOM.webp",
          "/images/destiations/Tsavo/Chilling kilaguni serena lodge.webp",
          "/images/destiations/Tsavo/Kilaguni serena safari lodge food sfood.webp",
        ],
        website: "https://www.serenahotels.com/kilaguni",
      },
      {
        id: "salt-lick-safari-lodge",
        name: "Salt Lick Safari Lodge",
        category: "luxury",
        description: "One of the world's most photographed safari lodges, Salt Lick sits on stilts inside the Taita Hills Wildlife Sanctuary adjacent to Tsavo West. Its 96 circular elevated rooms are connected by suspended walkways above floodlit waterholes where elephants, buffalo, and lion pass literally beneath your feet.",
        story: "Salt Lick Safari Lodge is architectural theatre built around nature's own performance. Its underground tunnel leading to a sunken waterhole hide gives guests a ground-level perspective no safari vehicle can replicate. Salt Lick plants a tree for every guest who stays,  weaving conservation directly into hospitality.",
        features: [
          "96 circular stilted rooms with waterhole-facing balconies",
          "Underground waterhole hide for ground-level wildlife photography",
          "Floodlit waterholes for nocturnal elephant and predator viewing",
          "Set in Taita Hills Wildlife Sanctuary,  UNESCO Eastern Arc biodiversity hotspot",
          "Tree-planting conservation program: one tree per guest stay",
        ],
        image: "/images/destiations/Tsavo/Salt lick lodge.webp",
        images: [
          "/images/destiations/Tsavo/Salt lick lodge.webp",
          "/images/destiations/Tsavo/Salt lick1.webp",
          "/images/destiations/Tsavo/Salt lick rooms.webp",
          "/images/destiations/Tsavo/Salt lick chilling.webp",
        ],
        website: "https://saltlicksafarilodge.com/",
      },
    ],
  },

  {
    destinationId: "masai-mara",
    destinationName: "Maasai Mara",
    lodges: [
      {
        id: "mara-sopa-lodge",
        name: "Mara Sopa Lodge",
        category: "mid-range",
        description: "Located high on the slopes of the Oloolaimutia Hills, Mara Sopa Lodge was one of the first lodges built in the Maasai Mara Game Reserve. Its buildings follow the design of traditional African round houses with conical roofs, lush mature gardens, and a commanding position that places guests in prime Migration territory.",
        story: "Mara Sopa Lodge is where Maasai Mara's legend becomes livable. Its circular dining room hosts the Africa Night food extravaganza, blending traditional dishes with creative flair as warriors perform outside under the stars. The hilltop position means game drives roll directly into prime Migration territory at first light.",
        features: [
          "Located high on Oloolaimutia Hills with panoramic Mara savannah views",
          "One of the first safari lodges built in Maasai Mara Game Reserve",
          "99 rooms including honeymoon suite, 12 suites & 4 interconnecting rooms",
          "Traditional African round house design with conical roofs",
          "Conference room for 70 people, outdoor boma dining area",
          "Game drives, bush dining, hot air balloon safaris available",
        ],
        image: "/images/destiations/Maasai Mara/masai mara sopa lodge.webp",
        images: ["/images/destiations/Maasai Mara/masai mara sopa lodge.webp"],
        website: "https://www.sopalodges.com/masai-mara-sopa-lodge/the-lodge",
      },
      {
        id: "emaiyan-luxury-camp",
        name: "Emaiyan Luxury Camp",
        category: "luxury",
        description: "Emaiyan Luxury Camp is located at the hills of Ololaimutiek conservancy, just 1km from the Gate of the Great Maasai Mara National Reserve. The name Emaiyan means 'blessings' in Maa,  the Maasai language,  and the camp delivers exactly that with personalized service and exclusive experiences.",
        story: "Emaiyan greets each guest with tailored experiences from arrival to departure. The Big 5 Steakhouse, Warriors Bar with award-winning mixologist, and champagne bush breakfasts at Kichakani Restaurant make every meal an event. Outdoor jacuzzis and private dining verandas complete the picture of exclusive luxury in the Mara.",
        features: [
          "Located 1km from Maasai Mara Gate in Ololaimutiek conservancy",
          "Accommodation: Zebra Deluxe Tents, Elephant Junior Suites, King Lions Suites",
          "Outdoor jacuzzi, kingsize beds, ensuite bathrooms in every room",
          "Big 5 Steakhouse Restaurant with fine dining cuisines",
          "The Warriors Bar with Award Winning Mixologist",
          "All-inclusive accommodation with complimentary drinks",
        ],
        image: "/images/destiations/Maasai Mara/Emaiyan camp.webp",
        images: [
          "/images/destiations/Maasai Mara/Emaiyan camp.webp",
          "/images/destiations/Maasai Mara/Emaiyan camp1.webp",
          "/images/destiations/Maasai Mara/Emaiyan camp 3.webp",
          "/images/destiations/Maasai Mara/Emayian camp.webp",
        ],
        website: "https://emayiancamp.com/",
      },
      {
        id: "jambo-mara-safari-lodge",
        name: "Jambo Mara Safari Lodge",
        category: "mid-range",
        description: "Jambo Mara Safari Lodge offers comfortable accommodation inside the Maasai Mara National Reserve with professional guided game drives, warm Kenyan hospitality, and a central position providing easy access to the reserve's most productive wildlife zones across all seasons.",
        story: "Jambo,  the Swahili word for hello,  perfectly captures this lodge's spirit of welcome. Morning mist rises over golden grass, the distant grunt of hippos echoes from the river, and the barely-contained excitement of your guide reviewing the day's sightings before you've finished breakfast is part of the package.",
        features: [
          "Central Maasai Mara location with year-round access to Big Five territory",
          "Professional naturalist guides with deep local knowledge",
          "Swimming pool, fitness facilities and entertainment area",
          "Hot air balloon safari packages for aerial Migration viewing",
          "Cultural Maasai village visits and warrior encounters",
        ],
        image: "/images/destiations/Maasai Mara/jambomara.webp",
        images: [
          "/images/destiations/Maasai Mara/jambomara.webp",
          "/images/destiations/Maasai Mara/Jambo mara swimming pool.webp",
          "/images/destiations/Maasai Mara/Jambo mara entertainment and fitness.webp",
        ],
        website: "https://jambomara.com/",
      },
      {
        id: "mara-river-lodge",
        name: "Mara River Lodge",
        category: "luxury",
        description: "Positioned directly on the banks of the Mara River, this lodge offers a front-row seat to the world's most dramatic natural event: the wildebeest crossing. Guests watch crocodile-patrolled waters part beneath thundering hooves from private viewing decks and comfortable riverside rooms.",
        story: "From Mara River Lodge's riverside decks, you hear the crossing before you see it: a distant thunder that builds into a roar, followed by the spray of ten thousand wildebeest launching into crocodile water simultaneously. Between crossings, hippos surface at dusk, fish eagles cry overhead, and the forest trembles with leopard possibility.",
        features: [
          "Direct Mara River frontage for private wildebeest crossing viewing",
          "Riverside observation decks with unobstructed migration views",
          "Expert guides specializing in river ecosystem and migration patterns",
          "Family rooms and standard lodge rooms available",
          "Nightly bonfires and cultural performances on the riverbank",
        ],
        image: "/images/destiations/Maasai Mara/Mara river standard lodge.webp",
        images: [
          "/images/destiations/Maasai Mara/Mara river standard lodge.webp",
          "/images/destiations/Maasai Mara/family srrons mara river.webp",
          "/images/destiations/Maasai Mara/bonfire marariver.webp",
        ],
        website: "https://marariverlodge.co.ke/",
      },
    ],
  },

  {
    destinationId: "samburu",
    destinationName: "Samburu",
    lodges: [
      {
        id: "samburu-sopa-lodge",
        name: "Samburu Sopa Lodge",
        category: "mid-range",
        description: "Built atop high ground inside the Samburu National Reserve, Samburu Sopa Lodge commands panoramic views of the vast shrubland, Mount Ololokwe, and the distant Mathews Range. Its 60 rooms spread across 30 traditional cottages inspired by the centuries-old architecture of Samburu manyattas.",
        story: "Samburu Sopa Lodge sits at the spiritual intersection of science and culture. By day the northern Kenya wildlands produce encounters with the Samburu Special Five found nowhere else on Earth; by night the dark, unpolluted skies turn every evening into a celestial event. It's a lodge that makes you feel small in the most life-affirming way.",
        features: [
          "Panoramic views of Samburu shrubland, Mount Ololokwe, and Mathews Range",
          "Exclusive access to the Samburu Special Five wildlife",
          "60 rooms in locally-designed cottages with verandas",
          "Swimming pool with sunken bar and Ewaso Ng'iro valley views",
          "Game drives, cultural visits, and guided bush walks",
        ],
        image: "/images/destiations/Samburu/Sopa lodge.webp",
        images: ["/images/destiations/Samburu/Sopa lodge.webp"],
        website: "https://www.sopalodges.com/samburu-sopa-lodge/the-lodge",
      },
      {
        id: "samburu-riverside-camp",
        name: "Samburu Riverside Camp",
        category: "mid-range",
        description: "Located in the heart of the Samburu National Reserve close to the mighty Ewaso Ng'iro River, Samburu Riverside Camp offers an eco-friendly natural environment brimming with birds, elephants, vervet monkeys and all of Kenya's rare northern species.",
        story: "The Ewaso Ng'iro River is Samburu's lifeline,  a green ribbon of impossible lushness running through a semi-arid landscape. This area was featured in the award-winning film Born Free and was home to Kamunyak, the famous lioness who adopted oryx calves. The camp's 6 tents sit right at this historic margin.",
        features: [
          "6 tents (3 deluxe, 3 standard) with en-suite bathrooms and outside seating",
          "24-hour solar powered lighting and charging stations",
          "Rich in rare northern species: Grevy Zebra, Reticulated Giraffe, Gerenuk, Beisa Oryx",
          "Best place in Kenya to spot leopards; over 450 bird species",
          "Activities: Cultural visits, river walks, game drives",
        ],
        image: "/images/destiations/Samburu/Samburu Riverside camp.webp",
        images: [
          "/images/destiations/Samburu/Samburu Riverside camp.webp",
          "/images/destiations/Samburu/Samburu Ruverside relaxing.webp",
          "/images/destiations/Samburu/Game drive samburu lodge river side.webp",
        ],
        website: "https://www.sambururiversidecamp.com/",
      },
      {
        id: "saruni-samburu",
        name: "Saruni Samburu",
        category: "luxury",
        description: "Saruni Samburu has achieved iconic status for its stunning setting and the way authentic Samburu culture and community conservation have been woven into the luxury safari experience. As the pioneer lodge in the community-owned Kalama Wildlife Conservancy, it paved the way for ecotourism in northern Kenya.",
        story: "Consisting of just six guest villas, the lodge offers sweeping vistas over the unparalleled landscapes of northern Kenya. With access to both the Samburu National Reserve and the Kalama Conservancy, Saruni offers encounters with legendary elephant herds and endangered species including the Samburu Special Five.",
        features: [
          "Six luxury villas with spectacular views over Kenya's Northern Frontier",
          "Access to both Samburu National Reserve and Kalama Conservancy",
          "Community-based ecotourism pioneer in northern Kenya",
          "Two single villas and two family villas with separate entrances",
          "Cultural insights and community engagement programs",
          "Intimate bonfires and Mount Kenya view sundowners",
        ],
        image: "/images/destiations/Samburu/Saruni camp.webp",
        images: [
          "/images/destiations/Samburu/Saruni camp.webp",
          "/images/destiations/Samburu/Saruni.webp",
          "/images/destiations/Samburu/Saruni ambience.webp",
          "/images/destiations/Samburu/Saruni mountkenya view.webp",
          "/images/destiations/Samburu/Saruni Bonfire.webp",
        ],
        website: "https://sarunibasecamp.com/our-properties/saruni-samburu/",
      },
      {
        id: "sasaab-lodge",
        name: "Sasaab Lodge",
        category: "luxury",
        description: "Sasaab luxury tented camp lies deep in Samburu, with 9 suites each featuring a private plunge pool, open-air bathroom and remarkable views over the Laikipia Plateau and Mount Kenya. Its Moroccan-style design makes the most of the river breezes above the Ewaso Nyiro River.",
        story: "Sasaab is a luxury eco-lodge providing a haven for endangered Grevy's zebra and a gateway to the North. With dramatic ridge setting and Moroccan architectural influences, Sasaab creates an extraordinary safari environment where fly-camps, helicopter experiences, and cook-out bush breakfasts are part of daily life.",
        features: [
          "9 luxury tented suites each over 100 square metres",
          "Private plunge pools and open-air bathrooms in every suite",
          "Moroccan-style design maximizing river breezes",
          "Views over Laikipia Plateau and Mount Kenya",
          "Fly-camp option for nights sleeping under open skies",
          "Helicopter experiences, cook-out breakfasts, sundowners",
        ],
        image: "/images/destiations/Samburu/Asaab.webp",
        images: [
          "/images/destiations/Samburu/Asaab.webp",
          "/images/destiations/Samburu/Asaab ambience.webp",
          "/images/destiations/Samburu/Asaab Heli Expirience.webp",
        ],
        website: "https://www.andbeyond.com/our-lodges/africa/kenya/samburu/sasaab/",
      },
    ],
  },

  {
    destinationId: "nakuru",
    destinationName: "Lake Nakuru",
    lodges: [
      {
        id: "sarova-lion-hill",
        name: "Sarova Lion Hill Game Lodge",
        category: "luxury",
        description: "Nestled on a plateau along the Lion Hill within Lake Nakuru National Park, Sarova Lion Hill Game Lodge offers elevated panoramic views of Lake Nakuru and the surrounding park. Named after the hill historically known as a habitat for lions, its 67 chalets and suites are perfectly positioned to view rhinos, flamingos, Rothschild giraffes, and over 450 bird species.",
        story: "Opened in 1986 as the fourth establishment in the Sarova Hotels chain, Lion Hill was built on what was once a tented camp on lion country. Its Rift Valley Bar opens into an amphitheatre for traditional dance performances, while the lake turns pink and silver below with the movement of flamingos at every golden hour.",
        features: [
          "67 chalets and suites with private patios overlooking Lake Nakuru",
          "Panoramic Rift Valley views from the Lion Hill plateau",
          "Rift Valley Bar opening into an amphitheatre for cultural performances",
          "Swimming pool adjoining a wellness tent with massage services",
          "Prime viewing for endangered black & white rhinos and Rothschild giraffes",
          "Over 450 bird species including flamingos and pelicans",
        ],
        image: "/images/destiations/Lake Nakuru/Sarova lion.webp",
        images: [
          "/images/destiations/Lake Nakuru/Sarova lion.webp",
          "/images/destiations/Lake Nakuru/ame drives lake Nakuru.webp",
        ],
        website: "https://www.sarovahotels.com/lionhill-nakuru/",
      },
      {
        id: "lake-nakuru-lodge",
        name: "Lake Nakuru Lodge",
        category: "mid-range",
        description: "Situated inside Lake Nakuru National Park on elevated ground, Lake Nakuru Lodge offers panoramic views of the lake basin, woodlands, and wildlife. Its deep historical roots include rooms over 100 years old, while its Mutarakwa restaurant and Mama Nikki bar deliver warm Kenyan hospitality and authentic cuisine.",
        story: "Lake Nakuru Lodge carries more history than almost any other lodge in Kenya,  some of its rooms trace back to land first acquired in 1924. Today guests enjoy horseback riding through the park, guided garden tours through mature grounds, and the spectacle of rhinos grazing on hillsides while flamingos ring the lake below.",
        features: [
          "In-park location with immediate game drive access",
          "Historic lodge with rooms dating back over 100 years",
          "Mutarakwa Restaurant serving African and Indian-influenced cuisine",
          "Activities including game drives, horseback riding, and guided garden tours",
          "Views of the lake basin, woodlands and open plains",
        ],
        image: "/images/destiations/Lake Nakuru/Lake Nakutu lodge.webp",
        images: [
          "/images/destiations/Lake Nakuru/Lake Nakutu lodge.webp",
          "/images/destiations/Lake Nakuru/lake Nakuru lodge rooms.webp",
        ],
        website: "https://lakenakurupark.org/",
      },
      {
        id: "ziwa-bush-lodge",
        name: "Ziwa Bush Lodge",
        category: "mid-range",
        description: "A boutique lodge built using local stone, canvas and makuti-thatched roofs, Ziwa Bush Lodge is nestled in tranquil indigenous vegetation near a small fish-filled dam outside Lake Nakuru National Park. Handcrafted cedar furniture made on-site and an open-sided restaurant create an authentically Kenyan bush retreat.",
        story: "Ziwa Bush Lodge was designed as a serene retreat for nature lovers and birdwatchers who want to experience the Rift Valley away from the noise of tourist traffic. The lodge supports a local charity and operates with sustainable principles, ensuring the surrounding ecosystem benefits as much as the guests.",
        features: [
          "Boutique lodge with local stone, canvas and makuti thatching",
          "Handcrafted cedar furniture made on-site",
          "Set in indigenous vegetation beside a fish-filled dam",
          "Open-sided restaurant, well-stocked bar and outdoor swimming pool",
          "Conservation-focused with community charity support",
          "Conference and meeting facilities available",
        ],
        image: "/images/destiations/Lake Nakuru/Ziwa Bush lodge.webp",
        images: [
          "/images/destiations/Lake Nakuru/Ziwa Bush lodge.webp",
          "/images/destiations/Lake Nakuru/Ziwa bush lodge rooms.webp",
          "/images/destiations/Lake Nakuru/Ziwa bush lodge night view.webp",
          "/images/destiations/Lake Nakuru/ziwa lodge ambience.webp",
        ],
        website: "https://ziwabushlodge.com/",
      },
      {
        id: "jacaranda-elementaita",
        name: "Jacaranda Lake Elementaita Lodge",
        category: "mid-range",
        description: "Set on the shores of Lake Elementaita,  a UNESCO World Heritage soda lake within Kenya's Soysambu Conservancy,  Jacaranda Lake Elementaita Lodge combines flamingo-filled lake views, volcanic landscapes, and proximity to both Lake Nakuru and Lake Naivasha in a single beautifully located Rift Valley base.",
        story: "Lake Elementaita is Nakuru's quieter sibling,  a smaller soda lake where flamingos gather in shallows backed by volcanic craters. The lodge landscape changes character every hour: pink at dawn, silver at midday, gold at dusk. The Soysambu Conservancy surrounding it holds Grant's gazelle, eland, zebra and waterbuck.",
        features: [
          "Shores of Lake Elementaita, a UNESCO World Heritage Great Rift Valley lake",
          "Flamingos, pelicans and fish eagles visible directly from lodge",
          "Soysambu Conservancy access with eland, gazelle and zebra",
          "Central Rift Valley position for Nakuru, Naivasha and Nairobi circuit",
          "Volcanic crater hiking in the surrounding landscape",
        ],
        image: "/images/destiations/Lake Nakuru/Jacaranda.webp",
        images: [
          "/images/destiations/Lake Nakuru/Jacaranda.webp",
          "/images/destiations/Lake Nakuru/Jacaranda view.webp",
          "/images/destiations/Lake Nakuru/Jacaranda ambience.webp",
          "/images/destiations/Lake Nakuru/camp jacaranda.webp",
        ],
        website: "https://jacarandahotels.com/elementaita/",
      },
      {
        id: "maili-saba-camp",
        name: "Maili Saba Camp",
        category: "budget",
        description: "Named for its position seven miles from Lake Nakuru's gate, Maili Saba Camp is an intimate tented camp offering an affordable and authentic bush experience in the Rift Valley. Small capacity, personalized guiding, and conservation-focused operations make it the most human-scale way to experience Nakuru.",
        story: "Maili Saba whispers where others shout. Seven miles from the gate translates to a philosophy: give guests enough space to hear the Rift Valley's natural soundtrack. A handful of tents, a campfire, and guides who know every bird call and game trail by feel,  this is Nakuru as it should first be experienced.",
        features: [
          "Intimate tented camp with minimal footprint, 7 miles from Lake Nakuru gate",
          "Conservation-focused operation with community benefit programs",
          "Personalized guide service in an uncrowded low-capacity format",
          "Access to Lake Nakuru's rhinos, flamingos, and lions",
          "Campfire dining under Rift Valley skies with traditional Kenyan cuisine",
        ],
        image: "/images/destiations/Lake Nakuru/Malisaba camp.webp",
        images: [
          "/images/destiations/Lake Nakuru/Malisaba camp.webp",
          "/images/destiations/Lake Nakuru/Malisaba ambience.webp",
          "/images/destiations/Lake Nakuru/Malisaba rooms.webp",
          "/images/destiations/Lake Nakuru/Malisaba diiner.webp",
        ],
        website: "https://mailisabacamp.com/",
      },
    ],
  },

  {
    destinationId: "naivasha",
    destinationName: "Lake Naivasha",
    lodges: [
      {
        id: "chui-lodge",
        name: "Chui Lodge",
        category: "luxury",
        description: "Located within the private 18,000-acre Oserengoni Wildlife Sanctuary above the shores of Lake Naivasha, Chui Lodge is an exclusive intimate retreat blending seamlessly into its environment using locally sourced stone, acacia, olive, and leleshwa wood. Just eight unique luxury cottages offer maximum seclusion.",
        story: "Chui Lodge's rustic-chic atmosphere channels a philosophy of deep respect for place. Four-poster olive wood beds, private verandas, log fires and a heated pool coexist with day and night game drives, boat cruises on the lake, and guided bush walks,  all within an 18,000-acre private sanctuary where wildlife roams freely.",
        features: [
          "8 exclusive cottages within an 18,000-acre private wildlife sanctuary",
          "Locally sourced stone and indigenous woods throughout",
          "Four-poster olive wood beds, private verandas and log fires",
          "Heated swimming pool, cozy lounge and library",
          "Day and night game drives, boat cruises and guided bush walks",
          "International cuisine from an on-site organic farm",
        ],
        image: "/images/destiations/Lake Naivasha/Chui lodge.webp",
        images: [
          "/images/destiations/Lake Naivasha/Chui lodge.webp",
          "/images/destiations/Lake Naivasha/Chui outside.webp",
          "/images/destiations/Lake Naivasha/Chui rooms.webp",
          "/images/destiations/Lake Naivasha/Chui Swimming pool.webp",
          "/images/destiations/Lake Naivasha/Chui ambience.webp",
        ],
        website: "https://www.andbeyond.com/",
      },
      {
        id: "lake-naivasha-sopa-resort",
        name: "Lake Naivasha Sopa Resort",
        category: "mid-range",
        description: "Situated on 120 acres of grassland on the banks of Lake Naivasha, the Sopa Resort features 84 rooms in 21 crescent-shaped stone cottages with large windows, private verandas, and local artwork. Resident giraffes, waterbucks and monkeys share the acacia-studded gardens with guests.",
        story: "Lake Naivasha Sopa Resort was designed to blend into its natural surroundings, creating a space where luxury and wilderness coexist. Two swimming pools, a fitness centre, tennis court, boat rides on the lake, and multiple conference venues make it equally suited for family safaris, romantic escapes, and corporate events.",
        features: [
          "84 rooms in crescent-shaped stone cottages with lake views",
          "120 acres of acacia grassland with resident giraffes and waterbucks",
          "Two swimming pools, fitness centre and tennis court",
          "Boat rides on Lake Naivasha for hippo and bird watching",
          "Multiple conference venues and wedding facilities",
          "Continental, Swahili and Mediterranean dining options",
        ],
        image: "/images/destiations/Lake Naivasha/Sopa resort.webp",
        images: [
          "/images/destiations/Lake Naivasha/Sopa resort.webp",
          "/images/destiations/Lake Naivasha/Sopa rooms.webp",
          "/images/destiations/Lake Naivasha/Sopa swimming pool.webp",
          "/images/destiations/Lake Naivasha/Sopa boat rides.webp",
          "/images/destiations/Lake Naivasha/sopa enviroment.webp",
        ],
        website: "https://www.sopalodges.com/lake-naivasha-sopa-resort/",
      },
      {
        id: "naivasha-kongoni-lodge",
        name: "Naivasha Kongoni Lodge",
        category: "luxury",
        description: "Perched along the shimmering shores of Lake Naivasha in Kenya's Great Rift Valley, Naivasha Kongoni Lodge offers 26 deluxe suites across 13 cottages,  including one fully accessible to physically challenged guests. Its architecture tells a story of respect: for local traditions, nature, and the surrounding environment.",
        story: "Kongoni Lodge is where the wild heart of the Great Rift Valley becomes a luxury address. Rich colours, inviting textures and spacious interiors that open to lake views create an exceptional blend of luxury, sustainability, and authentic African hospitality that makes every stay feel both grounding and extraordinary.",
        features: [
          "13 cottages with 26 Deluxe suites including fully accessible option",
          "Spacious interiors with rich colours and inviting textures",
          "Perched along shimmering shores of Lake Naivasha",
          "Swimming pool with lake views",
          "Architecture respecting local traditions and natural surroundings",
          "Exceptional blend of luxury and sustainability",
        ],
        image: "/images/destiations/Lake Naivasha/Kongoni lodge.webp",
        images: [
          "/images/destiations/Lake Naivasha/Kongoni lodge.webp",
          "/images/destiations/Lake Naivasha/komgoni rooms.webp",
          "/images/destiations/Lake Naivasha/Kongoni swimming pool.webp",
          "/images/destiations/Lake Naivasha/kongoni ambience.webp",
        ],
        website: "https://naivashakongonilodge.com/",
      },
    ],
  },

  {
    destinationId: "amboseli",
    destinationName: "Amboseli National Park",
    lodges: [
      {
        id: "ol-tukai-lodge",
        name: "Ol Tukai Lodge Amboseli",
        category: "luxury",
        description: "Built on the site where the film crew for the 1948 classic 'Snows of Kilimanjaro' camped, Ol Tukai Lodge sits at the heart of Amboseli National Park beneath acacia and phoenix palm canopies. Its 80 luxury chalet-style rooms offer uninterrupted views of either the wetlands or snow-capped Mount Kilimanjaro.",
        story: "Ol Tukai is arguably Africa's most iconic elephant-watching destination,  a place where the world's most photographed scene unfolds daily. Speakers from the Amboseli Elephant Research Project offer nightly lectures on-site, turning wildlife viewing into scientific education. The open-air Elephant Bar positions guests for the afternoon bathing hours.",
        features: [
          "On the original 1948 'Snows of Kilimanjaro' film camp site",
          "80 chalet rooms with uninterrupted Kilimanjaro and wetland views",
          "Nightly lectures from Amboseli Elephant Research Project scientists",
          "Open-air Elephant Bar for afternoon elephant viewing",
          "Exclusive Kibo Villa: 3-bedroom private residence with roof terrace & Jacuzzi",
          "Swimming pool flush with ground for seamless wilderness feel",
        ],
        image: "/images/destiations/Ambosel/Oloitukai.webp",
        images: [
          "/images/destiations/Ambosel/Oloitukai.webp",
          "/images/destiations/Ambosel/Oloitukai 1.webp",
          "/images/destiations/Ambosel/Oloitukai ambience.webp",
          "/images/destiations/Ambosel/Oloitukai environment and parks.webp",
        ],
        website: "https://oltukailodge.com/",
      },
      {
        id: "kibo-safari-camp",
        name: "Kibo Safari Camp",
        category: "mid-range",
        description: "Situated just outside Amboseli National Park's boundary, Kibo Safari Camp offers authentic tented accommodation with views of Mount Kilimanjaro from every tent. A private conservation area keeps elephant herds moving through camp, creating an intimate atmosphere a classic safari camp at an accessible price.",
        story: "Kibo is the Swahili name for Kilimanjaro's peak,  the summit every guest at this camp wakes up facing each morning. Eating breakfast with an unobstructed view of Africa's highest mountain while elephant families graze in the foreground is a reminder that Amboseli's genius lies in Kilimanjaro's constant presence making everything feel epic.",
        features: [
          "Named after Kilimanjaro's summit,  full mountain views from every tent",
          "Private conservation area with free-roaming elephant herds through camp",
          "Classic tented camp with en-suite facilities and modern comforts",
          "Bar with Kilimanjaro views and outdoor dining spaces",
          "Expert guides specializing in Amboseli wildlife and Maasai culture",
        ],
        image: "/images/destiations/Ambosel/kibo.webp",
        images: [
          "/images/destiations/Ambosel/kibo.webp",
          "/images/destiations/Ambosel/kibo outside.webp",
          "/images/destiations/Ambosel/kibo bars.webp",
          "/images/destiations/Ambosel/kibo ambience.webp",
        ],
        website: "https://kibosafaricamp.com/",
      },
      {
        id: "tawi-lodge",
        name: "Tawi Lodge",
        category: "luxury",
        description: "Set within a Maasai-owned private conservancy adjacent to Amboseli's Kimana Gate, Tawi Lodge consists of 13 individual cottages with private wooden-deck verandas and direct Kilimanjaro views,  visible even from the Victorian bathtub in each en-suite bathroom. Luxury and community conservation as one.",
        story: "Tawi Lodge proves that Amboseli's magic doesn't stop at the national park boundary. Each cottage is positioned for the mountain, with verandas oriented to catch the precise angle of dawn on Kilimanjaro's glaciers. Every night spent here directly funds the Maasai landowners who choose to preserve wildlife habitat over cattle grazing.",
        features: [
          "13 private cottages with Kilimanjaro views from beds, verandas and bathtubs",
          "Maasai-owned conservancy,  stays directly fund community conservation",
          "Private conservancy with elephant and big cat encounters",
          "Cultural Maasai village visits and community engagement",
          "Kimana Gate proximity for Amboseli National Park game drives at dawn",
        ],
        image: "/images/destiations/Ambosel/Tawi lodge.webp",
        images: [
          "/images/destiations/Ambosel/Tawi lodge.webp",
          "/images/destiations/Ambosel/Tawi camp.webp",
          "/images/destiations/Ambosel/Tawi rooms.webp",
          "/images/destiations/Ambosel/outside at Tawi.webp",
        ],
        website: "https://tawilodge.com/",
      },
      {
        id: "amboseli-eco-camp",
        name: "Amboseli Eco Camp",
        category: "camp",
        description: "Amboseli Eco Camp is a budget-friendly tented camp designed for environmentally-minded travellers who want authentic safari immersion with the lightest possible footprint. Solar power, rainwater harvesting, composting, and locally-sourced food create a low-impact adventure base with all the wildlife rewards Amboseli delivers.",
        story: "Amboseli Eco Camp exists where adventure travel and environmental responsibility converge. Every design decision,  from the solar panels to the Maasai staff who guide game walks and explain their relationship with the elephants,  is made with the understanding that the best safaris leave the lightest marks.",
        features: [
          "Low-impact eco-design: solar power, rainwater collection, composting",
          "Tented accommodation with Kilimanjaro views in authentic bush setting",
          "Maasai guides providing culturally enriched game walks and wildlife tracking",
          "Budget-accessible rates making Amboseli available to a wider range of travellers",
          "Early morning game drives during optimal wildlife viewing hours",
        ],
        image: "/images/destiations/Ambosel/echo camp.webp",
        images: [
          "/images/destiations/Ambosel/echo camp.webp",
          "/images/destiations/Ambosel/echo camp rooms.webp",
          "/images/destiations/Ambosel/echo camp accomodations.webp",
          "/images/destiations/Ambosel/echo camp animals.webp",
        ],
        website: "https://amboseliecocamp.com/",
      },
    ],
  },

  {
    destinationId: "chale-island",
    destinationName: "Chale Island",
    lodges: [
      {
        id: "sands-at-chale-island",
        name: "The Sands at Chale Island",
        category: "luxury",
        description: "The Sands at Chale Island is Kenya's most extraordinary private island retreat,  a 10-acre coral island rising from the turquoise Indian Ocean, accessible only by a short motorboat ride from Diani Beach. Home to a legendary heart-shaped infinity pool carved into the coral cliff edge, Swahili-Arabic architecture, and world-class snorkeling reefs, it is the definitive island luxury experience on the East African coast.",
        story: "Arriving at Chale Island feels like stepping out of the world. The 5-minute motorboat crossing delivers you to a place where the Indian Ocean stretches endlessly in every direction, where coral gardens shimmer beneath crystal-clear shallows, and where a signature heart-shaped infinity pool hovers above the reef edge like a jewel suspended over the sea. Evenings here,  fresh Swahili seafood, candlelit and ocean-facing, with the warm breeze carrying the scent of frangipani,  rank among the most romantic experiences in all of Africa.",
        features: [
          "Private 10-acre coral island,  accessible exclusively by boat from Diani Beach",
          "Iconic heart-shaped infinity pool perched on the coral cliff overlooking the Indian Ocean",
          "World-class house reef snorkeling and scuba diving steps from your villa",
          "Swahili-Arabic architecture with carved timber, hand-painted tiles and ocean-facing verandas",
          "Fresh seafood restaurant and oceanfront sunset bar with panoramic Indian Ocean views",
          "Dhow sunset cruises, deep-sea fishing, kayaking and kitesurfing available",
        ],
        image:
          "https://chaleislandresort.com/wp-content/uploads/2023/01/ocean-view-room-845x684.jpg",
        images: [
          "https://chaleislandresort.com/wp-content/uploads/2023/01/ocean-view-room-845x684.jpg",
          "https://chaleislandresort.com/wp-content/uploads/2024/11/0006-Chale-Aerials-Sept-2024-DJI_0043-DNG_DxO_DeepPRIMEXD1-845x684.jpg",
          "https://chaleislandresort.com/wp-content/uploads/2024/03/asfeatured_islands-e1710787832917.png",
        ],
        website: "https://thesandsatchaleisland.com/",
      },
    ],
  },

  {
    destinationId: "wasini",
    destinationName: "Wasini Island",
    lodges: [
      {
        id: "mpunguti-lodge",
        name: "Mpunguti Lodge",
        category: "mid-range",
        description:
          "A long-running Wasini Island lodge and restaurant with sea-facing rooms, a small conference setup, and direct access to the island's quiet coral coast.",
        story:
          "Mpunguti Lodge is one of the classic Wasini stays, built around simple island living: sea views, seafood, and the slower rhythm that defines the island.",
        features: [
          "Sea-facing rooms on Wasini Island",
          "Island restaurant and conference hall",
          "Good base for Kisite-Mpunguti excursions",
          "Traditional, low-key island accommodation",
        ],
        image: "https://www.wasini-lodge.com/repertoire%20photo/DSC_0394.JPG",
        images: [
          "https://www.wasini-lodge.com/repertoire%20photo/DSC_0394.JPG",
          "https://www.wasini-lodge.com/repertoire%20photo/DSC_0277.JPG",
          "https://www.wasini-lodge.com/repertoire%20photo/DSC_0440.JPG",
        ],
        website: "https://wasini.net/mpunguti-lodge/",
      },
      {
        id: "blue-monkey-beach-cottages",
        name: "Blue Monkey Beach Cottages",
        category: "budget",
        description:
          "Handmade cliff-top cottages on Wasini with private sea views, a treetop dining terrace, and a direct connection to the island's natural coastline.",
        story:
          "Blue Monkey Beach Cottages lean into Wasini's ecological character. The stay is modest, private, and very close to the water, which is exactly the point here.",
        features: [
          "Cliff-top cottages with sea views",
          "Private sand beach and tidal pool",
          "Treetop terrace dining",
          "Well suited to nature-focused travelers",
        ],
        image: "https://www.wasini.net/wp-content/uploads/2014/12/Blue-Moneky-Beach-Cottage-Example-Exterior-225x300.jpeg",
        images: [
          "https://www.wasini.net/wp-content/uploads/2014/12/Blue-Moneky-Beach-Cottage-Example-Exterior-225x300.jpeg",
          "https://www.wasini.net/wp-content/uploads/2014/12/DSC01501-300x225.jpg",
          "https://www.wasini.net/wp-content/uploads/2014/12/Private-Blue-Monkey-Beach-300x225.jpeg",
        ],
        website: "https://wasini.net/blue-monkey-beach-cottages/",
      },
      {
        id: "banda-porini",
        name: "Banda Porini",
        category: "budget",
        description:
          "A rustic Wasini bush cabin set back in the indigenous greenery, offering privacy, a private terrace, and easy access to the same beachfront compound as Blue Monkey.",
        story:
          "Banda Porini is the more secluded Wasini option. It is built for travelers who want the simplest possible island stay without losing access to the coastline and shared guest spaces.",
        features: [
          "Private bush cabin on Wasini",
          "Separate bathroom and outdoor terrace",
          "Shares beach jetty and tidal pool access",
          "Best for quiet, low-impact stays",
        ],
        image: "https://wasini.net/wp-content/uploads/2019/09/Wasini-Island-Banda-Porini_Front-View-1133x1700.jpg",
        images: [
          "https://wasini.net/wp-content/uploads/2019/09/Wasini-Island-Banda-Porini_Front-View-1133x1700.jpg",
          "https://wasini.net/wp-content/uploads/2019/09/Wasini-Island-Banda-Porini_Interior-1700x1133.jpg",
          "https://www.wasini.net/wp-content/uploads/2014/12/DSC01492-300x225.jpg",
        ],
        website: "https://wasini.net/banda-porini/",
      },
      {
        id: "banda-mlimani",
        name: "Banda Mlimani",
        category: "budget",
        description:
          "A simple hilltop Wasini band a with sea views, solar power, and a more adventurous off-grid feel than the island's other stays.",
        story:
          "Banda Mlimani suits travelers who want Wasini stripped back to essentials. It is very much about the setting, the breeze, and the island's natural environment.",
        features: [
          "Hilltop banda with sea views",
          "Solar-powered off-grid setup",
          "Private outdoor area and kitchen option",
          "Ideal for independent travelers",
        ],
        image: "https://www.wasini.net/wp-content/uploads/2014/12/20140823_173926-300x168.jpg",
        images: [
          "https://www.wasini.net/wp-content/uploads/2014/12/20140823_173926-300x168.jpg",
          "https://www.wasini.net/wp-content/uploads/2014/12/20140823_174257-300x168.jpg",
          "https://www.wasini.net/wp-content/uploads/2014/12/20140823_174440-300x168.jpg",
        ],
        website: "https://wasini.net/banda-mlimani/",
      },
    ],
  },

  {
    destinationId: "watamu",
    destinationName: "Watamu",
    lodges: [
      {
        id: "hemingways-watamu",
        name: "Hemingways Watamu",
        category: "luxury",
        description:
          "An upscale oceanfront hotel in Watamu with an elegant coastal style, a strong reputation for service, and easy access to the Marine National Park and beach.",
        story:
          "Hemingways Watamu is the polished choice for guests who want Watamu with a refined edge. It is well placed for marine park days, seafood-focused stays, and a quieter, higher-service coastal experience.",
        features: [
          "Oceanfront setting in Watamu",
          "High-service luxury beach stay",
          "Close to Watamu Marine National Park",
          "Good for couples and relaxed premium escapes",
        ],
        image:
          "https://www.hemingways-collection.com/wp-content/uploads/2025/06/Main-pool-with-ocean-views-4-scaled.jpg",
        images: [
          "https://www.hemingways-collection.com/wp-content/uploads/2025/06/Main-pool-with-ocean-views-4-scaled.jpg",
          "/images/watamu-beach.webp",
          "/images/watamu-bay.webp",
        ],
        website: "https://www.hemingways-collection.com/hemingways-watamu/",
      },
      {
        id: "medina-palms",
        name: "Medina Palms",
        category: "luxury",
        description:
          "A stylish Watamu resort with spacious suites, ocean views, a spa, and a quieter residential feel suited to longer stays and honeymoon travel.",
        story:
          "Medina Palms feels more like a private coastal residence than a standard resort. The design, space, and calm atmosphere make it a strong Watamu option for guests who want to slow down and stay a little longer.",
        features: [
          "Spacious suites and apartments",
          "Spa and pool facilities",
          "Quiet, upscale Watamu setting",
          "Well suited to longer beach holidays",
        ],
        image: "/images/watamu-bay.webp",
        images: [
          "/images/watamu-bay.webp",
          "/images/deckchair-beach.webp",
          "/images/beach.webp",
        ],
        website: "https://www.medinapalms.com/",
      },
      {
        id: "turtle-bay-beach-club",
        name: "Turtle Bay Beach Club",
        category: "mid-range",
        description:
          "A long-standing all-inclusive Watamu beachfront resort set on 200 meters of beach beside the marine park, with tropical gardens, family entertainment, and watersports.",
        story:
          "Turtle Bay Beach Club is one of Watamu's most practical all-round stays. It gives travelers direct beach access, enough space for families, and the simple coastal setting that suits marine-focused holidays.",
        features: [
          "Direct beachfront access in Watamu National Marine Park",
          "All-inclusive resort with family entertainment",
          "Good base for snorkeling and boat trips",
          "Reliable choice for longer coastal breaks",
        ],
        image: "/images/deckchair-beach.webp",
        images: [
          "/images/deckchair-beach.webp",
          "/images/watamu-beach.webp",
          "/images/beach.webp",
        ],
        website: "https://www.tbbckenya.com/",
      },
      {
        id: "temple-point-resort",
        name: "Temple Point Resort",
        category: "mid-range",
        description:
          "A waterside Watamu resort near Mida Creek and the marine park with a relaxed, activity-friendly setting for sailing, kayaking, diving, and beach time.",
        story:
          "Temple Point works well for travelers who want to build Watamu around the water rather than the hotel alone. Its setting near the creek and marine park makes it useful for active coastal itineraries and nature-focused stays.",
        features: [
          "Near Watamu Marine National Park and Mida Creek",
          "Good for kayaking, sailing, and marine excursions",
          "Relaxed resort atmosphere",
          "Strong base for active coast holidays",
        ],
        image:
          "https://cdn.prod.website-files.com/667d4286644e58960632a889/66d0d96626f3b66ad5acb172_Temple%20Point%20Resort%20Watamu-80%20Large.jpeg",
        images: [
          "https://cdn.prod.website-files.com/667d4286644e58960632a889/66d0d96626f3b66ad5acb172_Temple%20Point%20Resort%20Watamu-80%20Large.jpeg",
          "https://cdn.prod.website-files.com/667d4286644e58960632a889/66d0d965f246daa6f4d20ba4_Temple%20Point%20Resort%20Watamu-14%20Large.jpeg",
          "https://cdn.prod.website-files.com/667d4286644e58960632a889/66d0d966f246daa6f4d20dcd_Temple%20Point%20Resort%20Watamu-17%20Large.jpeg",
        ],
        website: "https://www.templepoint.com/",
      },
      {
        id: "ocean-sports-resort",
        name: "Ocean Sports Resort",
        category: "mid-range",
        description:
          "A casual Watamu beach resort with an activity-led feel that suits watersports, sunset drinks, and easy access to the Indian Ocean.",
        story:
          "Ocean Sports is a straightforward Watamu option for guests who want to spend more time on the water than in formal resort spaces. It suits couples, friends, and active beach travelers.",
        features: [
          "Watamu beach setting",
          "Casual, activity-oriented atmosphere",
          "Good for watersports and beach breaks",
          "Easy fit for short or flexible stays",
        ],
        image: "/images/watamu-hotel.webp",
        images: [
          "/images/watamu-hotel.webp",
          "/images/watamu-bay.webp",
          "/images/deckchair-beach.webp",
        ],
        website: "https://www.oceansports.net/",
      },
    ]
  },
  {
    destinationId: "mombasa-south-coast",
    destinationName: "Mombasa South Coast",
    lodges: [
      {
        id: "baobab-beach-resort",
        name: "Baobab Beach Resort & Spa",
        category: "luxury",
        description:
          "A large South Coast resort on Diani's white sands, embraced by tropical gardens, multiple pools, and a strong all-inclusive beach holiday formula.",
        story:
          "Baobab Beach Resort is South Coast leisure in its most complete form: wide grounds, strong dining, and direct access to Diani and Galu beaches. It suits guests who want the coast to feel effortless and self-contained.",
        features: [
          "Set on Diani and Galu's white sands",
          "Multiple pools and all-inclusive dining",
          "Large tropical gardens with strong beach access",
          "Good for families, groups, and long stays",
        ],
        image: "https://baobab-beach-resort.com/imgs/gallery/restaurants/11.jpg",
        images: [
          "https://baobab-beach-resort.com/imgs/gallery/restaurants/11.jpg",
          "https://baobab-beach-resort.com/imgs/gallery/restaurants/22.jpg",
          "https://baobab-beach-resort.com/imgs/gallery/restaurants/1.jpg",
        ],
        website: "https://baobab-beach-resort.com/",
      },
      {
        id: "southern-palms-beach-resort",
        name: "Southern Palms Beach Resort",
        category: "mid-range",
        description:
          "A classic Diani Beach resort with expansive tropical grounds, two large pools, Swahili and Arabic decor, and a long beachfront stretch south of Mombasa.",
        story:
          "Southern Palms is a South Coast staple because it balances size with a relaxed beach feel. The property gives families and groups plenty of room while keeping the Indian Ocean at the center of the stay.",
        features: [
          "Direct beachfront location on Diani Beach",
          "Two huge free-form pools and four restaurants",
          "Swahili and Arabic decor throughout the resort",
          "Strong fit for families and beach holidays",
        ],
        image:
          "https://southernpalmskenya.com/wp-content/uploads/2021/05/SPBR-Sept-2019-Hotel-0020-IMG_9414-1-scaled.jpg",
        images: [
          "https://southernpalmskenya.com/wp-content/uploads/2021/05/SPBR-Sept-2019-Hotel-0020-IMG_9414-1-scaled.jpg",
          "https://southernpalmskenya.com/wp-content/uploads/2021/05/SPBR-Sept-2019-Hotel-0132-DSC07329-scaled.jpg",
          "https://southernpalmskenya.com/wp-content/uploads/2021/05/41-scaled.jpg",
        ],
        website: "https://southernpalmskenya.com/",
      },
      {
        id: "leopard-beach-resort",
        name: "Leopard Beach Resort & Spa",
        category: "luxury",
        description:
          "A polished Diani Beach resort with sea-view rooms, spa facilities, pools, and a long reputation as one of the South Coast's established luxury stays.",
        story:
          "Leopard Beach is one of the South Coast's safest recommendations when the brief is premium beach comfort. It delivers the resort structure, spa time, and beach access that many Diani travelers want in one place.",
        features: [
          "Prime Diani Beach position",
          "Spa, pools, and a broad choice of rooms and cottages",
          "Well suited to couples and leisure stays",
          "Easy base for South Coast excursions",
        ],
        image: "https://www.leopardbeachresort.com/images/gallerycenterimage/us-gallery-2_3896.jpg",
        images: [
          "https://www.leopardbeachresort.com/images/gallerycenterimage/us-gallery-2_3896.jpg",
          "https://www.leopardbeachresort.com/images/gallerycenterimage/us-gallery-6_27580.jpg",
          "https://www.leopardbeachresort.com/images/gallerycenterimage/us-gallery-3_10444.jpg",
        ],
        website: "https://www.leopardbeachresort.com/",
      },
      {
        id: "diani-sea-resort",
        name: "Diani Sea Resort",
        category: "mid-range",
        description:
          "A family-friendly Diani Beach resort with tropical gardens, a lagoon-style pool, and an easygoing all-inclusive atmosphere.",
        story:
          "Diani Sea Resort is a practical South Coast base that leans into comfort, shade, and easy beach access. It is a sensible choice for travelers who want dependable holiday value rather than a flashy resort.",
        features: [
          "Direct access to Diani Beach",
          "Large lagoon-style pool with swim-up bar",
          "Family entertainment and kids' activities",
          "Relaxed all-inclusive coastal stay",
        ],
        image: "https://www.dianisearesort.de/media/2018/06/IMG_2151-2.jpg",
        images: [
          "https://www.dianisearesort.de/media/2018/06/IMG_2151-2.jpg",
          "https://www.dianisearesort.de/media/2018/06/MG_2391-2.jpg",
          "https://www.dianisearesort.de/media/2018/10/DJI_0080-2-2.jpg",
        ],
        website: "https://www.dianisearesort.de/",
      },
    ],
  },
  {
    destinationId: "diani",
    destinationName: "Diani Beach",
    lodges: [
      {
        id: "baobab-beach-resort",
        name: "Baobab Beach Resort & Spa",
        category: "luxury",
        description: "Set on 80 acres of tropical gardens overlooking the Indian Ocean, Baobab Beach Resort is an award-winning oasis of tranquility and serenity. Located on the world-famous Diani Beach, it offers an incomparable beachfront experience with its three-tier swimming pool and ivory-white sands.",
        story: "Baobab is where the forest meets the ocean. Indigenous forests, home to rare Colobus monkeys, stretch right down to the beach edge. The resort's architecture uses local coral and timber, creating a space that feels deeply rooted in the Swahili coast, offering a level of all-inclusive luxury that has made it a household name in African hospitality.",
        features: [
          "Located on the world-famous white sands of Diani Beach",
          "Set within 80 acres of indigenous tropical forest and gardens",
          "Iconic three-tier 'infinity' swimming pool with Indian Ocean views",
          "All-inclusive dining across multiple specialty restaurants",
          "Home to the rare Angolan Colobus monkeys",
          "World-class Afya Bora Spa and Wellness Centre",
        ],
        image: "https://baobab-beach-resort.com/imgs/gallery/restaurants/1.jpg",
        images: [
          "https://baobab-beach-resort.com/imgs/gallery/restaurants/1.jpg",
          "https://baobab-beach-resort.com/imgs/gallery/restaurants/11.jpg",
          "https://baobab-beach-resort.com/imgs/gallery/restaurants/22.jpg",
        ],
        website: "https://baobab-beach-resort.com/",
      },
      {
        id: "diani-sea-resort",
        name: "Diani Sea Resort",
        category: "mid-range",
        description: "A vibrant and family-friendly resort situated on the pristine shores of Diani Beach. Known for its expansive tropical gardens and a massive lagoon-style swimming pool, it offers a perfect blend of relaxation and coastal adventure.",
        story: "The spirit of Diani Sea Resort is one of 'Karibu',  the warm Swahili welcome. Whether it's watching traditional acrobats at dinner, learning to kite-surf on the turquoise waters, or simply enjoying the shade of the ancient baobab trees that dot the property, every moment is a celebration of the Kenyan coast.",
        features: [
          "Direct access to the turquoise waters of Diani Beach",
          "Large lagoon-style swimming pool with swim-up bar",
          "Family-friendly environment with kids' club and activities",
          "Themed buffet dinners featuring Swahili and international cuisine",
          "Daily entertainment: acrobats, traditional dancers, and live bands",
        ],
        image: "https://www.dianisearesort.de/media/2018/10/DJI_0080-2-2.jpg",
        images: [
          "https://www.dianisearesort.de/media/2018/10/DJI_0080-2-2.jpg",
          "https://www.dianisearesort.de/media/2018/06/IMG_2151-2.jpg",
          "https://www.dianisearesort.de/media/2018/06/MG_2391-2.jpg",
        ],
        website: "https://www.dianisearesort.de/",
      },
      {
        id: "southern-palms",
        name: "Southern Palms Beach Resort",
        category: "mid-range",
        description: "Southern Palms Beach Resort sits on the edge of the Indian Ocean on Diani Beach. Boasting one of the largest swimming pools in East Africa that snakes through the entire property, it's a paradise for water lovers and families alike.",
        story: "At Southern Palms, life revolves around the water. From the pool that flows past your balcony to the crashing waves of the Indian Ocean just steps away, the resort is designed to keep you cool under the African sun. The Swahili-inspired architecture with 'Lamustyle' furniture adds a touch of historical elegance to your tropical escape.",
        features: [
          "One of the largest swimming pools in East Africa",
          "Swahili-design rooms with hand-carved Lamu-style furniture",
          "6 restaurants offering everything from Italian to traditional seafood boma",
          "Direct beachfront location on the most scenic part of Diani",
          "Comprehensive water sports center: scuba diving, windsurfing, snorkeling",
        ],
        image:
          "https://southernpalmskenya.com/wp-content/uploads/2021/05/SPBR-Sept-2019-Hotel-0020-IMG_9414-1-scaled.jpg",
        images: [
          "https://southernpalmskenya.com/wp-content/uploads/2021/05/SPBR-Sept-2019-Hotel-0020-IMG_9414-1-scaled.jpg",
          "https://southernpalmskenya.com/wp-content/uploads/2021/05/SPBR-Sept-2019-Hotel-0132-DSC07329-scaled.jpg",
          "https://southernpalmskenya.com/wp-content/uploads/2021/05/41-scaled.jpg",
        ],
        website: "https://southernpalmskenya.com/",
      },
      {
        id: "leopard-beach-resort",
        name: "Leopard Beach Resort & Spa",
        category: "luxury",
        description:
          "An established Diani Beach resort with sea-view rooms, pools, and a full-service spa, set on a raised coastal bluff with direct access to the beach.",
        story:
          "Leopard Beach is one of Diani's best-known classic resorts: landscaped grounds, a proper resort layout, and an easy rhythm between pool time, beach time, and excursions on the South Coast.",
        features: [
          "Prime Diani Beach location",
          "Multiple pools and a full-service spa",
          "Good mix of rooms, suites, and cottages",
          "Strong choice for couples and leisure stays",
        ],
        image: "https://www.leopardbeachresort.com/images/gallerycenterimage/us-gallery-3_10444.jpg",
        images: [
          "https://www.leopardbeachresort.com/images/gallerycenterimage/us-gallery-3_10444.jpg",
          "https://www.leopardbeachresort.com/images/gallerycenterimage/us-gallery-2_3896.jpg",
          "https://www.leopardbeachresort.com/images/gallerycenterimage/us-gallery-6_27580.jpg",
        ],
        website: "https://www.leopardbeachresort.com/",
      },
      {
        id: "swahili-beach-resort",
        name: "Swahili Beach Resort",
        category: "luxury",
        description:
          "A distinctive five-star Diani resort known for its Swahili-inspired design and its dramatic, multi-level cascading pool set in lush tropical gardens by the beach.",
        story:
          "Swahili Beach is a statement property. It leans into architecture, landscaping, and a big-resort feel while still keeping the coast front and center with wide pool terraces and easy access to the Indian Ocean.",
        features: [
          "Signature multi-level cascading pool",
          "Swahili-inspired architecture and interiors",
          "Beachfront access on Diani Beach",
          "Good fit for couples and luxury beach stays",
        ],
        image: "https://swahilibeach.com/wp-content/uploads/2025/02/DJI_0147.jpg",
        images: [
          "https://swahilibeach.com/wp-content/uploads/2025/02/DJI_0147.jpg",
          "https://swahilibeach.com/wp-content/uploads/2025/05/pool-2.png",
          "https://swahilibeach.com/wp-content/uploads/2025/02/DSC_4801.jpg",
        ],
        website: "https://swahilibeach.com/",
      },
      {
        id: "pinewood-beach-resort",
        name: "Pinewood Beach Resort & Spa",
        category: "luxury",
        description:
          "A boutique-style resort on the Diani/Galu strip with a strong reputation for calm service, wellness, and romantic beach stays, supported by on-site dining and spa facilities.",
        story:
          "Pinewood works best for travelers who want Diani without the mega-resort scale: more personal, quieter, and easy to pair with a few excursions while keeping the beach the main attraction.",
        features: [
          "Boutique resort atmosphere on the South Coast",
          "Beach access on the Diani/Galu strip",
          "On-site dining and spa facilities",
          "Good fit for couples and relaxed luxury breaks",
        ],
        image: "https://mail.pinewood-beach.com/images/gallery/exterior-gallery1_693860.jpg",
        images: [
          "https://mail.pinewood-beach.com/images/gallery/exterior-gallery1_693860.jpg",
          "https://mail.pinewood-beach.com/images/gallery/activities-gallery9_337927.jpg",
          "https://mail.pinewood-beach.com/images/gallery/dining-gallery8_222079.jpg",
        ],
        website: "https://pinewood-beach.com/",
      },
      {
        id: "diani-reef-beach-resort",
        name: "Diani Reef Beach Resort & Spa",
        category: "luxury",
        description:
          "A large beachfront resort in Diani with broad facilities for beach holidays, events, and longer stays, combining multiple room categories with resort-style pools and dining.",
        story:
          "Diani Reef is built for classic beach-holiday convenience: big grounds, plenty of on-site options, and a coastline setting that works well for travelers who want everything in one place.",
        features: [
          "Beachfront resort in Diani",
          "Multiple accommodation categories",
          "Resort-style pools and on-site dining",
          "Popular choice for events and longer stays",
        ],
        image: "https://dianireef.com/wp-content/uploads/2023/03/Aerial-view-of-Diani-Reef-768x512.jpg",
        images: [
          "https://dianireef.com/wp-content/uploads/2023/03/Aerial-view-of-Diani-Reef-768x512.jpg",
          "https://dianireef.com/wp-content/uploads/2023/03/Main-swimming-pool-768x512.jpg",
          "https://dianireef.com/wp-content/uploads/2023/03/Diani-Beach-768x512.jpg",
        ],
        website: "https://dianireef.com/",
      },
      {
        id: "neptune-paradise-beach-resort",
        name: "Neptune Paradise Beach Resort & Spa",
        category: "mid-range",
        description:
          "An all-inclusive Diani beachfront resort set in a tropical garden with makuti-roof cottages and a relaxed, family-friendly rhythm.",
        story:
          "Neptune Paradise is about easy coastal value: a classic Diani beach setting, lots of outdoor space, and the kind of simple resort structure that makes planning straightforward for families and groups.",
        features: [
          "All-inclusive beach resort on Diani",
          "Makuti-roof cottage-style rooms",
          "Tropical garden setting",
          "Good fit for families and groups",
        ],
        image:
          "https://www.neptunehotels.com/wp-content/uploads/2023/09/Neptune-Paradise-Beach-Resort-and-Spa-Pool-View-Diani-888x848.jpg.webp",
        images: [
          "https://www.neptunehotels.com/wp-content/uploads/2023/09/Neptune-Paradise-Beach-Resort-and-Spa-Pool-View-Diani-888x848.jpg.webp",
          "https://www.neptunehotels.com/wp-content/uploads/2025/06/Neptune-Paradise-Renovated-Room-1-1200x900.jpg.webp",
          "https://www.neptunehotels.com/wp-content/uploads/2022/08/RECEPTION_5884-ph-by-Rosalia-Filippetti-1200x900.jpg.webp",
        ],
        website: "https://www.neptunehotels.com/neptune-paradise-beach-resort-spa/",
      },
      {
        id: "neptune-village-beach-resort",
        name: "Neptune Village Beach Resort & Spa",
        category: "mid-range",
        description:
          "A wide-frontage, all-inclusive style beach resort on Diani with makuti-roof cottages, big gardens, and an energetic facilities mix for longer stays.",
        story:
          "Neptune Village is a dependable South Coast base when you want lots of space, beach access, and an easy resort routine where everything is on hand.",
        features: [
          "All-inclusive beach resort on Diani",
          "Large tropical gardens and wide beachfront",
          "Makuti-roof cottage-style rooms",
          "Good fit for longer stays and groups",
        ],
        image: "https://www.neptunehotels.com/wp-content/uploads/2024/01/Neptune-Village-Reception-1200x900.jpg.webp",
        images: [
          "https://www.neptunehotels.com/wp-content/uploads/2024/01/Neptune-Village-Reception-1200x900.jpg.webp",
          "https://www.neptunehotels.com/wp-content/uploads/2022/08/Village-Evening-View-of-Pool-Barsd-1200x900.jpg.webp",
          "https://www.neptunehotels.com/wp-content/uploads/2023/10/Neptune-Village-Beach-Resort-Spa-Superior-Garden-Room-800x500.jpg.webp",
        ],
        website: "https://www.neptunehotels.com/neptune-village-beach-resort-spa/",
      },
      {
        id: "neptune-palm-beach-boutique",
        name: "Neptune Palm Beach Boutique Resort & Spa",
        category: "mid-range",
        description:
          "A boutique Diani beachfront resort with Swahili-inspired architecture, makuti-roof cottages, and a quieter atmosphere than the larger all-inclusive compounds nearby.",
        story:
          "Neptune Palm is a clean middle ground: a full resort setup with beachfront comfort, but with a smaller, more boutique feel that suits couples and relaxed beach travelers.",
        features: [
          "Boutique beachfront resort on Diani",
          "Swahili-inspired architecture and gardens",
          "Makuti-roof cottage-style rooms",
          "Good fit for calmer beach stays",
        ],
        image: "https://www.neptunehotels.com/wp-content/uploads/2024/01/Neptune-Palm-Reception-1200x900.jpg.webp",
        images: [
          "https://www.neptunehotels.com/wp-content/uploads/2024/01/Neptune-Palm-Reception-1200x900.jpg.webp",
          "https://www.neptunehotels.com/wp-content/uploads/2022/08/DSC_0156-1200x900.jpg.webp",
          "https://www.neptunehotels.com/wp-content/uploads/2022/08/DSC_0148-1200x900.jpg.webp",
        ],
        website: "https://www.neptunehotels.com/neptune-palm-beach-boutique-resort-spa/",
      },
    ],
  },
  {
    destinationId: "wasini",
    destinationName: "Wasini Island",
    lodges: [
      {
        id: "blue-monkey-beach-cottages",
        name: "Blue Monkey Beach Cottages",
        category: "mid-range",
        description: "Set in a tranquil tropical garden overlooking the brilliant blue waters of the Indian Ocean, Blue Monkey Beach Cottages offers an authentic island experience on car-free Wasini Island. Just minutes by boat from Kisite Mpunguti Marine Park, this eco-friendly retreat perfectly captures the unhurried magic of the Kenyan coast.",
        story: "Life at Blue Monkey Beach Cottages moves at the pace of the tides. There are no cars here, only sandy paths winding between coral houses and ancient baobab trees. Your day begins with a traditional dhow sailing trip to Kisite Marine Park, where dolphins surf the bow wake. Returning to the island, you'll dine on freshly caught crab and coconut rice, listening to the gentle lap of the ocean just steps from your cottage.",
        features: [
          "Located on vehicle-free Wasini Island, accessible only by boat",
          "Eco-friendly cottages built with traditional Swahili coral rag and makuti thatch",
          "Direct access to traditional dhow trips for world-class dolphin spotting",
          "Unbeatable proximity to Kisite Mpunguti Marine Park's snorkeling and diving",
          "Authentic Swahili seafood dining prepared by local chefs",
          "Immersive cultural village tours supporting the local community",
        ],
        image: "/images/wasini-island-1.webp",
        images: [
          "/images/wasini-island-1.webp",
          "/images/wasini-island-2.webp",
        ],
      },
      {
        id: "charlie-claws",
        name: "Charlie Claw's & Mpunguti Lodge",
        category: "luxury",
        description: "The original Wasini Island experience. Charlie Claw's is famous for being the premier gateway to Kisite Mpunguti Marine Park. Combining luxury day-excursions with intimate island lodging, it offers the 'best day out' on the Kenyan coast.",
        story: "Charlie Claw's is more than a lodge; it's a legend. Famous for their sumptuous seafood lunches,  including giant Swahili-style crabs and lobsters,  it has been a staple for travelers since the island's earliest tourism days. Staying overnight at Mpunguti Lodge allows you to experience the island after the day-trippers leave, under a canopy of stars with only the sound of the ocean.",
        features: [
          "Premier marine park excursions: snorkeling and dolphin spotting",
          "Famous seafood lunch: Giant crab and lobster specialties",
          "Secluded island lodging away from the main tourist hubs",
          "Sunset dhow cruises around the island mangroves",
          "Expert local guides with decades of marine knowledge",
        ],
        image: "/images/wasini-island-2.webp",
        images: [
          "/images/wasini-island-2.webp",
          "/images/wasini-island-1.webp",
        ],
        website: "https://wasini.com/",
      },
    ],
  },
  {
    destinationId: "mombasa",
    destinationName: "Mombasa",
    lodges: [
      {
        id: "hotel-englishpoint",
        name: "Hotel EnglishPoint & Spa",
        category: "luxury",
        description:
          "A modern waterfront hotel and spa at English Point Marina, set across the creek from Old Mombasa and Fort Jesus with infinity-pool views, boardwalk dining, and a strong business-leisure mix.",
        story:
          "Hotel EnglishPoint is the city's polished coastal base: contemporary, architectural, and close to Mombasa's historic core. It suits guests who want marina views, spa time, and easy access to Fort Jesus, the Old Port, and the city centre without losing the feel of an oceanfront escape.",
        features: [
          "Waterfront setting at English Point Marina",
          "Infinity pool, spa, gym, and boardwalk restaurants",
          "Close to Fort Jesus, Old Town, and the Old Port",
          "Ideal for both leisure stays and corporate travel",
        ],
        image: "/images/Mombasa Hotel.webp",
        images: [
          "/images/Mombasa Hotel.webp",
          "/images/Mombasa Hotel 1.webp",
          "/images/Mombasa hotel (2).webp",
        ],
        website: "https://englishpoint.co.ke/",
      },
      {
        id: "cityblue-creekside",
        name: "CityBlue Creekside Hotel & Suites",
        category: "mid-range",
        description:
          "A 100-room creekside hotel overlooking Tudor Creek, combining Moorish-inspired architecture, a pool garden, fitness facilities, and flexible event space for business and leisure guests.",
        story:
          "CityBlue Creekside sits where Mombasa feels most layered: water, history, and city movement all in one place. The setting on Tudor Creek makes it a useful base for travelers who want the old-city atmosphere, conference convenience, and relaxed resort features in a single stop.",
        features: [
          "Overlooks Tudor Creek in historic Mombasa",
          "Moorish-inspired design with decorative arches and tiles",
          "Pool garden, restaurant, and fitness centre",
          "Well suited for events and short city stays",
        ],
        image: "/images/Mombasa Hotel 1.webp",
        images: [
          "/images/Mombasa Hotel 1.webp",
          "/images/Mombasa Hotel.webp",
          "/images/Mombasa hotel (2).webp",
        ],
        website: "https://www.citybluehotels.com/cityblue-creekside-hotel-suites-mombasa",
      },
      {
        id: "prideinn-hotel-nyali",
        name: "PrideInn Hotel Nyali",
        category: "mid-range",
        description:
          "A convenient Nyali hotel behind City Mall with easy access to beaches, nightlife, and the wider Mombasa business district, plus a pool, restaurant, and practical city-coast comfort.",
        story:
          "PrideInn Hotel Nyali is a sensible base for guests who want to stay close to the action without paying beachfront resort rates. It works well for quick Mombasa stopovers, family trips, and travelers combining city errands with the coast.",
        features: [
          "Central Nyali location behind City Mall",
          "Short distance to beaches and Mombasa nightlife",
          "Pool, restaurant, and bar on site",
          "Useful for business, transit, and short leisure stays",
        ],
        image: "/images/Mombasa hotel (2).webp",
        images: [
          "/images/Mombasa hotel (2).webp",
          "/images/Mombasa Hotel.webp",
          "/images/Mombasa Hotel 1.webp",
        ],
        website: "https://www.prideinnhotels.com/hotels-in-mombasa/prideinn-nyali/",
      },
    ],
  },
  {
    destinationId: "mombasa-north-coast",
    destinationName: "Mombasa North Coast",
    lodges: [
      {
        id: "serena-beach-resort",
        name: "Serena Beach Resort & Spa",
        category: "luxury",
        description:
          "A five-star Shanzu Beach resort inspired by a 13th-century Swahili village, with palm-fringed beachfront, landscaped gardens, a free-form pool, and the Maisha Spa.",
        story:
          "Serena Beach Resort & Spa is one of the North Coast's most distinctive stays, pairing Swahili-inspired architecture with calm beachfront living. It suits travelers who want a classic coast-resort feel with polished service, generous gardens, and easy access to Mombasa's northern beaches.",
        features: [
          "Directly on the white sands of Shanzu Beach",
          "Architecture styled after a traditional Swahili village",
          "Maisha Mind Body & Spirit Spa and free-form pool",
          "Family-friendly beachfront resort with watersports",
        ],
        image:
          "https://image-tc.galaxy.tf/wijpeg-cyj5svnn0rrxr29cimdmqvrgz/accommodation-deluxe-queen-garden-view-1-web_square.jpg?crop=333%2C0%2C1334%2C1334&width=1000",
        images: [
          "https://image-tc.galaxy.tf/wijpeg-cyj5svnn0rrxr29cimdmqvrgz/accommodation-deluxe-queen-garden-view-1-web_square.jpg?crop=333%2C0%2C1334%2C1334&width=1000",
          "https://image-tc.galaxy.tf/wijpeg-eu5em5nrzhwf3emhbgih4c9vx/superior-sea-view-room1_square.jpg?crop=239%2C0%2C1442%2C1442&width=1000",
          "https://image-tc.galaxy.tf/wijpeg-2psxqki3eywp1mg58o1gpabr9/accommodation-family-room-web_square.jpg?crop=249%2C0%2C1502%2C1502&width=1000",
        ],
        website: "https://www.serenahotels.com/serena-beach-resort-spa",
      },
      {
        id: "sarova-whitesands",
        name: "Sarova Whitesands Beach Resort & Spa",
        category: "luxury",
        description:
          "A large beachfront resort on Bamburi Beach with five swimming pools, ocean-view rooms, Tulia Spa, and strong dining options, located about 30 minutes from Mombasa city centre.",
        story:
          "Sarova Whitesands is one of the North Coast's strongest all-round resort choices. The scale works in its favor: wide grounds, multiple pools, strong food, and direct beach access give it the feel of a complete holiday compound rather than just a room by the sea.",
        features: [
          "Located on Mombasa's North Coast on Bamburi Beach",
          "Five swimming pools including a quieter pool and pool bar",
          "Tulia Spa, kids club, and multiple dining venues",
          "Good fit for families, couples, and conference travel",
        ],
        image: "https://www.sarovahotels.com/whitesands-mombasa/assets/images/room-gallery10.jpg",
        images: [
          "https://www.sarovahotels.com/whitesands-mombasa/assets/images/room-gallery10.jpg",
          "https://www.sarovahotels.com/whitesands-mombasa/assets/images/room-gallery11.jpg",
          "https://www.sarovahotels.com/whitesands-mombasa/assets/images/room-gallery2.jpg",
        ],
        website: "https://www.sarovahotels.com/whitesands-mombasa/",
      },
      {
        id: "prideinn-paradise",
        name: "PrideInn Paradise Beach Resort & Spa",
        category: "luxury",
        description:
          "A beachfront Shanzu property with ocean-view rooms, direct beach access, expansive pool facilities, a spa, and an on-site aqua park that makes it especially strong for families.",
        story:
          "PrideInn Paradise balances resort comfort with the kind of features families actually use. It has the beachfront setting, but the pool, spa, and aqua park make it more active than a standard coast hotel and easier to recommend for mixed-age groups.",
        features: [
          "Shanzu Beach location on the North Coast",
          "Ocean-view rooms and direct beach access",
          "Aqua park, spa, gym, and multiple dining venues",
          "Strong choice for family holidays and events",
        ],
        image:
          "https://www.prideinnhotels.com/wp-content/uploads/elementor/thumbs/Paradise_Room-Header-qy96o3qkztmgnjqqd8i8ykl713pb9upe63zh0j69vs.webp",
        images: [
          "https://www.prideinnhotels.com/wp-content/uploads/elementor/thumbs/Paradise_Room-Header-qy96o3qkztmgnjqqd8i8ykl713pb9upe63zh0j69vs.webp",
          "https://www.prideinnhotels.com/wp-content/uploads/elementor/thumbs/Accommodation_Paradise-10-qw2vgaz4f7034u8r6uis9o9bmfv10nar0cg2o62qvc.webp",
          "/images/real images frm Tambua/hotel.jpeg",
        ],
        website: "https://www.prideinnhotels.com/hotels-in-mombasa/prideinn-paradise/",
      },
      {
        id: "prideinn-flamingo",
        name: "PrideInn Flamingo Beach Resort & Spa",
        category: "mid-range",
        description:
          "A Shanzu Beach resort with pool and sea-view accommodation, a spa, kids facilities, and standout dining spaces including a cave restaurant and cliffside bar.",
        story:
          "PrideInn Flamingo brings more of a playful, holiday-energy feel to the North Coast. The cave restaurant and cliffside bar give it a memorable identity, while the family facilities and beachfront setting keep it practical for actual stays.",
        features: [
          "Shanzu Beach / Serena Road location",
          "Pool, spa, gym, and kids club",
          "Cave restaurant and cliffside bar for dining",
          "Good fit for couples, families, and short beach breaks",
        ],
        image:
          "https://www.prideinnhotels.com/wp-content/uploads/elementor/thumbs/PrideInn-Flamingo_Leisure1-r0dkt6l4z8434dca8q5h6zgmeg9pty08rr6svrcu4o.webp",
        images: [
          "https://www.prideinnhotels.com/wp-content/uploads/elementor/thumbs/PrideInn-Flamingo_Leisure1-r0dkt6l4z8434dca8q5h6zgmeg9pty08rr6svrcu4o.webp",
          "https://www.prideinnhotels.com/wp-content/uploads/elementor/thumbs/PrideInn-Flamingo_Swimming-Pool-qzzybjfuqs4qdu1wh42m7tvcl0jlr8dz2jbze0ipoo.webp",
          "/images/Mombasa hotel (2).webp",
        ],
        website: "https://www.prideinnhotels.com/hotels-in-mombasa/prideinn-flamingo/",
      },
      {
        id: "severin-sea-lodge",
        name: "Severin Sea Lodge",
        category: "mid-range",
        description:
          "A traditional-style beach lodge on Bamburi Beach with 188 rooms and suites, tropical gardens, spa and wellness facilities, and direct access to the Indian Ocean.",
        story:
          "Severin Sea Lodge is a dependable Bamburi Beach option for guests who want a calmer, more established resort atmosphere. The African-style design, direct beach frontage, and broad mix of rooms make it an easy fit for longer stays.",
        features: [
          "Located directly on Bamburi Beach",
          "188 rooms and suites in African-style wooden furnishings",
          "Spa, gym, pools, and watersport access",
          "Well suited to relaxed beach holidays",
        ],
        image: "/images/real images frm Tambua/hotel.jpeg",
        images: [
          "/images/real images frm Tambua/hotel.jpeg",
          "/images/Mombasa hotel (2).webp",
          "/images/popular activities/Mombasa hotel (2).webp",
        ],
        website: "https://www.severinsealodge.com/",
      },
      {
        id: "voyager-beach-resort",
        name: "Voyager Beach Resort",
        category: "mid-range",
        description:
          "A ship-themed Nyali resort with all-inclusive style dining, three pools, four bars, and a strong family-entertainment program close to the beach.",
        story:
          "Voyager has a clear identity that makes it easy to place: lively, family-oriented, and geared toward guests who want more animation and activity than a quiet beach hotel. It works well for Mombasa stays that should feel fun and self-contained.",
        features: [
          "Nyali location off Links Road",
          "All-inclusive feel with three pools and four bars",
          "Family entertainment, watersports, and themed shows",
          "Good base for beach holidays near Mombasa city",
        ],
        image: "/images/popular activities/Mombasa hotel (2).webp",
        images: [
          "/images/popular activities/Mombasa hotel (2).webp",
          "/images/real images frm Tambua/hotel.jpeg",
          "/images/Mombasa hotel (2).webp",
        ],
        website: "https://www.heritage-eastafrica.com/voyagerbeachresort/",
      },
    ],
  },
];

export function getLodgesForDestination(destinationId: string): Lodge[] {
  return (
    destinationLodges.find((d) => d.destinationId === destinationId)?.lodges ?? []
  );
}

export function getAllLodges(): Lodge[] {
  return destinationLodges.flatMap((d) => d.lodges);
}
