import { useState, useEffect, useCallback, useRef } from "react";
import mqtt from "mqtt";
import { WiFiNetwork } from "../types";
import { mqttConfig } from "../config";

export const useMQTT = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [wifiNetworks, setWifiNetworks] = useState<WiFiNetwork[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // Use refs to store the client and credentials
  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const storedCredentialsRef = useRef<{ ssid: string; password: string } | null>(null);

  // ✅ Initialize MQTT connection
  useEffect(() => {
    const url = `ws://${mqttConfig.host}:${mqttConfig.port}/mqtt`;
    console.log(`🟢 Connecting to MQTT at: ${url}`);

    const mqttClient = mqtt.connect(url, {
      clientId: mqttConfig.clientId,
      username: mqttConfig.username,
      password: mqttConfig.password,
      reconnectPeriod: 5000,
    });

    mqttClient.on("connect", () => {
      console.log("✅ Connected to MQTT broker");
      setIsConnected(true);
      mqttClient.subscribe(mqttConfig.topics.wifiList);
      mqttClient.subscribe(mqttConfig.topics.wifiStatus);
    });

    mqttClient.on("message", (topic, message) => {
      const payload = message.toString();
      console.log(`📩 Received MQTT message on ${topic}:`, payload);

      if (topic === mqttConfig.topics.wifiList) {
        handleWiFiList(payload);
      } else if (topic === mqttConfig.topics.wifiStatus) {
        handleWiFiStatus(payload);
      }
    });

    mqttClient.on("error", (error) => {
      console.error("❌ MQTT error:", error);
      setIsConnected(false);
    });

    mqttClient.on("close", () => {
      console.log("🔌 MQTT connection closed");
      setIsConnected(false);
    });

    // Store the client in a ref
    clientRef.current = mqttClient;

    return () => {
      console.log("🛑 Disconnecting MQTT...");
      mqttClient.end();
      clientRef.current = null; // Clear the ref on cleanup
    };
  }, []);

  // ✅ Handle Wi-Fi scan results
  const handleWiFiList = (payload: string) => {
    try {
      const networks = JSON.parse(payload);
      if (Array.isArray(networks)) {
        setWifiNetworks(networks);
        setIsScanning(false);
      } else {
        console.error("❌ Invalid WiFi list format:", networks);
      }
    } catch (error) {
      console.error("❌ Failed to parse WiFi list:", error);
    }
  };

  // ✅ Handle Wi-Fi status updates
  const handleWiFiStatus = useCallback(
    async (payload: string) => {
      try {
        console.log("📩 Processing Wi-Fi status payload:", payload);
        const status = JSON.parse(payload);

        if (status.status === "success") {
          console.log("✅ Wi-Fi connection was successful!");
          setConnectionStatus("success");
          setStatusMessage(`✅ Connected successfully`);

          if (storedCredentialsRef.current) {
            console.log("📡 Sending stored credentials to Orange Pi...");
            console.log("🔹 Stored credentials:", storedCredentialsRef.current);

            if (clientRef.current) {
              console.log("📤 Sending credentials to Orange Pi NOW...");
              sendWiFiCredentialsToOrangePi(
                storedCredentialsRef.current.ssid,
                storedCredentialsRef.current.password
              );
            } else {
              console.error("❌ MQTT client is null, cannot send credentials!");
            }
          } else {
            console.warn("⚠️ No stored credentials found!");
          }
        } else {
          console.log("❌ Wi-Fi connection failed!");
          setConnectionStatus("error");
          setStatusMessage("❌ Failed to connect");
        }
      } catch (error) {
        console.error("❌ Failed to parse WiFi status:", error);
      }
    },
    [] // No dependencies needed since we're using refs
  );

  // ✅ Send Wi-Fi credentials to Orange Pi
  const sendWiFiCredentialsToOrangePi = (ssid: string, password: string) => {
    if (!clientRef.current) return;
    console.log(`📤 Sending Wi-Fi credentials to Orange Pi: SSID=${ssid}, Password=${password}`);
    clientRef.current.publish(mqttConfig.topics.wifiConfirm, JSON.stringify({ ssid, password }));
  };

  // ✅ Scan for available networks
  const scanNetworks = useCallback(() => {
    if (!clientRef.current || !isConnected) {
      console.warn("⚠️ Cannot scan: Not connected to MQTT broker");
      return;
    }

    setWifiNetworks([]);
    setIsScanning(true);
    console.log("📡 Requesting Wi-Fi scan...");
    clientRef.current.publish(mqttConfig.topics.wifiRefresh, JSON.stringify({ action: "scan" }));
  }, [isConnected]);

  // ✅ Connect to a Wi-Fi network
  const connectToWifi = useCallback(
    (ssid: string, password: string) => {
      if (!clientRef.current || !isConnected) {
        console.warn("⚠️ Cannot connect: Not connected to MQTT broker");
        return;
      }

      // Update the ref with the new credentials
      storedCredentialsRef.current = { ssid, password };
      console.log("🔹 Setting stored credentials:", storedCredentialsRef.current);

      setConnectionStatus("connecting");
      setStatusMessage(`🔄 Connecting to ${ssid}...`);

      console.log(`📤 Sending Wi-Fi credentials to ESP32: SSID=${ssid}, Password=${password}`);
      clientRef.current.publish(mqttConfig.topics.wifiConnect, JSON.stringify({ ssid, password }));
    },
    [isConnected]
  );

  return {
    isConnected,
    wifiNetworks,
    scanNetworks,
    connectToWifi,
    connectionStatus,
    statusMessage,
    isScanning,
  };
};
