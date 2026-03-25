function getRandomHexColor() {
  // Generate a random number up to 0xFFFFFF (16777215 in decimal)
  const randomInt = Math.floor(Math.random() * 0xFFFFFF); 
  // Convert to hex string and pad with leading zeros if necessary
  const hexColor = randomInt.toString(16).padStart(6, '0');
  return `#${hexColor}`;
}