<template>
  <div id="app" class="app-container">
    <header class="app-header">
      <h1>📅 Système de Réservation de Services</h1>
      <p class="subtitle">Application de gestion refactorisée</p>
    </header>

    <main class="app-main">
      <!-- AUTH FORM -->
      <div class="section">
        <div class="card">
          <h2>Connexion</h2>
          
          <div v-if="currentUser" class="user-info">
            <p><strong>Connecté en tant que:</strong> {{ currentUser.email }}</p>
            <p><strong>Rôle:</strong> {{ currentUser.role }}</p>
            <button @click="handleLogout" class="btn btn-logout">Se déconnecter</button>
          </div>

          <form v-else @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="email">Email:</label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="admin@example.com ou user@example.com"
                required
              />
            </div>

            <div v-if="authError" class="error-message">
              {{ authError }}
            </div>

            <button type="submit" class="btn btn-primary">Se connecter</button>
          </form>
        </div>
      </div>

      <!-- SERVICES ET RÉSERVATION (visible si connecté) -->
      <div v-if="isAuthenticated" class="user-sections">
        <div class="grid-2">
          <!-- SERVICES LIST -->
          <div class="section">
            <div class="card">
              <h2>Services disponibles</h2>
              
              <div v-if="services.length === 0" class="empty-state">
                <p>Aucun service disponible.</p>
              </div>

              <div v-else class="services-grid">
                <div v-for="service in services" :key="service.id" class="service-card">
                  <h3>{{ service.name }}</h3>
                  <p class="description">{{ service.description || 'Pas de description' }}</p>
                  <p class="duration">⏱️ {{ service.duration }} min</p>
                  <button @click="selectedServiceId = service.id" class="btn btn-secondary">
                    Réserver
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- BOOKING FORM -->
          <div class="section">
            <div class="card">
              <h2>Réserver un créneau</h2>
              
              <form @submit.prevent="handleBooking" class="form">
                <div class="form-group">
                  <label for="service">Service:</label>
                  <select
                    id="service"
                    v-model="selectedServiceId"
                    @change="loadSlotsForService"
                  >
                    <option value="">-- Sélectionner --</option>
                    <option v-for="service in services" :key="service.id" :value="service.id">
                      {{ service.name }}
                    </option>
                  </select>
                </div>

                <div v-if="availableSlots.length > 0" class="form-group">
                  <label for="slot">Créneau:</label>
                  <select id="slot" v-model="selectedSlotId" required>
                    <option value="">-- Sélectionner --</option>
                    <option v-for="slot in availableSlots" :key="slot.id" :value="slot.id">
                      {{ formatDateTime(slot.datetime) }} ({{ slot.available }}/{{ slot.capacity }})
                    </option>
                  </select>
                </div>

                <div v-if="bookingError" class="error-message">
                  {{ bookingError }}
                </div>

                <div v-if="bookingSuccess" class="success-message">
                  ✅ Réservation confirmée !
                </div>

                <button type="submit" class="btn btn-primary" :disabled="!selectedSlotId">
                  Réserver
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- MES RÉSERVATIONS -->
        <div class="section">
          <div class="card">
            <h2>Mes réservations</h2>
            
            <div v-if="myBookings.length === 0" class="empty-state">
              <p>Vous n'avez pas de réservation.</p>
            </div>

            <div v-else class="bookings-list">
              <div v-for="booking in myBookings" :key="booking.id" class="booking-card">
                <h3>{{ booking.service?.name || 'Service' }}</h3>
                <p><strong>📅</strong> {{ formatDateTime(booking.slot?.datetime) }}</p>
                <p><strong>⏱️</strong> {{ booking.service?.duration }} min</p>
                <button
                  @click="handleCancelBooking(booking.id)"
                  class="btn btn-danger"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ADMIN PANEL -->
      <div v-if="isAdmin" class="section">
        <div class="card admin-section">
          <h2>🔧 Panneau Admin</h2>

          <!-- Ajouter service -->
          <div class="admin-subsection">
            <h3>Ajouter un service</h3>
            <form @submit.prevent="handleAddService" class="form">
              <input v-model="newService.name" type="text" placeholder="Nom du service" required />
              <input v-model="newService.description" type="text" placeholder="Description" />
              <input v-model.number="newService.duration" type="number" min="1" placeholder="Durée (min)" value="30" />
              <button type="submit" class="btn btn-primary">Créer service</button>
            </form>
          </div>

          <!-- Ajouter créneau -->
          <div class="admin-subsection">
            <h3>Ajouter un créneau</h3>
            <form @submit.prevent="handleAddSlot" class="form">
              <select v-model="newSlot.serviceId" required>
                <option value="">-- Sélectionner un service --</option>
                <option v-for="service in services" :key="service.id" :value="service.id">
                  {{ service.name }}
                </option>
              </select>
              <input v-model="newSlot.datetime" type="datetime-local" required />
              <input v-model.number="newSlot.capacity" type="number" min="1" value="1" placeholder="Capacité" />
              <button type="submit" class="btn btn-primary">Créer créneau</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { AuthService } from './services/AuthService.js';
import { ServiceService } from './services/ServiceService.js';
import { BookingService } from './services/BookingService.js';

