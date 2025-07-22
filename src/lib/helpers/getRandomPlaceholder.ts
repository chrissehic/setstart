const examples = [
  "a local healthy bar brand for youth",
  "an AI-powered tool for small businesses",
  "a coworking space for artists and designers",
  "a platform to connect volunteers with NGOs",
  "an eco-friendly clothing line for young professionals",
  "a marketplace for handmade local crafts",
  "a mobile app to improve mental health",
  "a community garden project in the city",
  "a subscription box for healthy snacks",
  "an educational game for kids to learn coding",
];

export const getRandomExample = () => {
  const idx = Math.floor(Math.random() * examples.length);
  return examples[idx];
};
