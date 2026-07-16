// Alfabeto sem caracteres ambíguos (sem 0/O, 1/I/L) para facilitar digitação e leitura.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateAccessKey(): string {
  const group = () =>
    Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");
  return `${group()}-${group()}`;
}
