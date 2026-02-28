import { NextResponse } from 'next/server';

const ALL_BOOKS = [
  { judul: "The Silent Echo", genre: "Fiction", cover: "https://picsum.photos/seed/book1/400/600", deskripsi: "A story about a man who discovers a hidden world within his own memories." },
  { judul: "Whispers in the Dark", genre: "Horror", cover: "https://picsum.photos/seed/book2/400/600", deskripsi: "Something is lurking in the shadows of the old Victorian mansion." },
  { judul: "Beyond the Horizon", genre: "Sci-Fi", cover: "https://picsum.photos/seed/book3/400/600", deskripsi: "The first interstellar mission faces an unexpected cosmic anomaly." },
  { judul: "Crimson Skies", genre: "Romance", cover: "https://picsum.photos/seed/book4/400/600", deskripsi: "Two rival pilots find love amidst a global aerial conflict." },
  { judul: "The Iron Fortress", genre: "Fiction", cover: "https://picsum.photos/seed/book5/400/600", deskripsi: "A young knight must defend his home against an unstoppable army." },
  { judul: "Stellar Odyssey", genre: "Sci-Fi", cover: "https://picsum.photos/seed/book6/400/600", deskripsi: "A journey across the galaxy in search of a new home for humanity." },
  { judul: "Midnight Shadows", genre: "Horror", cover: "https://picsum.photos/seed/book7/400/600", deskripsi: "A small town is haunted by a mysterious figure that appears at midnight." },
  { judul: "Eternal Flame", genre: "Romance", cover: "https://picsum.photos/seed/book8/400/600", deskripsi: "A love story that transcends time and space." },
  { judul: "The Lost City", genre: "Fiction", cover: "https://picsum.photos/seed/book9/400/600", deskripsi: "An archaeologist discovers a city that was thought to be a myth." },
  { judul: "Neon Dreams", genre: "Sci-Fi", cover: "https://picsum.photos/seed/book10/400/600", deskripsi: "In a cyberpunk future, a hacker uncovers a corporate conspiracy." },
  { judul: "The Haunting of Hillside", genre: "Horror", cover: "https://picsum.photos/seed/book11/400/600", deskripsi: "A family moves into a house with a dark and bloody history." },
  { judul: "Starlit Night", genre: "Romance", cover: "https://picsum.photos/seed/book12/400/600", deskripsi: "Two strangers meet under the stars and change each other's lives." },
  { judul: "The Secret Garden", genre: "Fiction", cover: "https://picsum.photos/seed/book13/400/600", deskripsi: "A young girl finds a hidden garden and brings it back to life." },
  { judul: "Galactic War", genre: "Sci-Fi", cover: "https://picsum.photos/seed/book14/400/600", deskripsi: "A massive battle for control of the galaxy breaks out." },
  { judul: "The Ghostly Presence", genre: "Horror", cover: "https://picsum.photos/seed/book15/400/600", deskripsi: "A paranormal investigator encounters a spirit that won't leave." },
  { judul: "Love in the City", genre: "Romance", cover: "https://picsum.photos/seed/book16/400/600", deskripsi: "A romantic comedy set in the heart of a bustling metropolis." },
  { judul: "The Ancient Scroll", genre: "Fiction", cover: "https://picsum.photos/seed/book17/400/600", deskripsi: "A mysterious scroll holds the key to an ancient power." },
  { judul: "Cybernetic Soul", genre: "Sci-Fi", cover: "https://picsum.photos/seed/book18/400/600", deskripsi: "A robot develops human emotions and struggles to find its place." },
  { judul: "The Cursed Woods", genre: "Horror", cover: "https://picsum.photos/seed/book19/400/600", deskripsi: "A group of friends gets lost in a forest that is said to be cursed." },
  { judul: "Heart's Desire", genre: "Romance", cover: "https://picsum.photos/seed/book20/400/600", deskripsi: "A woman follows her heart and finds true love in an unexpected place." },
  { judul: "The Hidden Path", genre: "Fiction", cover: "https://picsum.photos/seed/book21/400/600", deskripsi: "A young man discovers a path that leads to a secret world." },
  { judul: "Interstellar Journey", genre: "Sci-Fi", cover: "https://picsum.photos/seed/book22/400/600", deskripsi: "A crew of astronauts embarks on a mission to explore a distant planet." },
  { judul: "The Dark Asylum", genre: "Horror", cover: "https://picsum.photos/seed/book23/400/600", deskripsi: "A journalist investigates an abandoned asylum with a terrifying past." },
  { judul: "Summer Love", genre: "Romance", cover: "https://picsum.photos/seed/book24/400/600", deskripsi: "A sweet romance that blossoms during a hot summer vacation." },
  { judul: "The Forgotten Empire", genre: "Fiction", cover: "https://picsum.photos/seed/book25/400/600", deskripsi: "A historian uncovers the secrets of a long-lost civilization." },
  { judul: "Space Station Zeta", genre: "Sci-Fi", cover: "https://picsum.photos/seed/book26/400/600", deskripsi: "A mystery unfolds on a remote space station orbiting a black hole." },
  { judul: "The Shadow Man", genre: "Horror", cover: "https://picsum.photos/seed/book27/400/600", deskripsi: "A child is terrified by a mysterious figure that lives in the shadows." },
  { judul: "Autumn Leaves", genre: "Romance", cover: "https://picsum.photos/seed/book28/400/600", deskripsi: "A poignant love story set against the backdrop of falling leaves." },
  { judul: "The Secret Map", genre: "Fiction", cover: "https://picsum.photos/seed/book29/400/600", deskripsi: "A treasure hunter finds a map that leads to a legendary fortune." },
  { judul: "Binary Star", genre: "Sci-Fi", cover: "https://picsum.photos/seed/book30/400/600", deskripsi: "A story about two planets locked in a complex gravitational dance." },
  { judul: "The Haunted Mirror", genre: "Horror", cover: "https://picsum.photos/seed/book31/400/600", deskripsi: "A mirror that shows more than just your reflection." },
  { judul: "Winter Rose", genre: "Romance", cover: "https://picsum.photos/seed/book32/400/600", deskripsi: "A beautiful romance that blooms in the middle of a cold winter." },
  { judul: "The Alchemist's Apprentice", genre: "Fiction", cover: "https://picsum.photos/seed/book33/400/600", deskripsi: "A young boy learns the secrets of alchemy from a master." },
  { judul: "Robot Revolution", genre: "Sci-Fi", cover: "https://picsum.photos/seed/book34/400/600", deskripsi: "A group of robots rebels against their human creators." },
  { judul: "The Screaming Skulls", genre: "Horror", cover: "https://picsum.photos/seed/book35/400/600", deskripsi: "A terrifying tale of a house filled with screaming skulls." },
  { judul: "Spring Awakening", genre: "Romance", cover: "https://picsum.photos/seed/book36/400/600", deskripsi: "A fresh and vibrant romance that starts with the first flowers of spring." },
  { judul: "The Golden Compass", genre: "Fiction", cover: "https://picsum.photos/seed/book37/400/600", deskripsi: "A magical compass leads a young girl on an epic adventure." },
  { judul: "Warp Drive", genre: "Sci-Fi", cover: "https://picsum.photos/seed/book38/400/600", deskripsi: "The invention of warp drive changes the course of human history." },
  { judul: "The Poltergeist", genre: "Horror", cover: "https://picsum.photos/seed/book39/400/600", deskripsi: "A family is tormented by a malevolent spirit in their new home." },
  { judul: "Moonlight Kiss", genre: "Romance", cover: "https://picsum.photos/seed/book40/400/600", deskripsi: "A romantic encounter under the light of a full moon." },
  { judul: "The Dragon's Lair", genre: "Fiction", cover: "https://picsum.photos/seed/book41/400/600", deskripsi: "A brave warrior enters a dragon's lair to save his kingdom." },
  { judul: "Alien Contact", genre: "Sci-Fi", cover: "https://picsum.photos/seed/book42/400/600", deskripsi: "Humanity makes first contact with an extraterrestrial civilization." },
  { judul: "The Evil Within", genre: "Horror", cover: "https://picsum.photos/seed/book43/400/600", deskripsi: "A man discovers that the real horror is inside himself." },
  { judul: "Star-Crossed Lovers", genre: "Romance", cover: "https://picsum.photos/seed/book44/400/600", deskripsi: "Two lovers from rival families struggle to be together." },
  { judul: "The Magic Flute", genre: "Fiction", cover: "https://picsum.photos/seed/book45/400/600", deskripsi: "A flute that has the power to charm anyone who hears it." },
  { judul: "Time Traveler", genre: "Sci-Fi", cover: "https://picsum.photos/seed/book46/400/600", deskripsi: "A man travels back in time to change the future." },
  { judul: "The Nightmare", genre: "Horror", cover: "https://picsum.photos/seed/book47/400/600", deskripsi: "A terrifying nightmare that becomes a reality." },
  { judul: "Love's Journey", genre: "Romance", cover: "https://picsum.photos/seed/book48/400/600", deskripsi: "A couple embarks on a journey to find themselves and each other." },
  { judul: "The Enchanted Forest", genre: "Fiction", cover: "https://picsum.photos/seed/book49/400/600", deskripsi: "A forest where anything is possible and magic is real." },
  { judul: "The Singularity", genre: "Sci-Fi", cover: "https://picsum.photos/seed/book50/400/600", deskripsi: "The moment when artificial intelligence surpasses human intelligence." },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pageStr = url.searchParams.get('page');
  let page = parseInt(pageStr || '1', 10);
  
  if (isNaN(page) || page < 1) {
    page = 1;
  }
  
  const limit = 10;
  const totalItems = ALL_BOOKS.length;
  const totalPages = Math.ceil(totalItems / limit);
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const books = ALL_BOOKS.slice(startIndex, endIndex);
  
  return NextResponse.json({
    currentPage: page,
    totalPages: totalPages,
    books: books
  });
}
