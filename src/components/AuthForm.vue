<template>
  <div class="auth-form">
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
            placeholder="alice@example.com"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary">Se connecter</button>
      </form>
    </div>
  </div>
</template>

<script>
import { AuthService } from '@/services/AuthService';

export default {
  name: 'AuthForm',
  data() {
    return {
      email: '',
      error: '',
      currentUser: null,
      authService: new AuthService(),
    };
  },
  mounted() {
    this.loadCurrentUser();
  },
  methods: {
    loadCurrentUser() {
      this.currentUser = this.authService.getCurrentUser();
    },
    handleLogin() {
      this.error = '';
      
      if (!this.email.trim()) {
        this.error = 'L\'email est requis';
        return;
      }

      const result = this.authService.login(this.email.trim());
      
      if (result.success) {
        this.currentUser = result.user;
        this.email = '';
        this.$emit('login-success', result.user);
      } else {
        this.error = result.error;
      }
    },
    handleLogout() {
      this.authService.logout();
      this.currentUser = null;
      this.$emit('logout-success');
    },
  },
};
</script>

<style scoped>
.auth-form {
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

.login-form {
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

input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

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

.btn-primary:hover {
  background-color: #45a049;
}

.btn-logout {
  background-color: #f44336;
  color: white;
}

.btn-logout:hover {
  background-color: #da190b;
}
</style>