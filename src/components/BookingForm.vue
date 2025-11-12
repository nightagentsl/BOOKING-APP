<template>
  <div class="booking-form">
    <div class="card">
      <h2>Réserver un créneau</h2>
      
      <div v-if="!isAuthenticated" class="info-box">
        <p>⚠️ Veuillez vous connecter pour réserver.</p>
      </div>

      <form v-else @submit.prevent="handleBooking" class="form">
        <div class="form-group">
          <label for="service">Service:</label>
          <select
            id="service"
            v-model="selectedServiceId"
            required
            @change="loadSlotsForService"
          >
            <option value="">-- Sélectionner un service --</option>
            <option v-for="service in services" :key="service.id" :value="service.id">
              {{ service.name }} ({{ service.duration }} min)
            </option>
          </select>
        </div>

        <div v-if="availableSlots.length > 0" class="form-group">
          <label for="slot">Créneau:</label>
          <select id="slot" v-model="selectedSlotId" required>
            <option value="">-- Sélectionner un créneau --</option>
            <option v-for="slot in availableSlots" :key="slot.id" :value="slot.id">
              {{ formatDateTime(slot.datetime) }} 
              ({{ slot.available }}/{{ slot.capacity }} place{{ slot.available > 1 ? 's' : '' }})
            </option>
          </select>
        </div>

        <div v-else-if="selectedServiceId" class="info-box warning">
          <p>Aucun créneau disponible pour ce service.</p>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          ✅ Réservation confirmée !
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!selectedSlotId || loading"
        >
          {{ loading ? 'Réservation en cours...' : 'Réserver' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { BookingService } from '@/services/BookingService';
import { ServiceService } from '@/services/ServiceService';
import { AuthService } from '@/services/AuthService';

export default {
  name: 'BookingForm',
  props: {
    preSelectedServiceId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      selectedServiceId: '',
      selectedSlotId: '',
      services: [],
      availableSlots: [],
      error: '',
      success: false,
      loading: false,
      isAuthenticated: false,
      bookingService: new BookingService(),
      serviceService: new ServiceService(),
      authService: new AuthService(),
    };
  },
  mounted() {
    this.checkAuthentication();
    this.loadServices();
    if (this.preSelectedServiceId) {
      this.selectedServiceId = this.preSelectedServiceId;
      this.loadSlotsForService();
    }
  },
  methods: {
    checkAuthentication() {
      this.isAuthenticated = this.authService.isAuthenticated();
    },
    loadServices() {
      this.services = this.serviceService.getAllServices();
    },
    loadSlotsForService() {
      this.error = '';
      this.success = false;
      this.selectedSlotId = '';

      if (!this.selectedServiceId) {
        this.availableSlots = [];
        return;
      }

      const service = this.serviceService.getServiceWithSlots(this.selectedServiceId);
      if (service) {
        this.availableSlots = service.slots
          .filter(slot => slot.available > 0 && new Date(slot.datetime) > new Date())
          .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
      }
    },
    handleBooking() {
      this.error = '';
      this.success = false;
      this.loading = true;

      const userEmail = this.authService.getCurrentUserEmail();

      if (!userEmail) {
        this.error = 'Email utilisateur non disponible. Veuillez vous reconnecter.';
        this.loading = false;
        return;
      }

      if (!this.selectedSlotId) {
        this.error = 'Veuillez sélectionner un créneau';
        this.loading = false;
        return;
      }

      const result = this.bookingService.createBooking({
        slotId: this.selectedSlotId,
        userEmail: userEmail,
      });

      if (result.success) {
        this.success = true;
        this.selectedServiceId = '';
        this.selectedSlotId = '';
        this.availableSlots = [];
        this.$emit('booking-success', result.booking);
        
        // Réinitialiser le message de succès après 3 secondes
        setTimeout(() => {
          this.success = false;
        }, 3000);
      } else {
        this.error = result.error || 'Erreur lors de la réservation';
      }

      this.loading = false;
    },
    formatDateTime(datetime) {
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
.booking-form {
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
  margin-bottom: 15px;
  border-left: 4px solid #1565c0;
}

.info-box.warning {
  background-color: #fff3e0;
  color: #e65100;
  border-left-color: #e65100;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

select,
input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

select:focus,
input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>