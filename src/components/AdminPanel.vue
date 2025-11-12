<template>
  <div class="admin-panel">
    <div class="card">
      <h2>🔧 Panneau Admin</h2>
      
      <div v-if="!isAdmin" class="restricted">
        <p>⚠️ Accès réservé aux administrateurs.</p>
      </div>

      <div v-else>
        <!-- Section 1: Ajouter un service -->
        <div class="admin-section">
          <h3>Ajouter un service</h3>
          <form @submit.prevent="handleAddService" class="form">
            <div class="form-group">
              <label for="serviceName">Nom du service:</label>
              <input
                id="serviceName"
                v-model="newService.name"
                type="text"
                placeholder="ex: Massage"
                required
              />
            </div>

            <div class="form-group">
              <label for="serviceDesc">Description (optionnel):</label>
              <input
                id="serviceDesc"
                v-model="newService.description"
                type="text"
                placeholder="ex: 30 min relaxant"
              />
            </div>

            <div class="form-group">
              <label for="serviceDuration">Durée (en minutes):</label>
              <input
                id="serviceDuration"
                v-model.number="newService.duration"
                type="number"
                min="1"
                placeholder="30"
              />
            </div>

            <div v-if="serviceError" class="error-message">
              {{ serviceError }}
            </div>
            <div v-if="serviceSuccess" class="success-message">
              ✅ Service créé avec succès
            </div>

            <button type="submit" class="btn btn-primary">Créer service</button>
          </form>
        </div>

        <!-- Séparateur -->
        <hr class="separator" />

        <!-- Section 2: Ajouter un créneau -->
        <div class="admin-section">
          <h3>Ajouter un créneau</h3>
          <form @submit.prevent="handleAddSlot" class="form">
            <div class="form-group">
              <label for="slotService">Service:</label>
              <select id="slotService" v-model="newSlot.serviceId" required>
                <option value="">-- Sélectionner un service --</option>
                <option v-for="service in services" :key="service.id" :value="service.id">
                  {{ service.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="slotDateTime">Date et heure:</label>
              <input
                id="slotDateTime"
                v-model="newSlot.datetime"
                type="datetime-local"
                required
              />
            </div>

            <div class="form-group">
              <label for="slotCapacity">Capacité (nombre de places):</label>
              <input
                id="slotCapacity"
                v-model.number="newSlot.capacity"
                type="number"
                min="1"
                placeholder="1"
              />
            </div>

            <div v-if="slotError" class="error-message">
              {{ slotError }}
            </div>
            <div v-if="slotSuccess" class="success-message">
              ✅ Créneau créé avec succès
            </div>

            <button type="submit" class="btn btn-primary">Créer créneau</button>
          </form>
        </div>

        <!-- Séparateur -->
        <hr class="separator" />

        <!-- Section 3: Lister les services et créneaux -->
        <div class="admin-section">
          <h3>Services et créneaux</h3>
          
          <div v-if="services.length === 0" class="empty-state">
            <p>Aucun service créé.</p>
          </div>

          <div v-else class="services-admin">
            <div v-for="service in services" :key="service.id" class="service-admin-card">
              <div class="service-header">
                <h4>{{ service.name }}</h4>
                <button
                  @click="handleDeleteService(service.id)"
                  class="btn btn-sm btn-danger"
                >
                  Supprimer
                </button>
              </div>

              <p class="service-info">{{ service.description || 'Pas de description' }}</p>
              <p class="service-info">Durée: {{ service.duration }} min</p>

              <div class="slots-section">
                <h5>Créneaux:</h5>
                <div v-if="getServiceSlots(service.id).length === 0" class="no-slots">
                  Aucun créneau
                </div>

                <div v-else class="slots-list-admin">
                  <div v-for="slot in getServiceSlots(service.id)" :key="slot.id" class="slot-admin-card">
                    <p>
                      <strong>{{ formatDateTime(slot.datetime) }}</strong>
                      <span class="slot-capacity">{{ slot.available }}/{{ slot.capacity }} places</span>
                    </p>
                    <button
                      @click="handleDeleteSlot(slot.id)"
                      class="btn btn-sm btn-danger"
                    >
                      Supprimer créneau
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ServiceService } from '@/services/ServiceService';
import { AuthService } from '@/services/AuthService';

export default {
  name: 'AdminPanel',
  data() {
    return {
      services: [],
      isAdmin: false,
      newService: {
        name: '',
        description: '',
        duration: 30,
      },
      newSlot: {
        serviceId: '',
        datetime: '',
        capacity: 1,
      },
      serviceError: '',
      serviceSuccess: false,
      slotError: '',
      slotSuccess: false,
      serviceService: new ServiceService(),
      authService: new AuthService(),
    };
  },
  mounted() {
    this.checkAdmin();
    this.loadServices();
  },
  methods: {
    checkAdmin() {
      this.isAdmin = this.authService.isAdmin();
    },
    loadServices() {
      this.services = this.serviceService.getAllServices();
    },
    getServiceSlots(serviceId) {
      const service = this.serviceService.getServiceWithSlots(serviceId);
      return service?.slots || [];
    },
    handleAddService() {
      this.serviceError = '';
      this.serviceSuccess = false;

      const result = this.serviceService.createService({
        name: this.newService.name,
        description: this.newService.description,
        duration: this.newService.duration,
      });

      if (result.success) {
        this.serviceSuccess = true;
        this.newService = { name: '', description: '', duration: 30 };
        this.loadServices();
        this.$emit('service-created', result.service);

        setTimeout(() => {
          this.serviceSuccess = false;
        }, 3000);
      } else {
        this.serviceError = result.error;
      }
    },
    handleAddSlot() {
      this.slotError = '';
      this.slotSuccess = false;

      // Convertir le datetime-local en ISO string
      const datetime = new Date(this.newSlot.datetime).toISOString();

      const result = this.serviceService.addSlot({
        serviceId: this.newSlot.serviceId,
        datetime: datetime,
        capacity: this.newSlot.capacity,
      });

      if (result.success) {
        this.slotSuccess = true;
        this.newSlot = { serviceId: '', datetime: '', capacity: 1 };
        this.loadServices();
        this.$emit('slot-created', result.slot);

        setTimeout(() => {
          this.slotSuccess = false;
        }, 3000);
      } else {
        this.slotError = result.error;
      }
    },
    handleDeleteService(serviceId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce service et tous ses créneaux ?')) {
        const result = this.serviceService.deleteService(serviceId);
        if (result.success) {
          this.loadServices();
          this.$emit('service-deleted', serviceId);
        } else {
          alert(result.error);
        }
      }
    },
    handleDeleteSlot(slotId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
        const result = this.serviceService.deleteSlot(slotId);
        if (result.success) {
          this.loadServices();
          this.$emit('slot-deleted', slotId);
        } else {
          alert(result.error);
        }
      }
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
.admin-panel {
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
  color: #d32f2f;
}

.restricted {
  background-color: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #c62828;
}

.admin-section {
  margin-bottom: 20px;
}

.admin-section h3 {
  color: #333;
  border-bottom: 2px solid #f44336;
  padding-bottom: 10px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: white;
  padding: 15px;
  border-radius: 4px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
  font-size: 14px;
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
  border-color: #f44336;
  box-shadow: 0 0 5px rgba(244, 67, 54, 0.3);
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
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
  font-size: 14px;
}

.btn-primary {
  background-color: #f44336;
  color: white;
}

.btn-primary:hover {
  background-color: #da190b;
}

.btn-sm {
  padding: 6px 10px;
  font-size: 12px;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover {
  background-color: #da190b;
}

.separator {
  border: none;
  border-top: 2px solid #e0e0e0;
  margin: 30px 0;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #999;
}

.services-admin {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.service-admin-card {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  background-color: white;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.service-header h4 {
  margin: 0;
  color: #2c3e50;
}

.service-info {
  margin: 6px 0;
  color: #666;
  font-size: 14px;
}

.slots-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.slots-section h5 {
  margin: 0 0 10px 0;
  color: #333;
}

.no-slots {
  color: #999;
  font-style: italic;
  font-size: 14px;
}

.slots-list-admin {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slot-admin-card {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slot-admin-card p {
  margin: 0;
  flex: 1;
}

.slot-capacity {
  background-color: #e3f2fd;
  color: #1565c0;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  margin-left: 10px;
}
</style>