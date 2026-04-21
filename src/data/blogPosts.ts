export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  readTime: string;
  content: string;
  status?: "draft" | "published";
}

export const posts: BlogPost[] = [
  {
    id: "1",
    title: "Kenya's Visa-Free Entry (ETA): Everything Travelers Need to Know for 2026",
    excerpt: "Kenya has officially transitioned to a visa-free travel system for global visitors. Learn how to apply for your Electronic Travel Authorisation (ETA) quickly.",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80",
    date: "Apr 5, 2026",
    category: "Travel Updates",
    readTime: "4 min read",
    content: `
      <p>Kenya has officially transitioned to a visa-free travel system for global visitors, replacing the traditional visa with the Electronic Travel Authorisation (ETA). This groundbreaking move makes visiting the heart of African safari simpler than ever before.</p>
      <h3>What is the ETA?</h3>
      <p>The Electronic Travel Authorisation is a mandatory digital document that all visitors must obtain before travelling to Kenya. It is designed to streamline the immigration process and enhance border security.</p>
      <h3>How to Apply</h3>
      <p>Applying is fully digital and takes less than 15 minutes. Visitors simply visit the official Kenyan government portal, upload their passport bio-page, input their flight and accommodation details (like your Tambua Africa itinerary), and pay the processing fee.</p>
      <p>Approval typically takes 72 hours, though we recommend applying at least two weeks before your departure date.</p>
    `
  },
  {
    id: "2",
    title: "Record Rhino Numbers Recorded in Lake Nakuru After Conservation Wins",
    excerpt: "Breaking news from the Kenya Wildlife Service reports a significant year-over-year increase in both black and white rhino populations in the Great Rift Valley.",
    image: "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800&q=80",
    date: "Mar 28, 2026",
    category: "Conservation News",
    readTime: "5 min read",
    content: `
      <p>Breaking news from the Kenya Wildlife Service reports a significant year-over-year increase in both black and white rhino populations in the Great Rift Valley, specifically within the protected borders of Lake Nakuru National Park.</p>
      <p>For decades, rhinos faced existential threats from poachers. However, thanks to the combined efforts of local rangers, international conservation funds, and strict anti-poaching technology including drone surveillance and GPS tracking, the tide has turned.</p>
      <h3>The Impact of Tourism</h3>
      <p>Your visit matters. The funds generated from park entry fees directly finance these anti-poaching units. When you book a safari with Tambua Africa, you are directly contributing to the salaries of the rangers who protect these magnificent creatures.</p>
      <p>Lake Nakuru now boasts one of the highest densities of rhinos in East Africa, making it a guaranteed highlight on our Rift Valley itineraries.</p>
    `
  },
  {
    id: "3",
    title: "The Rise of Silent Safaris: Electric Vehicles Transform the Masai Mara",
    excerpt: "The future of the African safari has arrived. Several top-tier luxury camps in the Mara have transitioned to 100% electric, solar-charged 4x4s.",
    image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80",
    date: "Mar 15, 2026",
    category: "Eco Tourism",
    readTime: "6 min read",
    content: `
      <p>The future of the African safari has arrived. Several top-tier luxury camps in the Mara have transitioned to 100% electric, solar-charged 4x4s. Experience the incredible difference of tracking a leopard without the rumble of a diesel engine.</p>
      <p>Traditionally, the roar of a Land Cruiser engine was as common on the savannah as the roar of a lion. But the noise often scares away timid wildlife and disrupts the natural soundscape of the bush.</p>
      <h3>A Stealthy Approach</h3>
      <p>Electric safari vehicles (ESVs) allow guides to approach wildlife in near-total silence. This has resulted in closer encounters, longer sightings, and significantly less stress placed on the animals.</p>
      <p>Furthermore, these vehicles are charged entirely by solar panels located at the lodges, creating a zero-emission safari experience that aligns with our commitment to sustainable tourism.</p>
    `
  },
  {
    id: "4",
    title: "Understanding The Great Migration's 'New Normal' Weather Patterns",
    excerpt: "Climate shifts have slightly altered the traditional timeline of the Great Wildebeest Migration. We break down the absolute best months to book.",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
    date: "Mar 2, 2026",
    category: "Wildlife Tracking",
    readTime: "7 min read",
    content: `
      <p>Climate shifts have slightly altered the traditional timeline of the Great Wildebeest Migration. We break down the absolute best months to book your 2026/2027 river crossing excursions based on real-time ecological data.</p>
      <p>Historically, the herds arrived in the Masai Mara in July and departed by late October. However, irregular rainfall in the Serengeti has caused the herds to move unpredictably. Sometimes they arrive as early as mid-June, and sometimes they linger into November.</p>
      <h3>How We Track the Herds</h3>
      <p>At Tambua Africa, our guides are in constant communication with localized spotters across the Mara-Serengeti ecosystem. We use satellite weather data to predict grass growth, which dictates exactly where the 1.5 million wildebeest will move next.</p>
      <p>For the best chance to see a dramatic Mara River crossing this year, we recommend booking between late July and early September, remaining flexible with your daily game drive schedules.</p>
    `
  },
  {
    id: "5",
    title: "Diani Beach Crowned Africa's Leading Beach Destination Again",
    excerpt: "For over a decade running, Diani Beach remains the reigning champion of the World Travel Awards. From new beachfront dining concepts to exclusive retreats.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    date: "Feb 18, 2026",
    category: "Awards & Recognition",
    readTime: "3 min read",
    content: `
      <p>For over a decade running, Diani Beach remains the reigning champion of the World Travel Awards. From new beachfront dining concepts to exclusive kite-surfing retreats, here is what’s new on the white sands of the Swahili Coast.</p>
      <p>Stretching for 17 kilometers along the Indian Ocean, Diani is famous for its powder-white sand, crystal-clear turquoise waters, and ancient coral reefs. But it’s the recent surge in world-class amenities that keeps it at the top.</p>
      <h3>What's New in Diani?</h3>
      <p>2026 brings a wave of new boutique wellness retreats and eco-conscious dive centers. The local culinary scene has also exploded with fresh Swahili-fusion restaurants right on the beach.</p>
      <p>Diani is the perfect post-safari relaxation spot, which is why we include it as the grand finale in our popular "Bush to Beach" itineraries.</p>
    `
  },
  {
    id: "6",
    title: "How to Photograph the Samburu Special Five",
    excerpt: "The arid landscapes of Northern Kenya require specialized photography techniques to capture the rare Grevy's Zebra and Reticulated Giraffe.",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
    date: "Feb 10, 2026",
    category: "Photography",
    readTime: "8 min read",
    content: `
      <p>The arid landscapes of Northern Kenya require specialized photography techniques to capture the rare "Samburu Special Five": the Grevy's Zebra, Reticulated Giraffe, Somali Ostrich, Gerenuk, and Beisa Oryx.</p>
      <h3>Dealing with Harsh Light</h3>
      <p>Northern Kenya is hot and bright. The golden hour (the first hour of light after sunrise and the last hour before sunset) is crucial here. During the high noon heat, the intense contrast and heat haze will ruin most telephoto shots.</p>
      <h3>Gear Recommendations</h3>
      <p>A 100-400mm or 200-600mm lens is ideal, as animals in Samburu can sometimes be skittish due to the vast, open terrain. Additionally, a polarizing filter is highly recommended to cut through the atmospheric glare and enrich the incredibly deep blue skies of the region.</p>
      <p>Join our specialized photographic safaris, where our driver-guides are trained to position the vehicle for the perfect lighting angle.</p>
    `
  },
];