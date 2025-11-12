/**
 * AuthService - Gestion de l'authentification
 * Logique métier pour l'authentification et la gestion des rôles
 */

import { DataRepository } from '../repositories/DataRepository.js';
import { isValidEmail } from '../utils/validators.js';

const CURRENT_USER_KEY = 'booking_current_user';

export class AuthService {
  constructor() {
    this.repository = new DataRepository();
  }

  /**
   * Simule une "connexion" en sauvegardant l'email
   * @param {string} email - Email de l'utilisateur
   * @returns {object} { success: boolean, user: object|null, error: string|null }
   */
  login(email) {
    // Valider l'email
    if (!isValidEmail(email)) {
      return {
        success: false,
        user: null,
        error: 'Format d\'email invalide',
      };
    }

    // Vérifier ou créer l'utilisateur
    let user = this.repository.getUserByEmail(email);
    if (!user) {
      user = this.repository.createUser({
        email: email,
        role: 'user',
      });
    }

    // Sauvegarder l'utilisateur courant
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return {
      success: true,
      user: user,
      error: null,
    };
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   * @returns {object|null}
   */
  getCurrentUser() {
    try {
      const userData = localStorage.getItem(CURRENT_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  /**
   * Déconnecte l'utilisateur
   * @returns {boolean}
   */
  logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    return true;
  }

  /**
   * Vérifie si l'utilisateur est connecté
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  /**
   * Vérifie si l'utilisateur connecté est admin
   * @returns {boolean}
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  /**
   * Retourne l'email de l'utilisateur connecté
   * @returns {string|null}
   */
  getCurrentUserEmail() {
    const user = this.getCurrentUser();
    return user ? user.email : null;
  }

  /**
   * Retourne le rôle de l'utilisateur connecté
   * @returns {string} "admin", "user", ou "guest"
   */
  getCurrentUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : 'guest';
  }
}