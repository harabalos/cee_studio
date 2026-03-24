export interface Project {
  id: number;
  slug: string;
  title: string;
  client: string;
  year: string;
  category: string;
  description: string;
  coverImage: string;
  images: string[];
}

export const projects: Project[] = [
  {
    id: 1,
    slug: "noir-collection",
    title: "Noir Collection",
    client: "Maison Vaud",
    year: "2024",
    category: "Photography",
    description:
      "A monochromatic editorial series exploring texture and form through the lens of Swiss minimalism. Shot on location in Zurich's industrial quarter, each frame captures the raw elegance of the autumn/winter collection.",
    coverImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=1000&fit=crop",
    ],
  },
  {
    id: 2,
    slug: "alpine-luxe",
    title: "Alpine Luxe",
    client: "Schweizer Stil",
    year: "2024",
    category: "Campaign",
    description:
      "A campaign merging haute couture with the Swiss Alps. We brought the studio to 2,400 meters, using natural light and mountain backdrops to frame a new vision of alpine luxury.",
    coverImage: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800&h=1000&fit=crop",
    ],
  },
  {
    id: 3,
    slug: "essence-fragrance",
    title: "Essence",
    client: "Lumière Parfums",
    year: "2023",
    category: "Product",
    description:
      "Product photography for a Swiss niche fragrance house. Each bottle was lit to reveal its sculptural form, with compositions that evoke the scent profiles — amber, cedar, iris.",
    coverImage: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1594035910387-fea081ae7aec?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=1200&h=800&fit=crop",
    ],
  },
  {
    id: 4,
    slug: "urban-portrait-series",
    title: "Urban Portraits",
    client: "Faces Magazine",
    year: "2024",
    category: "Editorial",
    description:
      "An editorial portrait series for Faces Magazine's spring issue, featuring Zurich's emerging creative scene — artists, musicians, and designers in their natural environments.",
    coverImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop",
    ],
  },
  {
    id: 5,
    slug: "movement-campaign",
    title: "Movement",
    client: "Zuri Athletics",
    year: "2023",
    category: "Video",
    description:
      "A brand film and stills campaign for a Zurich-based athleisure label. We captured motion and energy in-studio with high-speed cameras, producing both a 60-second hero film and a full lookbook.",
    coverImage: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1539794830467-1f1e5990b66d?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=1000&fit=crop",
    ],
  },
  {
    id: 6,
    slug: "still-life-series",
    title: "Still Life",
    client: "Haus Interior",
    year: "2023",
    category: "Product",
    description:
      "A product photography series for a curated Swiss interior design house. Sculptural compositions that transform everyday objects into art, shot with precise studio lighting.",
    coverImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=1000&fit=crop",
    ],
  },
  {
    id: 7,
    slug: "runway-ss24",
    title: "Runway SS24",
    client: "Zurich Fashion Days",
    year: "2024",
    category: "Photography",
    description:
      "Official photography coverage of Zurich Fashion Days Spring/Summer 2024. Backstage, runway, and atmosphere — capturing the pulse of Swiss fashion week.",
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop",
    ],
  },
  {
    id: 8,
    slug: "terra-editorial",
    title: "Terra",
    client: "Boden Magazine",
    year: "2023",
    category: "Editorial",
    description:
      "An earth-toned editorial exploring sustainability and craftsmanship in Swiss fashion. Shot across three days in natural light, using only natural and recycled fabrics.",
    coverImage: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=1200&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=1000&fit=crop",
    ],
  },
];
