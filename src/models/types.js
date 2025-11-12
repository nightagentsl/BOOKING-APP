/**
 * Modèles et types pour l'application Booking
 * Définit les structures de données utilisées dans toute l'app
 */

// Structure d'un utilisateur
export const UserModel = {
  email: String,      // ex: "alice@example.com"
  role: String,       // ex: "user" ou "admin"
};

// Structure d'un service (ex: massage, salle de réunion)
export const ServiceModel = {
  id: String,         // ex: "svc_1" (généré automatiquement)
  name: String,       // ex: "Massage"
  description: String, // ex: "30 min relaxant"
  duration: Number,   // ex: 30 (en minutes)
  createdAt: String,  // ISO timestamp
};

// Structure d'un créneau (time slot)
export const SlotModel = {
  id: String,         // ex: "slt_1"
  serviceId: String,  // ref au service
  datetime: String,   // ISO datetime: "2025-11-20T14:00:00Z"
  capacity: Number,   // nb de places max (ex: 1)
  available: Number,  // nb de places restantes
  createdAt: String,
};

// Structure d'une réservation
export const ReservationModel = {
  id: String,         // ex: "res_1"
  slotId: String,     // ref au créneau
  userEmail: String,  // email de l'utilisateur
  createdAt: String,  // ISO timestamp
  status: String,     // "confirmed", "cancelled"
};

// Structure complète de la base de données
export const DatabaseModel = {
  users: [UserModel],
  services: [ServiceModel],
  slots: [SlotModel],
  reservations: [ReservationModel],
};