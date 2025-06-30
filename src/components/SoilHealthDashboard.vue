<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const screenWidth = ref(0)

const updateScreenWidth = () => {
  if (typeof window !== 'undefined') {
    screenWidth.value = window.innerWidth
  }
}

onMounted(() => {
  updateScreenWidth()
  window.addEventListener('resize', updateScreenWidth)
})

const props = defineProps({
  soilData: {
    type: Object,
    required: true,
  },
  healthScore: {
    type: Number,
    required: true,
  },
})

const healthStatus = computed(() => {
  if (props.healthScore >= 90) {
    return {
      color: 'text-emerald-600 dark:text-emerald-400',
      label: 'Excellent',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      soilColor: '#10b981',
      soilGradient: 'from-emerald-600 via-emerald-500 to-emerald-400',
      glowColor: 'shadow-emerald-500/30',
      ringColor: 'ring-emerald-300 dark:ring-emerald-600',
    }
  } else if (props.healthScore >= 75) {
    return {
      color: 'text-green-600 dark:text-green-400',
      label: 'Good',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      soilColor: '#059669',
      soilGradient: 'from-green-600 via-green-500 to-green-400',
      glowColor: 'shadow-green-500/30',
      ringColor: 'ring-green-300 dark:ring-green-600',
    }
  } else if (props.healthScore >= 60) {
    return {
      color: 'text-amber-600 dark:text-amber-400',
      label: 'Fair',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      soilColor: '#d97706',
      soilGradient: 'from-amber-600 via-amber-500 to-amber-400',
      glowColor: 'shadow-amber-500/30',
      ringColor: 'ring-amber-300 dark:ring-amber-600',
    }
  } else if (props.healthScore >= 40) {
    return {
      color: 'text-orange-600 dark:text-orange-400',
      label: 'Poor',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      soilColor: '#ea580c',
      soilGradient: 'from-orange-600 via-orange-500 to-orange-400',
      glowColor: 'shadow-orange-500/30',
      ringColor: 'ring-orange-300 dark:ring-orange-600',
    }
  } else {
    return {
      color: 'text-red-600 dark:text-red-400',
      label: 'Critical',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      soilColor: '#dc2626',
      soilGradient: 'from-red-600 via-red-500 to-red-400',
      glowColor: 'shadow-red-500/30',
      ringColor: 'ring-red-300 dark:ring-red-600',
    }
  }
})
</script>

