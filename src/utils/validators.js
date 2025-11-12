/**
 * Fonctions de validation pour l'application Booking
 * Centralise toute la logique de validation
 */

/**
 * Valide qu'un email est au bon format
 * @param {string} email - L'email à valider
 * @returns {boolean} true si valide, false sinon
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide qu'un nom de service n'est pas vide
 * @param {string} name - Le nom à valider
 * @returns {boolean}
 */
export function isValidServiceName(name) {
  return name && typeof name === 'string' && name.trim().length > 0;
}

/**
 * Valide qu'une date/heure est valide et dans le futur
 * @param {string} datetime - Format ISO: "2025-11-20T14:00:00Z"
 * @returns {boolean}
 */
export function isValidFutureDateTime(datetime) {
  try {
    const date = new Date(datetime);
    const now = new Date();
    return date > now;
  } catch {
    return false;
  }
}

/**
 * Valide qu'une durée est un nombre positif
 * @param {number} duration - Durée en minutes
 * @returns {boolean}
 */
export function isValidDuration(duration) {
  return typeof duration === 'number' && duration > 0;
}

/**
 * Valide qu'une capacité est un nombre positif
 * @param {number} capacity - Nombre de places
 * @returns {boolean}
 */
export function isValidCapacity(capacity) {
  return typeof capacity === 'number' && capacity > 0 && Number.isInteger(capacity);
}

/**
 * Génère un message d'erreur clair pour la validation email
 * @param {string} email
 * @returns {string|null} Message d'erreur ou null si valide
 */
export function validateEmailWithMessage(email) {
  if (!email) {
    return "L'email ne peut pas être vide";
  }
  if (!isValidEmail(email)) {
    return "Format d'email invalide (exemple: alice@example.com)";
  }
  return null;
}

/**
 * Valide une réservation avant de la créer
 * @param {object} reservation - La réservation à valider
 * @returns {object} { valid: boolean, error: string|null }
 */
export function validateReservation(reservation) {
  if (!reservation.userEmail) {
    return { valid: false, error: "Email utilisateur manquant" };
  }
  
  if (!isValidEmail(reservation.userEmail)) {
    return { valid: false, error: "Email invalide" };
  }
  
  if (!reservation.slotId) {
    return { valid: false, error: "Créneau manquant" };
  }
  
  return { valid: true, error: null };
}