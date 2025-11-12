/**
 * BookingService - Gestion des réservations
 * Logique métier pour les réservations (créer, annuler, lister)
 */

import { DataRepository } from '../repositories/DataRepository.js';
import { validateReservation } from '../utils/validators.js';

export class BookingService {
  constructor() {
    this.repository = new DataRepository();
  }

  /**
   * Récupère toutes les réservations d'un utilisateur
   * @param {string} userEmail - Email de l'utilisateur
   * @returns {array} Liste des réservations avec détails
   */
  getMyBookings(userEmail) {
    const reservations = this.repository.getReservationsByEmail(userEmail);
    
    // Enrichir avec les détails du service et du créneau
    return reservations.map(res => {
      const slot = this.repository.getSlotById(res.slotId);
      const service = slot ? this.repository.getServiceById(slot.serviceId) : null;
      
      return {
        ...res,
        slot: slot,
        service: service,
      };
    });
  }

  /**
   * Récupère une réservation par ID
   * @param {string} reservationId
   * @returns {object|null}
   */
  getBookingById(reservationId) {
    const reservations = this.repository.getAllReservations();
    return reservations.find(r => r.id === reservationId) || null;
  }

  /**
   * Crée une nouvelle réservation (avec validations)
   * @param {object} bookingData - { slotId, userEmail }
   * @returns {object} { success: boolean, booking: object|null, error: string|null }
   */
  createBooking(bookingData) {
    // Valider les données
    const validation = validateReservation(bookingData);
    if (!validation.valid) {
      return {
        success: false,
        booking: null,
        error: validation.error,
      };
    }

    const { slotId, userEmail } = bookingData;

    // Vérifier que le créneau existe
    const slot = this.repository.getSlotById(slotId);
    if (!slot) {
      return {
        success: false,
        booking: null,
        error: 'Créneau non trouvé',
      };
    }

    // Vérifier qu'il y a de la place disponible
    if (slot.available <= 0) {
      return {
        success: false,
        booking: null,
        error: 'Aucune place disponible pour ce créneau',
      };
    }

    // Vérifier qu'il n'y a pas de double booking
    if (this.repository.hasDoubleBooking(slotId, userEmail)) {
      return {
        success: false,
        booking: null,
        error: 'Vous avez déjà réservé ce créneau',
      };
    }

    // Vérifier que la date du créneau est dans le futur
    const slotDate = new Date(slot.datetime);
    if (slotDate < new Date()) {
      return {
        success: false,
        booking: null,
        error: 'Ce créneau est passé, vous ne pouvez plus le réserver',
      };
    }

    try {
      const booking = this.repository.createReservation({
        slotId: slotId,
        userEmail: userEmail,
      });

      return {
        success: true,
        booking: booking,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        booking: null,
        error: 'Erreur lors de la création de la réservation',
      };
    }
  }

  /**
   * Annule une réservation
   * @param {string} reservationId
   * @param {string} userEmail - Email de l'utilisateur (vérification de propriété)
   * @returns {object} { success: boolean, error: string|null }
   */
  cancelBooking(reservationId, userEmail) {
    // Vérifier que la réservation existe
    const booking = this.getBookingById(reservationId);
    if (!booking) {
      return {
        success: false,
        error: 'Réservation non trouvée',
      };
    }

    // Vérifier que l'utilisateur est propriétaire de la réservation
    if (booking.userEmail !== userEmail) {
      return {
        success: false,
        error: 'Vous n\'avez pas le droit d\'annuler cette réservation',
      };
    }

    // Vérifier que la réservation n'est pas déjà annulée
    if (booking.status === 'cancelled') {
      return {
        success: false,
        error: 'Cette réservation est déjà annulée',
      };
    }

    // Vérifier que le créneau est dans le futur (pas passé)
    const slot = this.repository.getSlotById(booking.slotId);
    if (slot) {
      const slotDate = new Date(slot.datetime);
      if (slotDate < new Date()) {
        return {
          success: false,
          error: 'Vous ne pouvez pas annuler une réservation pour un créneau passé',
        };
      }
    }

    try {
      const cancelled = this.repository.cancelReservation(reservationId);

      return {
        success: cancelled,
        error: cancelled ? null : 'Erreur lors de l\'annulation',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de l\'annulation de la réservation',
      };
    }
  }

  /**
   * Récupère les détails d'un créneau avec le nombre de places disponibles
   * @param {string} slotId
   * @returns {object|null}
   */
  getSlotDetails(slotId) {
    const slot = this.repository.getSlotById(slotId);
    if (!slot) return null;

    const service = this.repository.getServiceById(slot.serviceId);
    const reservations = this.repository.getReservationsBySlot(slotId);

    return {
      ...slot,
      service: service,
      reservationCount: reservations.length,
      isAvailable: slot.available > 0,
      isFuture: new Date(slot.datetime) > new Date(),
    };
  }

  /**
   * Récupère tous les créneaux disponibles (avec détails)
   * @returns {array}
   */
  getAllAvailableSlotsWithDetails() {
    const slots = this.repository.getAllSlots();
    
    return slots
      .filter(slot => slot.available > 0 && new Date(slot.datetime) > new Date())
      .map(slot => {
        const service = this.repository.getServiceById(slot.serviceId);
        return {
          ...slot,
          service: service,
        };
      })
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  }
}