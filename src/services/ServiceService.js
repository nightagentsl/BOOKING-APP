/**
 * ServiceService - Gestion des services
 * Logique métier pour les services (créer, lister, supprimer)
 */

import { DataRepository } from '../repositories/DataRepository.js';
import { isValidServiceName, isValidDuration } from '../utils/validators.js';

export class ServiceService {
  constructor() {
    this.repository = new DataRepository();
  }

  /**
   * Récupère tous les services disponibles
   * @returns {array} Liste des services
   */
  getAllServices() {
    return this.repository.getAllServices();
  }

  /**
   * Récupère un service par ID
   * @param {string} serviceId
   * @returns {object|null}
   */
  getServiceById(serviceId) {
    return this.repository.getServiceById(serviceId);
  }

  /**
   * Récupère tous les créneaux d'un service
   * @param {string} serviceId
   * @returns {array}
   */
  getServiceWithSlots(serviceId) {
    const service = this.repository.getServiceById(serviceId);
    if (!service) return null;

    const slots = this.repository.getSlotsByService(serviceId);
    return {
      ...service,
      slots: slots,
    };
  }

  /**
   * Crée un nouveau service
   * @param {object} serviceData - { name, description, duration }
   * @returns {object} { success: boolean, service: object|null, error: string|null }
   */
  createService(serviceData) {
    // Valider le nom
    if (!isValidServiceName(serviceData.name)) {
      return {
        success: false,
        service: null,
        error: 'Le nom du service ne peut pas être vide',
      };
    }

    // Valider la durée si fournie
    if (serviceData.duration && !isValidDuration(serviceData.duration)) {
      return {
        success: false,
        service: null,
        error: 'La durée doit être un nombre positif',
      };
    }

    try {
      const service = this.repository.createService({
        name: serviceData.name.trim(),
        description: serviceData.description || '',
        duration: serviceData.duration || 30,
      });

      return {
        success: true,
        service: service,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        service: null,
        error: 'Erreur lors de la création du service',
      };
    }
  }

  /**
   * Supprime un service
   * @param {string} serviceId
   * @returns {object} { success: boolean, error: string|null }
   */
  deleteService(serviceId) {
    // Vérifier que le service existe
    if (!this.repository.getServiceById(serviceId)) {
      return {
        success: false,
        error: 'Service non trouvé',
      };
    }

    // Supprimer tous les créneaux associés
    const slots = this.repository.getSlotsByService(serviceId);
    slots.forEach(slot => {
      this.repository.deleteSlot(slot.id);
    });

    // Supprimer le service
    const deleted = this.repository.deleteService(serviceId);

    return {
      success: deleted,
      error: deleted ? null : 'Erreur lors de la suppression',
    };
  }

  /**
   * Ajoute un créneau à un service
   * @param {object} slotData - { serviceId, datetime, capacity }
   * @returns {object} { success: boolean, slot: object|null, error: string|null }
   */
  addSlot(slotData) {
    // Vérifier que le service existe
    if (!this.repository.getServiceById(slotData.serviceId)) {
      return {
        success: false,
        slot: null,
        error: 'Service non trouvé',
      };
    }

    // Valider la date/heure
    const datetimeObj = new Date(slotData.datetime);
    if (isNaN(datetimeObj.getTime())) {
      return {
        success: false,
        slot: null,
        error: 'Format de date/heure invalide (utiliser: YYYY-MM-DDTHH:MM)',
      };
    }

    if (datetimeObj < new Date()) {
      return {
        success: false,
        slot: null,
        error: 'Le créneau doit être dans le futur',
      };
    }

    try {
      const slot = this.repository.createSlot({
        serviceId: slotData.serviceId,
        datetime: slotData.datetime,
        capacity: slotData.capacity || 1,
      });

      return {
        success: true,
        slot: slot,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        slot: null,
        error: 'Erreur lors de la création du créneau',
      };
    }
  }

  /**
   * Supprime un créneau
   * @param {string} slotId
   * @returns {object} { success: boolean, error: string|null }
   */
  deleteSlot(slotId) {
    // Vérifier que le créneau existe
    if (!this.repository.getSlotById(slotId)) {
      return {
        success: false,
        error: 'Créneau non trouvé',
      };
    }

    const deleted = this.repository.deleteSlot(slotId);

    return {
      success: deleted,
      error: deleted ? null : 'Erreur lors de la suppression',
    };
  }

  /**
   * Récupère tous les créneaux disponibles avec leurs réservations
   * @returns {array}
   */
  getAllAvailableSlots() {
    const slots = this.repository.getAllSlots();
    return slots.filter(slot => slot.available > 0);
  }
}