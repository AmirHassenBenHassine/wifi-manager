import paho.mqtt.client as mqtt
import subprocess
import json

# MQTT Configuration
BROKER = "orion.local"
PORT = 9001  # Use WebSocket port
TOPIC = "wifi/connect"

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
        ssid = data.get("ssid")
        password = data.get("password")

        if ssid and password:
            print(f"🌐 Connecting to {ssid}...")
            command = f'nmcli device wifi connect "{ssid}" password "{password}"'
            process = subprocess.run(command, shell=True, capture_output=True, text=True)

            if process.returncode == 0:
                print("✅ Connected successfully")
            else:
                print(f"❌ Connection failed: {process.stderr}")

    except Exception as e:
        print(f"Error processing message: {e}")

client = mqtt.Client(transport="websockets")  # Use WebSocket transport
client.on_message = on_message
client.connect(BROKER, PORT, 60)
client.subscribe(TOPIC)

print("🚀 Listening for Wi-Fi credentials...")
client.loop_forever()
