export interface WiFiNetwork {
  ssid: string;
  rssi: number;
  secure: boolean;
}

export interface MQTTConfig {
  host: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
  topics: {
    wifiList: string;
    wifiConnect: string;
    wifiStatus: string;
  };
}