export default {
  name: 'App',
  data() {
    return {
      email: '',
      currentUser: null,
      isAuthenticated: false,
      isAdmin: false,
      authError: '',
      services: [],
      availableSlots: [],
      myBookings: [],
      selectedServiceId: '',
      selectedSlotId: '',
      bookingError: '',
      bookingSuccess: false,
      newService: { name: '', description: '', duration: 30 },
      newSlot: { serviceId: '', datetime: '', capacity: 1 },
      authService: new AuthService(),
      serviceService: new ServiceService(),
      bookingService: new BookingService(),
    };
  },
  mounted() {
    this.checkUser();
    this.loadServices();
    this.loadMyBookings();
  },
  methods: {
    checkUser() {
      const user = this.authService.getCurrentUser();
      this.currentUser = user;
      this.isAuthenticated = user !== null;
      this.isAdmin = this.authService.isAdmin();
    },
    handleLogin() {
      this.authError = '';
      if (!this.email.trim()) {
        this.authError = 'Veuillez entrer un email';
        return;
      }
      const result = this.authService.login(this.email);
      if (result.success) {
        this.currentUser = result.user;
        this.isAuthenticated = true;
        this.isAdmin = this.authService.isAdmin();
        this.email = '';
        this.loadServices();
        this.loadMyBookings();
      } else {
        this.authError = result.error;
      }
    },
    handleLogout() {
      this.authService.logout();
      this.currentUser = null;
      this.isAuthenticated = false;
      this.isAdmin = false;
      this.myBookings = [];
    },
    loadServices() {
      this.services = this.serviceService.getAllServices();
    },
    loadSlotsForService() {
      if (!this.selectedServiceId) {
        this.availableSlots = [];
        return;
      }
      const service = this.serviceService.getServiceWithSlots(this.selectedServiceId);
      this.availableSlots = (service?.slots || []).filter(s => s.available > 0);
    },
    handleBooking() {
      this.bookingError = '';
      this.bookingSuccess = false;
      const userEmail = this.authService.getCurrentUserEmail();
      const result = this.bookingService.createBooking({
        slotId: this.selectedSlotId,
        userEmail: userEmail,
      });
      if (result.success) {
        this.bookingSuccess = true;
        this.selectedServiceId = '';
        this.selectedSlotId = '';
        this.availableSlots = [];
        this.loadMyBookings();
        this.loadServices();
        setTimeout(() => { this.bookingSuccess = false; }, 2000);
      } else {
        this.bookingError = result.error;
      }
    },
    loadMyBookings() {
      const userEmail = this.authService.getCurrentUserEmail();
      if (userEmail) {
        this.myBookings = this.bookingService.getMyBookings(userEmail);
      }
    },
    handleCancelBooking(bookingId) {
      const userEmail = this.authService.getCurrentUserEmail();
      const result = this.bookingService.cancelBooking(bookingId, userEmail);
      if (result.success) {
        this.loadMyBookings();
        this.loadServices();
      }
    },
    handleAddService() {
      if (!this.newService.name.trim()) {
        alert('Entrez un nom de service');
        return;
      }
      const result = this.serviceService.createService(this.newService);
      if (result.success) {
        this.newService = { name: '', description: '', duration: 30 };
        this.loadServices();
        alert('Service créé !');
      } else {
        alert('Erreur: ' + result.error);
      }
    },
    handleAddSlot() {
      if (!this.newSlot.serviceId) {
        alert('Sélectionnez un service');
        return;
      }
      if (!this.newSlot.datetime) {
        alert('Entrez une date/heure');
        return;
      }
      const datetime = new Date(this.newSlot.datetime).toISOString();
      const result = this.serviceService.addSlot({
        serviceId: this.newSlot.serviceId,
        datetime: datetime,
        capacity: this.newSlot.capacity,
      });
      if (result.success) {
        this.newSlot = { serviceId: '', datetime: '', capacity: 1 };
        this.loadServices();
        alert('Créneau créé !');
      } else {
        alert('Erreur: ' + result.error);
      }
    },
    formatDateTime(datetime) {
      if (!datetime) return 'N/A';
      const date = new Date(datetime);
      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 2.5em;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1em;
  opacity: 0.9;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.section {
  margin-bottom: 20px;
}

.card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin-top: 0;
  color: #333;
  margin-bottom: 20px;
}

.card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.user-info {
  background-color: #e8f5e9;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.user-info p {
  margin: 8px 0;
  color: #2e7d32;
}

.login-form,
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

input,
select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

input:focus,
select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #667eea;
  color: white;
}

.btn-primary:hover {
  background-color: #5568d3;
}

.btn-secondary {
  background-color: #2196F3;
  color: white;
}

.btn-secondary:hover {
  background-color: #0b7dda;
}

.btn-logout,
.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-logout:hover,
.btn-danger:hover {
  background-color: #da190b;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 10px;
  border-radius: 4px;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #999;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.service-card {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  background-color: #f9f9f9;
}

.description {
  color: #666;
  font-size: 14px;
  margin: 8px 0;
}

.duration {
  color: #f39c12;
  font-weight: bold;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.booking-card {
  border-left: 4px solid #667eea;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  color: #333;
}

.booking-card p {
  color: #333;
  margin: 8px 0;
}

.admin-section {
  background-color: #fff3e0;
}

.admin-subsection {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.admin-subsection:last-child {
  border-bottom: none;
}

.admin-subsection h3 {
  color: #e65100;
  margin-bottom: 15px;
}

@media (max-width: 768px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>