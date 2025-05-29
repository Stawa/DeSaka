# DeSaka - Environmental Monitoring System

<div align="center">

![DeSaka Logo](./public/favicon.ico)

_Advanced IoT-based environmental monitoring solution for agriculture and environmental science_

</div>

## 📋 Project Overview

DeSaka is a comprehensive environmental monitoring system that collects, processes, and visualizes data from various sensors. The system provides real-time insights into soil and air conditions, enabling data-driven decision making for agricultural and environmental applications.

## 🏗️ System Architecture

```
┌──────────────┐     ┌──────────────┐     ┌────────────────────┐
│   Sensors     │───▶│     ESP32    │───▶ │   Web Server / UI  │
│ (DHT22, Soil) │    │ (WiFi + HTTP)│     │  (Laptop Browser)  │
└──────────────┘     └──────────────┘     └────────────────────┘
```

DeSaka uses a simplified architecture where the ESP32 communicates directly with the web client, eliminating the need for a separate server. Data is stored locally on the client, making the system more efficient and easier to deploy in remote locations.

### Components

1. **Data Collection Layer**

   - ESP32 microcontroller
   - Environmental sensors (temperature, humidity, soil moisture)
   - Power management system

2. **Presentation & Storage Layer**
   - Vue.js web application
   - Local data storage
   - Real-time data visualization
   - Historical data analysis

## 🔧 Technology Stack

- **Hardware**: ESP32, DHT22, Soil Moisture Sensor
- **Frontend**: Vue.js, Chart.js, TailwindCSS
- **Communication**: WebSockets, Bluetooth or WiFi Direct
- **Storage**: IndexedDB or LocalStorage

## 📦 Hardware Components

| Item                                 | Price (IDR)      |
| ------------------------------------ | ---------------- |
| ESP32 CH340 Dev Board                | Rp59.900         |
| DHT22 Temperature & Humidity Sensor  | Rp21.000         |
| Capacitive Soil Moisture Sensor V1.2 | Rp10.000         |
| Breadboard MB-102 (830 pts)          | Rp8.900          |
| Jumper Wires (40 pcs, Male to Male)  | Rp9.450          |
| Resistor 4.7kΩ (pack of 10)          | Rp1.000          |
| **Total**                            | **Rp110.250** ✅ |
