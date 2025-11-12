<template>
  <div class="service-list">
    <div class="card">
      <h2>Services disponibles</h2>
      
      <div v-if="services.length === 0" class="empty-state">
        <p>Aucun service disponible pour le moment.</p>
      </div>

      <div v-else class="services-grid">
        <div v-for="service in services" :key="service.id" class="service-card">
          <h3>{{ service.name }}</h3>
          <p v-if="service.description" class="description">{{ service.description }}</p>
          <p class="duration">⏱️ Durée: {{ service.duration }} min</p>
          
          <div class="slots-info">
            <p v-if="getSlotsForService(service.id).length === 0" class="no-slots">
              Aucun créneau disponible
            </p>
            <div v-else class="slots-list">
              <span v-for="slot in getSlotsForService(service.id)" :key="slot.id" class="slot-tag">
                {{ formatDateTime(slot.datetime) }}
              </span>
            </div>
          </div>

          <button
            @click="$emit('select-service', service)"
            class="btn btn-secondary"
          >
            Voir les créneaux
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ServiceService } from '@/services/ServiceService';

export default {
  name: 'ServiceList',
  data() {
    return {
      services: [],
      serviceService: new ServiceService(),
    };
  },
  mounted() {
    this.loadServices();
    this.$on('refresh-services', this.loadServices);
  },
  methods: {
    loadServices() {
      this.services = this.serviceService.getAllServices();
    },
    getSlotsForService(serviceId) {
      return this.serviceService
        .getServiceWithSlots(serviceId)
        ?.slots || [];
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
.service-list {
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

.empty-state {
  text-align: center;
  padding: 20px;
  color: #666;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.service-card {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  background-color: white;
  transition: box-shadow 0.3s;
}

.service-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.service-card h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.description {
  color: #666;
  font-size: 14px;
  margin: 8px 0;
}

.duration {
  color: #f39c12;
  font-weight: bold;
  margin: 8px 0;
}

.slots-info {
  margin: 12px 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.no-slots {
  color: #d32f2f;
  font-size: 13px;
  margin: 0;
}

.slots-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.slot-tag {
  background-color: #4CAF50;
  color: white;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.3s;
  width: 100%;
  margin-top: 10px;
}

.btn-secondary {
  background-color: #2196F3;
  color: white;
}

.btn-secondary:hover {
  background-color: #0b7dda;
}
</style>