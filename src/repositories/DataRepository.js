/**
 * DataRepository - Couche d'accès aux données
 * Gère la lecture/écriture dans le stockage (localStorage pour Vue.js)
 * C'est le SEUL endroit qui touche aux données persistantes
 */

const STORAGE_KEY = 'booking_app_data';

/**
 * Structure par défaut de la base de données
 */
const DEFAULT_DATA = {
  users: [
    { email: 'admin@example.com', role: 'admin' },
    { email: 'user@example.com', role: 'user' },
  ],
  services: [],
  slots: [],
  reservations: [],
};

/**
 * Classe Repository pour gérer les données
 */
export class DataRepository {
  constructor() {
    this.initializeData();
  }

  /**
   * Initialise la base de données si elle n'existe pas
   */
  initializeData() {
    if (!this.getData()) {
      this.saveData(DEFAULT_DATA);
    }
  }

  /**
   * Charge toutes les données
   * @returns {object} L'objet complet de la base de données
   */
  getData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      return null;
    }
  }

  /**
   * Sauvegarde les données
   * @param {object} data - Les données à sauvegarder
   */
  saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }

  /**
   * Retourne un nouvel ID unique
   * @param {string} prefix - Préfixe de l'ID (ex: "svc_", "res_")
   * @returns {string} ID unique
   */
  generateId(prefix = 'id_') {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========== SERVICES ==========

  /**
   * Récupère tous les services
   * @returns {array} Liste des services
   */
  getAllServices() {
    const data = this.getData();
    return data?.services || [];
  }

  /**
   * Récupère un service par ID
   * @param {string} serviceId
   * @returns {object|null}
   */
  getServiceById(serviceId) {
    const services = this.getAllServices();
    return services.find(s => s.id === serviceId) || null;
  }

  /**
   * Crée un nouveau service
   * @param {object} service - { name, description, duration }
   * @returns {object} Le service créé avec ID
   */
  createService(service) {
    const data = this.getData();
    const newService = {
      id: this.generateId('svc_'),
      name: service.name,
      description: service.description || '',
      duration: service.duration || 30,
      createdAt: new Date().toISOString(),
    };
    data.services.push(newService);
    this.saveData(data);
    return newService;
  }

  /**
   * Supprime un service
   * @param {string} serviceId
   * @returns {boolean} true si supprimé, false sinon
   */
  deleteService(serviceId) {
    const data = this.getData();
    const index = data.services.findIndex(s => s.id === serviceId);
    if (index > -1) {
      data.services.splice(index, 1);
      this.saveData(data);
      return true;
    }
    return false;
  }

  // ========== SLOTS (CRÉNEAUX) ==========

  /**
   * Récupère tous les créneaux
   * @returns {array}
   */
  getAllSlots() {
    const data = this.getData();
    return data?.slots || [];
  }

  /**
   * Récupère les créneaux d'un service
   * @param {string} serviceId
   * @returns {array}
   */
  getSlotsByService(serviceId) {
    const slots = this.getAllSlots();
    return slots.filter(s => s.serviceId === serviceId);
  }

  /**
   * Récupère un créneau par ID
   * @param {string} slotId
   * @returns {object|null}
   */
  getSlotById(slotId) {
    const slots = this.getAllSlots();
    return slots.find(s => s.id === slotId) || null;
  }

  /**
   * Crée un nouveau créneau
   * @param {object} slot - { serviceId, datetime, capacity }
   * @returns {object} Le créneau créé
   */
  createSlot(slot) {
    const data = this.getData();
    const newSlot = {
      id: this.generateId('slt_'),
      serviceId: slot.serviceId,
      datetime: slot.datetime,
      capacity: slot.capacity || 1,
      available: slot.capacity || 1,
      createdAt: new Date().toISOString(),
    };
    data.slots.push(newSlot);
    this.saveData(data);
    return newSlot;
  }

  /**
   * Supprime un créneau
   * @param {string} slotId
   * @returns {boolean}
   */
  deleteSlot(slotId) {
    const data = this.getData();
    const index = data.slots.findIndex(s => s.id === slotId);
    if (index > -1) {
      data.slots.splice(index, 1);
      this.saveData(data);
      return true;
    }
    return false;
  }

  // ========== RÉSERVATIONS ==========

  /**
   * Récupère toutes les réservations
   * @returns {array}
   */
  getAllReservations() {
    const data = this.getData();
    return data?.reservations || [];
  }

  /**
   * Récupère les réservations d'un utilisateur
   * @param {string} userEmail
   * @returns {array}
   */
  getReservationsByEmail(userEmail) {
    const reservations = this.getAllReservations();
    return reservations.filter(r => r.userEmail === userEmail && r.status !== 'cancelled');
  }

  /**
   * Récupère les réservations d'un créneau
   * @param {string} slotId
   * @returns {array}
   */
  getReservationsBySlot(slotId) {
    const reservations = this.getAllReservations();
    return reservations.filter(r => r.slotId === slotId && r.status === 'confirmed');
  }

  /**
   * Vérifie s'il existe déjà une réservation pour ce créneau et cet utilisateur
   * @param {string} slotId
   * @param {string} userEmail
   * @returns {boolean}
   */
  hasDoubleBooking(slotId, userEmail) {
    const reservations = this.getReservationsBySlot(slotId);
    return reservations.some(r => r.userEmail === userEmail);
  }

  /**
   * Crée une nouvelle réservation
   * @param {object} reservation - { slotId, userEmail }
   * @returns {object} La réservation créée
   */
  createReservation(reservation) {
    const data = this.getData();
    const newReservation = {
      id: this.generateId('res_'),
      slotId: reservation.slotId,
      userEmail: reservation.userEmail,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };
    data.reservations.push(newReservation);
    
    // Mettre à jour les places disponibles du créneau
    const slot = data.slots.find(s => s.id === reservation.slotId);
    if (slot) {
      slot.available = Math.max(0, slot.available - 1);
    }
    
    this.saveData(data);
    return newReservation;
  }

  /**
   * Annule une réservation
   * @param {string} reservationId
   * @returns {boolean}
   */
  cancelReservation(reservationId) {
    const data = this.getData();
    const reservation = data.reservations.find(r => r.id === reservationId);
    
    if (reservation) {
      reservation.status = 'cancelled';
      
      // Libérer la place du créneau
      const slot = data.slots.find(s => s.id === reservation.slotId);
      if (slot) {
        slot.available = Math.min(slot.capacity, slot.available + 1);
      }
      
      this.saveData(data);
      return true;
    }
    return false;
  }

  // ========== UTILISATEURS ==========

  /**
   * Récupère tous les utilisateurs
   * @returns {array}
   */
  getAllUsers() {
    const data = this.getData();
    return data?.users || [];
  }

  /**
   * Récupère un utilisateur par email
   * @param {string} email
   * @returns {object|null}
   */
  getUserByEmail(email) {
    const users = this.getAllUsers();
    return users.find(u => u.email === email) || null;
  }

  /**
   * Crée un nouvel utilisateur
   * @param {object} user - { email, role }
   * @returns {object}
   */
  createUser(user) {
    const data = this.getData();
    const newUser = { email: user.email, role: user.role || 'user' };
    data.users.push(newUser);
    this.saveData(data);
    return newUser;
  }
}