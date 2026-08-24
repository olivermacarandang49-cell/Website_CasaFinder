export interface ReviewReply {
  id: string;
  authorName: string;
  authorUsername: string;
  authorRole: 'landlord' | 'student';
  comment: string;
  date: string;
}

export interface Review {
  id: string;
  studentName: string;
  studentUsername: string;
  rating: number; // 1 to 5
  comment?: string;
  date: string;
  replies?: ReviewReply[];
}

export interface LandlordPermits {
  businessPermit?: string;
  barangayClearance?: string;
  dtiRegistration?: string;
  fireSafetyCert?: string;
  sanitaryPermit?: string;
}

export interface Property {
  id: string;
  title: string;
  price: number;
  type: 'Boarding House' | 'Apartment' | 'Others' | string;
  beds: number;
  baths: number;
  sqft: number; // Stated as square meters in the description
  address: string;
  city: string;
  neighborhood: string; // Barangay
  description: string;
  image: string;
  features: string[];
  tags: string[];
  yearBuilt: number;
  parking: string;
  heating: string; // Representing cooling/ventilation
  coordinates: { x: number; y: number };
  genderPolicy?: 'Girls Only' | 'Boys Only' | 'Both';
  reviews?: Review[];
  landlordUsername?: string;
  landlordName?: string;
  landlordMobile?: string;
  landlordEmail?: string;
  landlordFacebook?: string;
  landlordAvatar?: string;
  landlordBio?: string;
  landlordPermits?: LandlordPermits;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

export const properties: Property[] = [
  {
    id: "slsu-elite-dorm",
    title: "SLSU Elite Dorm – Near Villa Nava Campus",
    price: 4500,
    type: "Boarding House",
    beds: 1,
    baths: 1,
    sqft: 25,
    address: "Lot 12 Brgy. Road, Brgy. Pipisik, Gumaca, Quezon",
    city: "Gumaca",
    neighborhood: "Barangay Pipisik",
    description:
      "Secure, air-conditioned boarding house steps from the SLSU Villa Nava shuttle stop. " +
      "Each room includes a single/over-single bed, study desk with lamp, built-in cabinet, " +
      "and dedicated locker. 24/7 security guard, CCTV coverage, and a gated perimeter keep tenants safe. " +
      "Shared Wi-Fi zones and a rooftop laundry area are available. Walking distance to campus, Jollibee, and local eateries.",
    image:
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
    features: [
      "Wi-Fi / Internet", "Aircon", "Study Desk & Chair",
      "Bed & Mattress Included", "Cabinet / Wardrobe",
      "CCTV Security & Gated", "Laundry / Washing Area",
      "No Curfew (24/7 Access)", "Drinking Water Station", "Refrigerator Access",
    ],
    tags: ["Near Campus", "Air-conditioned", "Study-Friendly", "Gated & Secure", "24/7 Access"],
    yearBuilt: 2022,
    parking: "Motorcycle Parking (10 slots)",
    heating: "Aircon + Electric Fan",
    coordinates: { x: 13.9252, y: 122.0975 },
    genderPolicy: "Both",
    landlordUsername: "nena.landlord",
    landlordName: "Aling Nena",
    landlordMobile: "09987654321",
    landlordEmail: "alingnena.housing@gmail.com",
    landlordFacebook: "https://facebook.com/alingnena.housing",
    landlordAvatar: "https://images.unsplash.com/photo-1544005313-997d56c87c61?auto=format&fit=crop&q=80&w=200",
    landlordBio: "Owner of Nena's Student & Worker Residences in Brgy. Tabing Dagat, Gumaca. Providing clean and safe lodgings for tenants since 2018.",
    landlordPermits: {
      businessPermit: "BP-GMC-2026-0881",
      barangayClearance: "BC-PIP-2026-0442",
      fireSafetyCert: "FSC-GMC-2025-1190",
      sanitaryPermit: "SP-TND-2025-0671",
    },
    approvalStatus: "approved" as const,
    reviews: [
      {
        id: "rev-slsu-elite-1",
        studentName: "Maria Santos",
        studentUsername: "maria.s",
        rating: 5,
        comment: "Great location — I walk to campus in 7 minutes! The aircon units are powerful and the security guard is very friendly. Highly recommended for SLSU students.",
        date: "2025-03-15",
      },
      {
        id: "rev-slsu-elite-2",
        studentName: "Juan Dela Cruz",
        studentUsername: "juan.student",
        rating: 4,
        comment: "Clean rooms and fast Wi-Fi. Only downside is the shared bathroom could use a bit more privacy, but overall a solid choice near campus.",
        date: "2025-02-08",
      },
    ],
  },
  {
    id: "dagat-bay-coliving",
    title: "Dagat Bay Coliving – Modern Beachside Units",
    price: 5200,
    type: "Apartment",
    beds: 2,
    baths: 2,
    sqft: 45,
    address: "28 Tabing Dagat Drive, Brgy. Tabing Dagat, Gumaca, Quezon",
    city: "Gumaca",
    neighborhood: "Barangay Tabing Dagat",
    description:
      "Contemporary coliving apartment complex just a 5-minute walk from the Gumaca bayfront " +
      "and Kutang San Diego. Each unit features a fully equipped kitchen, in-unit aircon, " +
      "and high-speed fiber Wi-Fi. Building amenities include a sky lounge, bike storage, " +
      "and covered motorcycle parking. Perfect for students who want comfort near the beach and town proper.",
    image:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    features: [
      "Wi-Fi / Internet", "Aircon", "Cooking Allowed / Kitchen",
      "Private Bathroom", "Refrigerator Access", "Bed & Mattress Included",
      "Cabinet / Wardrobe", "CCTV Security & Gated",
      "Motorcycle Parking", "Drinking Water Station",
    ],
    tags: ["Near Beach", "Fully Furnished", "Modern", "Kitchen Included", "Sky Lounge"],
    yearBuilt: 2023,
    parking: "Covered Motorcycle Parking (15 slots)",
    heating: "Aircon (Split-type, in-unit)",
    coordinates: { x: 13.9258, y: 122.0965 },
    genderPolicy: "Both",
    landlordUsername: "nena.landlord",
    landlordName: "Aling Nena",
    landlordMobile: "09987654321",
    landlordEmail: "alingnena.housing@gmail.com",
    landlordFacebook: "https://facebook.com/alingnena.housing",
    landlordAvatar: "https://images.unsplash.com/photo-1544005313-997d56c87c61?auto=format&fit=crop&q=80&w=200",
    landlordBio: "Owner of Nena's Student & Worker Residences in Brgy. Tabing Dagat, Gumaca. Providing clean and safe lodgings for tenants since 2018.",
    landlordPermits: {
      businessPermit: "BP-GMC-2026-0881",
      barangayClearance: "BC-TND-2026-0331",
      fireSafetyCert: "FSC-GMC-2025-1190",
    },
    approvalStatus: "approved" as const,
    reviews: [
      {
        id: "rev-dagat-1",
        studentName: "Elena Reyes",
        studentUsername: "elena.r",
        rating: 5,
        comment: "The sky lounge is amazing for group study sessions! The location is perfect — close to the market and tricycle terminal. The kitchen is fully equipped so we can cook our own meals.",
        date: "2025-04-02",
        replies: [
          {
            id: "reply-dagat-1",
            authorName: "Aling Nena",
            authorUsername: "nena.landlord",
            authorRole: "landlord",
            comment: "Thank you po, Elena! We're glad you're enjoying the coliving space. The sky lounge is our favorite spot too for sunset views. ☺",
            date: "2025-04-03",
          },
        ],
      },
      {
        id: "rev-dagat-2",
        studentName: "Pedro Cruz",
        studentUsername: "pedro.c",
        rating: 4,
                comment: "Nice place overall but the internet can be slow during peak hours. The building security is top-notch though and the location is unbeatable.",
        date: "2025-01-20",
      },
    ],
  },
  {
    id: "la-villa-estudiante",
    title: "La Villa Estudiante – Affordable Campus Apartments",
    price: 3800,
    type: "Apartment",
    beds: 1,
    baths: 1,
    sqft: 30,
    address: "Block 8 Lot 3 Villa Nava Subdivision, Brgy. Villa Nava, Gumaca, Quezon",
    city: "Gumaca",
    neighborhood: "Barangay Villa Nava",
    description:
      "Budget-friendly student apartments right behind the SLSU Villa Nava main gate. " +
      "Each 30-sqm unit comes with a small balcony, aircon, study nook, and access to a shared kitchen " +
      "and dining area. Coin-operated washing machines and a small grocery corner are on the ground floor. " +
      "Ideal for students who want an economical yet comfortable home near campus.",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    features: [
      "Wi-Fi / Internet", "Aircon", "Electric Fan",
      "Study Desk & Chair", "Cooking Allowed / Kitchen",
      "Shared Bathroom", "Bed & Mattress Included",
      "Cabinet / Wardrobe", "Submetered Electricity",
      "Free / Submetered Water",
    ],
    tags: ["Budget-Friendly", "Near Campus", "Student-approved", "Study Area", "Shared Kitchen"],
    yearBuilt: 2019,
    parking: "Street Parking Available",
    heating: "Aircon (Window-type) + Electric Fan",
    coordinates: { x: 13.912125, y: 122.104057 },
    genderPolicy: "Both",
    landlordUsername: "carlos.santos",
    landlordName: "Mr. Carlos Santos",
    landlordMobile: "09182345678",
    landlordEmail: "carlossantos.villanava@gmail.com",
    landlordFacebook: "https://facebook.com/carlossantos.vna",
    landlordAvatar: "https://images.unsplash.com/photo-1535713875002-d6a26b7a4e9c?auto=format&fit=crop&q=80&w=200",
    landlordBio:
      "Property manager of La Villa Estudiante, a budget-friendly student housing complex near SLSU Villa Nava. " +
      "Committed to providing clean, safe, and affordable accommodation for Gumaca students.",
    landlordPermits: {
      businessPermit: "BP-GMC-2024-0776",
      barangayClearance: "BC-VLN-2024-0201",
    },
    approvalStatus: "approved" as const,
    reviews: [
      {
        id: "rev-villa-1",
        studentName: "Sofia Ramirez",
        studentUsername: "sofia.r",
        rating: 4,
        comment: "Perfect for students on a budget! It's literally behind the campus gate so I save a lot on transportation. The shared kitchen is clean and the study area is well-lit.",
        date: "2025-03-10",
      },
      {
        id: "rev-villa-2",
        studentName: "Andre Bautista",
        studentUsername: "andre.b",
        rating: 3,
        comment: "Good value for money but the shared bathroom gets crowded during morning rush hours. The aircon works great though and the location is unbeatable.",
        date: "2025-02-18",
      },
        ],
  },
  {
    id: "green-eco-apts",
    title: "Green Eco Apts – Sustainable Student Living",
    price: 4800,
    type: "Apartment",
    beds: 2,
    baths: 1,
    sqft: 40,
    address: "Lot 7 Greenhills Village, Brgy. San Diego, Gumaca, Quezon",
    city: "Gumaca",
    neighborhood: "Barangay San Diego",
    description:
      "Eco-conscious apartment complex featuring solar panels, rainwater harvesting, " +
      "and energy-efficient LED lighting throughout. Located in a quiet residential area " +
      "near Gumaca National High School and the BIR District Office. Each unit has a balcony " +
      "garden space and comes with a basic furniture package. Communal composting and a small " +
      "herb garden are maintained by residents. Environmentally friendly living without sacrificing comfort.",
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    features: [
      "Wi-Fi / Internet", "Aircon", "Electric Fan",
      "Cooking Allowed / Kitchen", "Private Bathroom",
      "Bed & Mattress Included", "Cabinet / Wardrobe",
      "Solar Power Backup", "Laundry / Washing Area",
      "Motorcycle Parking",
    ],
    tags: ["Eco-Friendly", "Quiet Area", "Near School", "Solar-Powered", "Garden Balcony"],
    yearBuilt: 2021,
    parking: "Designated Motorcycle Slots (8 slots)",
    heating: "Aircon (Split-type) + Electric Fan",
    coordinates: { x: 13.9188, y: 122.0945 },
    genderPolicy: "Both",
    landlordUsername: "eco.gumaca",
    landlordName: "Green Living Housing Corp.",
    landlordMobile: "09251234567",
    landlordEmail: "greenliving@gumacaeco.com.ph",
    landlordFacebook: "https://facebook.com/gumacagreenliving",
    landlordAvatar: "https://images.unsplash.com/photo-1472099645785-54d53a7d5d47?auto=format&fit=crop&q=80&w=200",
    landlordBio:
      "Green Living Housing Corporation develops and manages eco-friendly student accommodations " +
      "in Gumaca. We believe in sustainable living that benefits both residents and the environment.",
    landlordPermits: {
      businessPermit: "BP-GMC-2023-0950",
      barangayClearance: "BC-SND-2023-0789",
      sanitaryPermit: "SP-GLH-2023-0112",
    },
    approvalStatus: "approved" as const,
    reviews: [
      {
        id: "rev-eco-1",
        studentName: "Luna Cruz",
        studentUsername: "luna.c",
        rating: 5,
        comment: "I love the eco-friendly vibe here! The solar panels mean no power interruptions and the balcony garden is such a nice touch. The location near GNHS is also very convenient.",
        date: "2025-04-10",
      },
    ],
  },
];
