import { MQTTConfig } from './types';

export const mqttConfig = {
  host: "orion.local", // 🔹 Orange Pi's IP
  port: 9001,
  clientId: `webapp_${Math.random().toString(16).substr(2, 8)}`,
  username: "",  // Set if required
  password: "",
  topics: {
    wifiList: "orion/scan",     // 🔹 ESP32 publishes WiFi networks here
    wifiConnect: "orion/config",
    wifiStatus: "orion/confirm",
    wifiRefresh: "orion/refresh", // 🔹 New topic for requesting a Wi-Fi scan
    wifiConfirm: "wifi/connect" // Topic for python script to receive and connect to WiFi
  }
};
