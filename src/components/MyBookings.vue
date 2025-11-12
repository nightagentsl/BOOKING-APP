<template>
  <div class="my-bookings">
    <div class="card">
      <h2>Mes réservations</h2>
      
      <div v-if="!isAuthenticated" class="info-box">
        <p>⚠️ Veuillez vous connecter pour voir vos réservations.</p>
      </div>

      <div v-else>
        <div v-if="bookings.length === 0" class="empty-state">
          <p>Vous n'avez pas de réservation pour le moment.</p>
        </div>

        <div v-else class="bookings-list">
          <div v-for="booking in bookings" :key="booking.id" class="booking-card">
            <div class="booking-header">
              <h3>{{ booking.service?.name || 'Service supprimé' }}</h3>
              <span class="status-badge confirmed">Confirmée</span>
            </div>

            <div class="booking-details">
              <p>
                <strong>📅 Date/Heure:</strong>
                {{ formatDateTime(booking.slot?.datetime) }}
              </p>
              <p>
                <strong>⏱️ Durée:</strong>
                {{ booking.service?.duration || 'N/A' }} minutes
              </p>
              <p>
                <strong>📍 Réservation créée:</strong>
                {{ formatDateTime(booking.createdAt) }}
              </p>
            </div>

            <div v-if="error === booking.id" class="error-message">
              {{ errorMessage }}
            </div>

            <div v-if="success === booking.id" class="success-message">
              ✅ Réservation annulée
            </div>

            <button
              @click="handleCancelBooking(booking.id)"
              class="btn btn-danger"
              :disabled="isCancelling === booking.id"
            >
              {{ isCancelling === booking.id ? 'Annulation...' : 'Annuler' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { BookingService } from '@/services/BookingService';
import { AuthService } from '@/services/AuthService';

export default {
  name: 'MyBookings',
  data() {
    return {
      bookings: [],
      isAuthenticated: false,
      error: null,
      errorMessage: '',
      success: null,
      isCancelling: null,
      bookingService: new BookingService(),
      authService: new AuthService(),
    };
  },
  mounted() {
    this.checkAuthentication();
    this.loadBookings();
    this.$on('refresh-bookings', this.loadBookings);
  },
  methods: {
    checkAuthentication() {
      this.isAuthenticated = this.authService.isAuthenticated();
    },
    loadBookings() {
      if (!this.isAuthenticated) {
        this.bookings = [];
        return;
      }

      const userEmail = this.authService.getCurrentUserEmail();
      if (userEmail) {
        this.bookings = this.bookingService.getMyBookings(userEmail);
      }
    },
    handleCancelBooking(bookingId) {
      this.error = null;
      this.success = null;
      this.isCancelling = bookingId;

      const userEmail = this.authService.getCurrentUserEmail();

      if (!userEmail) {
        this.error = bookingId;
        this.errorMessage = 'Email utilisateur non disponible';
        this.isCancelling = null;
        return;
      }

      const result = this.bookingService.cancelBooking(bookingId, userEmail);

      if (result.success) {
        this.success = bookingId;
        this.loadBookings();
        this.$emit('booking-cancelled', bookingId);

        // Réinitialiser le message après 2 secondes
        setTimeout(() => {
          this.success = null;
        }, 2000);
      } else {
        this.error = bookingId;
        this.errorMessage = result.error || 'Erreur lors de l\'annulation';
      }

      this.isCancelling = null;
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
.my-bookings {
  margin-bottom: 20px;
}

.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  color: #333;
}

.info-box {
  background-color: #e3f2fd;
  color: #1565c0;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #1565c0;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #666;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.booking-card {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  background-color: white;
  transition: box-shadow 0.3s;
}

.booking-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.booking-header h3 {
  margin: 0;
  color: #2c3e50;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.confirmed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.booking-details {
  margin: 12px 0;
}

.booking-details p {
  margin: 8px 0;
  font-size: 14px;
  color: #555;
}

.booking-details strong {
  color: #333;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  margin: 10px 0;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  margin: 10px 0;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #da190b;
}

.btn-danger:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>