export interface Testimonial {
  id: string;
  name: string;
  title: string;
  quote: string;
  avatar: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Palca Shibale",
    title: "Seattle, Washington USA",
    quote: "Booking through you was very easy and made our lives so much easier. I have nothing bad to say! Thank you for giving us tips and guidance before we left on what to bring and such, that was very helpful! Thanks again.",
    avatar: "/images/real images frm Tambua/Dr. Palca  Shibale from Seattle USa.jpeg",
    rating: 5,
  },
  {
    id: "2",
    name: "Briscan Shibale",
    title: "Toronto, Canada",
    quote: "We had a wonderful time! I highly recommend Tambua Africa Safaris. It was perfect for not being crowded in the bus. The parks were great. Thanks so much for finding the perfect spot for us for spring break :)",
    avatar: "/images/real images frm Tambua/Eng. Briscan Shibale from Seattle USA.jpeg",
    rating: 5,
  },
  {
    id: "3",
    name: "Amos Shibale",
    title: "Washington University, Seattle USA",
    quote: "Jorim was great with the entire process from planning to updates during the trip. We had 11 people and everything was perfectly executed. We appreciate all of his hard work. It was truly the trip of a lifetime.",
    avatar: "/images/real images frm Tambua/DR. Amos Shibale from Seattle USA.jpeg",
    rating: 5,
  },
  {
    id: "4",
    name: "Odilliah Sagali",
    title: "Seattle Washington, Department of Health USA",
    quote: "We are so pleased with Tambua Africa. Thank you for setting up such an amazing trip for us and taking care of all the details! We will definitely recommend you.",
    avatar: "/images/real images frm Tambua/Mrs Odilliah Sagali from Seattle USA.jpeg",
    rating: 5,
  },
];
