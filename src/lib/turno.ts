// Lógica pura de numeración de turnos.
//
// Secuencia (orden de llegada del día) -> código mostrado al cliente:
//   1..99   ->  "1".."99"
//   100..   ->  prefijo de letra: A01..A99, luego B01..B99, ... hasta Z99
//
// Tras el rango numérico (99) viene A01. Tras A99 viene B01, etc.

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const PER_LETTER = 99; // A01..A99
const MAX_SEQUENCE = PER_LETTER + LETTERS.length * PER_LETTER; // 99 + 26*99 = 2673

/**
 * Convierte un número de secuencia (1-based) en el código de turno mostrado.
 * Lanza si la secuencia está fuera del rango soportado.
 */
export function sequenceToCode(n: number): string {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`Secuencia inválida: ${n}`);
  }
  if (n <= 99) {
    return String(n);
  }
  const m = n - 99; // 1-based dentro del rango con letras
  const letterIndex = Math.floor((m - 1) / PER_LETTER);
  if (letterIndex >= LETTERS.length) {
    throw new Error(
      `Secuencia ${n} fuera de rango (máximo ${MAX_SEQUENCE}, código Z99)`,
    );
  }
  const within = ((m - 1) % PER_LETTER) + 1; // 1..99
  const letter = LETTERS[letterIndex];
  return `${letter}${String(within).padStart(2, "0")}`;
}

export const MAX_TURNO_SEQUENCE = MAX_SEQUENCE;