<template>
  <div class="w-full mx-auto mb-8">
    <div
      class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 dashboard-section overflow-hidden"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Soil Health</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time monitoring dashboard
            </p>
          </div>
        </div>
      </div>

      <div class="p-6 lg:p-8">
        <!-- Unified Layout for Health Score + Parameters -->
        <div class="grid grid-cols-1 gap-8">
          <div class="flex flex-col lg:flex-row lg:items-center lg:gap-8">
            <!-- Enhanced Custom Soil Health Indicator -->
            <div class="w-full lg:w-auto flex justify-center lg:justify-start mb-8 lg:mb-0">
              <div class="flex flex-col items-center space-y-6">
                <!-- Soil Container with Enhanced Design -->
                <div class="relative soil-container-wrapper">
                  <!-- Multi-layered Glow Effect -->
                  <div
                    class="absolute inset-0 rounded-[2rem] blur-3xl opacity-30 animate-pulse transition-all duration-3000"
                    :class="healthStatus.bgColor"
                  ></div>
                  <div
                    class="absolute inset-0 rounded-[2rem] blur-xl opacity-20 animate-pulse"
                    :class="healthStatus.glowColor"
                    style="animation-delay: 0.5s"
                  ></div>

                  <!-- Main Soil Container with Enhanced Styling -->
                  <div
                    class="relative w-60 h-80 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 dark:from-gray-800 dark:via-gray-750 dark:to-gray-700 rounded-[2rem] border-4 border-slate-300/70 dark:border-gray-600/70 overflow-hidden shadow-2xl backdrop-blur-sm ring-1 ring-white/20 dark:ring-gray-500/20 transition-all duration-500 soil-container"
                    :class="healthStatus.glowColor"
                  >
                    <!-- Glass Reflection Effect -->
                    <div
                      class="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"
                    ></div>

                    <!-- Soil Fill with Enhanced Gradient -->
                    <div
                      class="absolute bottom-0 left-0 right-0 bg-gradient-to-t transition-all duration-3000 ease-out rounded-b-[1.7rem] shadow-inner"
                      :class="healthStatus.soilGradient"
                      :style="{ height: `${healthScore}%` }"
                    >
                      <!-- Soil Surface Shimmer -->
                      <div
                        class="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/30 via-white/10 to-transparent animate-shimmer"
                      ></div>

                      <!-- Enhanced Soil Particles with Varied Sizes -->
                      <div class="absolute inset-0 overflow-hidden">
                        <!-- Large particles -->
                        <div
                          class="soil-particle-large"
                          style="left: 15%; animation-delay: 0s"
                        ></div>
                        <div
                          class="soil-particle-large"
                          style="left: 45%; animation-delay: 1.2s"
                        ></div>
                        <div
                          class="soil-particle-large"
                          style="left: 75%; animation-delay: 2.4s"
                        ></div>

                        <!-- Medium particles -->
                        <div
                          class="soil-particle-medium"
                          style="left: 25%; animation-delay: 0.6s"
                        ></div>
                        <div
                          class="soil-particle-medium"
                          style="left: 55%; animation-delay: 1.8s"
                        ></div>
                        <div
                          class="soil-particle-medium"
                          style="left: 85%; animation-delay: 3s"
                        ></div>

                        <!-- Small particles -->
                        <div
                          class="soil-particle-small"
                          style="left: 10%; animation-delay: 0.3s"
                        ></div>
                        <div
                          class="soil-particle-small"
                          style="left: 35%; animation-delay: 0.9s"
                        ></div>
                        <div
                          class="soil-particle-small"
                          style="left: 60%; animation-delay: 1.5s"
                        ></div>
                        <div
                          class="soil-particle-small"
                          style="left: 90%; animation-delay: 2.1s"
                        ></div>

                        <!-- Micro particles for depth -->
                        <div
                          class="soil-particle-micro"
                          style="left: 20%; animation-delay: 0.4s"
                        ></div>
                        <div
                          class="soil-particle-micro"
                          style="left: 40%; animation-delay: 1s"
                        ></div>
                        <div
                          class="soil-particle-micro"
                          style="left: 65%; animation-delay: 1.6s"
                        ></div>
                        <div
                          class="soil-particle-micro"
                          style="left: 80%; animation-delay: 2.2s"
                        ></div>
                      </div>

                      <!-- Organic Matter Visualization -->
                      <div class="absolute inset-0 overflow-hidden opacity-60">
                        <div
                          class="organic-matter"
                          style="left: 30%; top: 20%; animation-delay: 0s"
                        >
                          🌿
                        </div>
                        <div
                          class="organic-matter"
                          style="left: 70%; top: 60%; animation-delay: 1.5s"
                        >
                          🍃
                        </div>
                        <div
                          class="organic-matter"
                          style="left: 50%; top: 40%; animation-delay: 3s"
                        >
                          🌱
                        </div>
                      </div>
                    </div>

                    <!-- Fixed Health Score Display -->
                    <div
                      class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                    >
                      <div
                        class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl px-6 py-4 shadow-2xl border border-white/30 dark:border-gray-600/50 ring-1 ring-black/5 dark:ring-white/10 transition-all duration-500 score-display max-w-[140px] w-auto"
                        :class="healthStatus.ringColor"
                      >
                        <div class="text-center relative">
                          <!-- Score with Enhanced Typography - Fixed Container -->
                          <div class="relative mb-2">
                            <div
                              class="font-black tracking-tight leading-none"
                              :class="[
                                healthStatus.color,
                                healthScore >= 100 ? 'text-3xl' : 'text-4xl',
                              ]"
                            >
                              {{ healthScore }}
                            </div>
                            <!-- Score highlight effect -->
                            <div
                              class="absolute inset-0 font-black tracking-tight opacity-20 blur-sm leading-none"
                              :class="[
                                healthStatus.color,
                                healthScore >= 100 ? 'text-3xl' : 'text-4xl',
                              ]"
                            >
                              {{ healthScore }}
                            </div>
                          </div>

                          <div
                            class="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest"
                          >
                            HEALTH SCORE
                          </div>

                          <!-- Enhanced Status Badge -->
                          <div
                            class="relative px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ring-2 transition-all duration-300"
                            :class="[
                              healthStatus.color,
                              healthStatus.bgColor,
                              healthStatus.ringColor,
                            ]"
                          >
                            {{ healthStatus.label }}
                            <!-- Badge glow effect -->
                            <div
                              class="absolute inset-0 rounded-full opacity-30 blur-md"
                              :class="healthStatus.bgColor"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Enhanced Measurement Lines with Gradient -->
                    <div
                      class="absolute left-0 top-0 bottom-0 w-1 flex flex-col justify-between py-6"
                    >
                      <div
                        v-for="i in 6"
                        :key="i"
                        class="w-6 h-0.5 bg-gradient-to-r from-slate-400 to-transparent dark:from-gray-500 opacity-60"
                      ></div>
                    </div>
                    <div
                      class="absolute right-5 top-0 bottom-0 w-1 flex flex-col justify-between py-6"
                    >
                      <div
                        v-for="i in 6"
                        :key="i"
                        class="w-6 h-0.5 bg-gradient-to-l from-slate-400 to-transparent dark:from-gray-500 opacity-60"
                      ></div>
                    </div>
                  </div>

                  <!-- Fixed Soil Base with Better Shadow and Reflection -->
                  <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-10">
                    <div class="relative soil-base">
                      <!-- Main base with better gradient -->
                      <div
                        class="w-16 h-6 bg-gradient-to-b from-gray-400 via-gray-500 to-gray-600 dark:from-gray-500 dark:via-gray-600 dark:to-gray-700 rounded-full shadow-lg"
                      ></div>
                      <!-- Subtle top reflection that doesn't overlap -->
                      <div
                        class="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-2 bg-gradient-to-b from-white/40 to-transparent dark:from-white/20 rounded-full"
                      ></div>
                      <!-- Ground shadow -->
                      <div
                        class="absolute top-full left-1/2 transform -translate-x-1/2 w-20 h-3 bg-black/10 dark:bg-black/30 rounded-full blur-sm"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Parameters Section -->
            <div class="flex-1 space-y-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Key Parameters
              </h3>

              <!-- Temperature -->
              <div class="group">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center"
                    >
                      <span class="text-lg">🌡️</span>
                    </div>
                    <div>
                      <div class="font-semibold text-gray-900 dark:text-white">Temperature</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">Soil temperature</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div
                      class="text-xl font-bold"
                      :class="{
                        'text-emerald-600 dark:text-emerald-400':
                          soilData.temperature.status === 'optimal',
                        'text-amber-600 dark:text-amber-400':
                          soilData.temperature.status === 'warning',
                        'text-red-600 dark:text-red-400':
                          soilData.temperature.status === 'critical',
                      }"
                    >
                      {{ soilData.temperature.value }}{{ soilData.temperature.unit }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {{ soilData.temperature.status }}
                    </div>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div class="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    class="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                    :class="{
                      'bg-gradient-to-r from-emerald-500 to-emerald-400':
                        soilData.temperature.status === 'optimal',
                      'bg-gradient-to-r from-amber-500 to-amber-400':
                        soilData.temperature.status === 'warning',
                      'bg-gradient-to-r from-red-500 to-red-400':
                        soilData.temperature.status === 'critical',
                    }"
                    :style="{
                      width: `${Math.min(((soilData.temperature.value - soilData.temperature.min) / (soilData.temperature.max - soilData.temperature.min)) * 100, 100)}%`,
                    }"
                  ></div>
                </div>
              </div>

              <!-- Moisture -->
              <div class="group">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30 flex items-center justify-center"
                    >
                      <span class="text-lg">💧</span>
                    </div>
                    <div>
                      <div class="font-semibold text-gray-900 dark:text-white">Moisture</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        Soil moisture level
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div
                      class="text-xl font-bold"
                      :class="{
                        'text-emerald-600 dark:text-emerald-400':
                          soilData.moisture.status === 'optimal',
                        'text-amber-600 dark:text-amber-400':
                          soilData.moisture.status === 'warning',
                        'text-red-600 dark:text-red-400': soilData.moisture.status === 'critical',
                      }"
                    >
                      {{ soilData.moisture.value }}{{ soilData.moisture.unit }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {{ soilData.moisture.status }}
                    </div>
                  </div>
                </div>

                <div class="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    class="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                    :class="{
                      'bg-gradient-to-r from-emerald-500 to-emerald-400':
                        soilData.moisture.status === 'optimal',
                      'bg-gradient-to-r from-amber-500 to-amber-400':
                        soilData.moisture.status === 'warning',
                      'bg-gradient-to-r from-red-500 to-red-400':
                        soilData.moisture.status === 'critical',
                    }"
                    :style="{
                      width: `${Math.min(((soilData.moisture.value - soilData.moisture.min) / (soilData.moisture.max - soilData.moisture.min)) * 100, 100)}%`,
                    }"
                  ></div>
                </div>
              </div>

              <!-- pH Level -->
              <div class="group">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 flex items-center justify-center"
                    >
                      <span class="text-lg">⚗️</span>
                    </div>
                    <div>
                      <div class="font-semibold text-gray-900 dark:text-white">pH Level</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        Soil acidity/alkalinity
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div
                      class="text-xl font-bold"
                      :class="{
                        'text-emerald-600 dark:text-emerald-400': soilData.ph.status === 'optimal',
                        'text-amber-600 dark:text-amber-400': soilData.ph.status === 'warning',
                        'text-red-600 dark:text-red-400': soilData.ph.status === 'critical',
                      }"
                    >
                      {{ soilData.ph.value }}{{ soilData.ph.unit }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {{ soilData.ph.status }}
                    </div>
                  </div>
                </div>

                <div class="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    class="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                    :class="{
                      'bg-gradient-to-r from-emerald-500 to-emerald-400':
                        soilData.ph.status === 'optimal',
                      'bg-gradient-to-r from-amber-500 to-amber-400':
                        soilData.ph.status === 'warning',
                      'bg-gradient-to-r from-red-500 to-red-400': soilData.ph.status === 'critical',
                    }"
                    :style="{
                      width: `${Math.min(((soilData.ph.value - soilData.ph.min) / (soilData.ph.max - soilData.ph.min)) * 100, 100)}%`,
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-section {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.6s ease-out;
}

