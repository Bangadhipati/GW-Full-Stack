// This file provides seed data for the backend.
// It should not include 'id' as MongoDB automatically generates '_id'.

export interface ISeedBlogAuthor {
  name: string;
  bio?: string;
}

export interface ISeedBlogPost {
  title: string;
  description: string;
  content: string;
  thumbnail: string;
  date: string;
  author: string;
  authors?: ISeedBlogAuthor[];
  category: string;
}

export const blogPosts: ISeedBlogPost[] = [
  {
    title: "The Bengali Renaissance: A Cultural Awakening",
    description: "Exploring the intellectual and cultural revolution that shaped modern Bengal and its lasting impact on Indian civilization.",
    content: `The Bengali Renaissance was a cultural, social, intellectual, and artistic movement in Bengal during the period of British rule, from the 19th century to the early 20th century.

## The Pioneers

Raja Ram Mohan Roy, often called the "Father of the Bengali Renaissance," was instrumental in abolishing the practice of Sati and promoting modern education.

## Impact on Literature

The Renaissance saw the emergence of great literary figures like Rabindranath Tagore, Bankim Chandra Chattopadhyay, and Ishwar Chandra Vidyasagar.

## Legacy

The Bengali Renaissance fundamentally transformed Bengal's social fabric, promoting rationalism, modern education, and social reform.`,
    thumbnail: "/bengali-renaissance.jpg",
    date: "2026-02-15",
    author: "Debarghya Bhowmick and Team GW",
    category: "History",
  },
  {
    title: "The Eternal Rhythm of the Bengali Soul: Baro Mashe Tero Parbon",
    description: "Twelve months, thirteen festivals — the vibrant cycle of Bengali celebrations that keeps the culture alive.",
    content: `Bengal is often described through the phrase "Baro Mashe Tero Parbon" — twelve months and thirteen festivals. This saying captures the essence of Bengali life.

## A Festival for Every Season

From Poila Boishakh to Poush Parbon, each festival marks a unique aspect of Bengali identity, agriculture, and spirituality.

## Cultural Significance

These festivals are not just celebrations but acts of cultural preservation, binding communities together across generations.

## The Modern Context

Even in the age of globalization, these festivals remain the heartbeat of Bengali identity.`,
    thumbnail: "/baro-mashe.jpg",
    date: "2026-02-10",
    author: "Debarghya Bhowmick, Soumyadip Banerjee and Team GW",
    category: "Culture & Heritage",
  },
  {
    title: "The Colonial Hoax: Shattering the Myth of Job Charnock",
    description: "How the myth of Kolkata's founding by Job Charnock was debunked and what it reveals about colonial historiography.",
    content: `For centuries, the British claimed that Job Charnock "founded" Calcutta in 1690. This narrative was finally challenged and overturned.

## The Court Ruling

In 2003, the Calcutta High Court ruled that Job Charnock cannot be called the founder of Kolkata, acknowledging that the city existed long before British arrival.

## Pre-Colonial History

The area around Kolkata had thriving settlements — Sutanuti, Govindapur, and Kalikata — long before the East India Company arrived.

## Decolonizing History

This case represents a broader movement to reclaim authentic Indian history from colonial distortions.`,
    thumbnail: "/colonial-hoax.jpg",
    date: "2026-01-20",
    author: "Debarghya Bhowmick and Team GW",
    category: "History",
  },
  {
    title: "Sri Chaitanya Mahaprabhu: The Divine Movement",
    description: "The life and teachings of Sri Chaitanya Mahaprabhu and the Gaudiya Vaishnava tradition he established.",
    content: `Sri Chaitanya Mahaprabhu (1486-1534) was a Bengali Hindu mystic and saint who founded the Gaudiya Vaishnavism tradition.

## Early Life

Born in Nabadwip, Bengal, Chaitanya showed extraordinary intellectual abilities from a young age.

## The Bhakti Movement

Chaitanya popularized the congregational chanting of the holy names as the path to spiritual liberation.

## Lasting Impact

The Gaudiya Vaishnava tradition established by Chaitanya continues to thrive, with millions of followers worldwide.`,
    thumbnail: "/chaitanya-mahaprabhu.jpg",
    date: "2025-11-20",
    author: "Soumyadip Banerjee and Team GW",
    category: "Philosophy",
  },
  {
    title: "Terracotta Temples of Bengal: Architectural Marvels",
    description: "Discover the magnificent terracotta temples of Bishnupur and their unique artistic heritage.",
    content: `The terracotta temples of Bengal represent one of the most remarkable architectural traditions in India.

## Bishnupur: The Temple Town

Bishnupur houses some of the finest terracotta temples, built under the patronage of the Malla dynasty.

## Artistic Themes

The terracotta panels depict scenes from the Ramayana, Mahabharata, and Krishna Leela.

## Conservation

UNESCO and Indian heritage organizations have recognized these temples for their outstanding universal value.`,
    thumbnail: "/terracotta-temples.jpg",
    date: "2025-10-10",
    author: "Debarghya Bhowmick and Team GW",
    category: "Temples & Architecture",
  },
  {
    title: "Netaji Subhas Chandra Bose: Bengal's Greatest Son",
    description: "The revolutionary journey of Netaji and his undying contribution to India's freedom struggle.",
    content: `Subhas Chandra Bose remains one of the most iconic figures in India's struggle for independence.

## The Revolutionary Path

Bose chose the path of armed struggle, forming the Indian National Army (INA).

## The INA and Azad Hind

The formation of the Azad Hind government represented one of the most daring chapters in the independence movement.

## Enduring Legacy

Netaji's vision of a strong, unified India continues to resonate with Indians across the spectrum.`,
    thumbnail: "/subhas-chandra-bose.jpg",
    date: "2025-09-05",
    author: "Debarghya Bhowmick, Soumyadip Banerjee and Team GW",
    category: "Heroic Figures",
  },
  {
    title: "The History of Durga Puja: A Cultural Odyssey",
    description: "Exploring the rich tradition and deep spiritual significance of Bengal's greatest festival.",
    content: `Durga Puja, recognized by UNESCO as an Intangible Cultural Heritage of Humanity, is the soul of Bengal.

## Origins

The festival celebrates the victory of Goddess Durga over the buffalo demon Mahishasura.

## Artistic Expression

From stunning pandal designs to dhunuchi nach, Durga Puja is a magnificent display of Bengali creativity.

## Modern Significance

Today, Durga Puja generates billions in economic activity and attracts millions of visitors.`,
    thumbnail: "/durga-puja.jpg",
    date: "2025-10-15",
    author: "Debarghya Bhowmick and Team GW",
    category: "Culture & Heritage",
  },
  {
    title: "Forgotten Martial Traditions of Bengal",
    description: "Rediscovering Bengal's rich warrior heritage from the Pala dynasty to the freedom fighters.",
    content: `Contrary to popular perception, Bengal has a rich and formidable martial tradition spanning over two millennia.

## The Pala Empire

The Pala dynasty (750-1161 CE) built one of the largest empires in Indian history.

## The Warrior Saints

Bengal's martial traditions were often intertwined with spiritual practice.

## Revival

Today, there is a growing movement to rediscover and revive these forgotten traditions.`,
    thumbnail: "/martial-traditions.jpg",
    date: "2025-06-14",
    author: "Soumyadip Banerjee and Team GW",
    category: "History",
  },
  {
    title: "The Sacred Geometry of Indian Temple Architecture",
    description: "How ancient mathematical principles shaped the breathtaking temples of India.",
    content: `Indian temple architecture is built on profound mathematical and geometric principles known as Vastu Shastra.

## The Science of Vastu

Every element of a Hindu temple follows precise geometric ratios — from the base to the shikhara.

## Mandalas and Yantras

Sacred geometric patterns like mandalas served as blueprints for temple floor plans.

## Timeless Precision

These architectural marvels continue to astound modern engineers with their precision and durability.`,
    thumbnail: "/temple-geometry.jpg",
    date: "2025-02-18",
    author: "Debarghya Bhowmick and Team GW",
    category: "Temples & Architecture",
  },
  {
    title: "The Golden Age of Bengali Literature",
    description: "From Tagore to Sarat Chandra — how Bengali literature shaped the soul of a nation.",
    content: `Bengali literature has one of the richest traditions in the world, producing a Nobel laureate and countless masterpieces.

## Rabindranath Tagore

Tagore's Gitanjali won the Nobel Prize in 1913, putting Bengali literature on the world stage.

## The Novelists

Bankim Chandra's Anandamath gave India its national song, while Sarat Chandra's works captured Bengali life.

## Modern Bengali Literature

Contemporary Bengali writers continue to push boundaries, exploring new themes and forms.`,
    thumbnail: "/bengali-literature.jpg",
    date: "2025-04-22",
    author: "Debarghya Bhowmick, Soumyadip Banerjee and Team GW",
    category: "Literature",
  },
];