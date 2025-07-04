<template>
  <div class="home-view">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Welcome to Plant Monitor</h1>
      <p class="text-gray-600 mb-8">Monitor your plant's health with real-time sensor data.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Air Quality</h2>
          <p class="text-gray-600">Monitor air temperature, humidity, and quality metrics.</p>
          <router-link to="/air" class="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            View Air Data
          </router-link>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Soil Health</h2>
          <p class="text-gray-600">Track soil moisture, temperature, and nutrient levels.</p>
          <router-link to="/soil" class="inline-block mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
            View Soil Data
          </router-link>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">History</h2>
          <p class="text-gray-600">Review historical data and trends over time.</p>
          <router-link to="/history" class="inline-block mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors">
            View History
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Home view component for the plant monitoring application
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background-color: #f8fafc;
}
</style>