.dashboard-section:hover {
  transform: translateY(-2px);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

/* Fixed soil container hover effects */
.soil-container-wrapper:hover .soil-container {
  transform: translateY(-2px) scale(1.02);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.soil-container-wrapper:hover .score-display {
  transform: scale(1.05);
}

/* Fixed soil base hover effects */
.soil-base {
  transition: all 0.3s ease;
}

.soil-container-wrapper:hover .soil-base {
  transform: translateY(-1px);
}

/* Enhanced Soil Particles with Varied Sizes */
.soil-particle-large {
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: floatUp 5s infinite linear;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.4);
}

.soil-particle-medium {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  animation: floatUp 4s infinite linear;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
}

.soil-particle-small {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: floatUp 3.5s infinite linear;
}

.soil-particle-micro {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  animation: floatUp 3s infinite linear;
}

/* Organic Matter Animation */
.organic-matter {
  position: absolute;
  font-size: 14px;
  animation: gentleFloat 6s infinite ease-in-out;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Enhanced Animations */
@keyframes floatUp {
  0% {
    bottom: 0;
    opacity: 0;
    transform: translateX(0) scale(0.5);
  }
  10% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    transform: translateX(10px) scale(1.1);
  }
  90% {
    opacity: 1;
    transform: translateX(-5px) scale(0.9);
  }
  100% {
    bottom: 100%;
    opacity: 0;
    transform: translateX(0) scale(0.5);
  }
}

@keyframes gentleFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-10px) rotate(2deg);
  }
  50% {
    transform: translateY(-5px) rotate(-1deg);
  }
  75% {
    transform: translateY(-15px) rotate(1deg);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  background-size: 200% 100%;
  animation: shimmer 3s infinite;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced shadows for depth */
.shadow-3xl {
  box-shadow:
    0 35px 60px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

@media (max-width: 640px) {
  .dashboard-section:hover {
    transform: none;
  }

  .soil-container-wrapper:hover .soil-container {
    transform: none;
  }

  .soil-container-wrapper:hover .score-display {
    transform: none;
  }

  .soil-container-wrapper:hover .soil-base {
    transform: none;
  }
}
</style>
