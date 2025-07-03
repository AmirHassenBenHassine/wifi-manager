import paho.mqtt.client as mqtt
import subprocess
import json
import time
import threading

# MQTT Configuration
BROKER = "127.0.0.1"  # Use loopback IP
PORT = 9001
TOPIC = "wifi/connect"

# Store last Wi-Fi credentials for reattempt
last_ssid = None
last_password = None
connected = False
mqtt_running = True

# Timer to track connection attempts
last_connection_time = time.time()

def restart_avahi():
    subprocess.run("sudo systemctl restart avahi-daemon", shell=True, capture_output=True, text=True)

def restart_network_manager():
    subprocess.run("sudo systemctl restart NetworkManager", shell=True, capture_output=True, text=True)
    time.sleep(5)

def connect_wifi(ssid, password):
    global connected, last_connection_time
    print(f"🌐 Connecting to {ssid}...")
    command = f'nmcli device wifi connect "{ssid}" password "{password}"'
    process = subprocess.run(command, shell=True, capture_output=True, text=True)

    if process.returncode == 0:
        print("✅ Connected successfully!")
        connected = True
        last_connection_time = time.time()
        return True
    else:
        print(f"❌ Connection failed: {process.stderr}")
        connected = False
        return False

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✅ Connected to MQTT broker with result code {rc}")
        client.subscribe(TOPIC, qos=1)
        print(f"📡 Subscribed to topic: {TOPIC}")
    else:
        print(f"❌ Failed to connect to MQTT broker with code {rc}")

def on_message(client, userdata, msg):
    global last_ssid, last_password, connected
    try:
        print(f"📩 Received message on topic {msg.topic}: {msg.payload.decode()}")
        data = json.loads(msg.payload.decode())
        ssid = data.get("ssid")
        password = data.get("password")

        if ssid and password:
            if ssid == last_ssid and connected:
                print(f"✅ Already connected to {ssid}, skipping.")
                return

            last_ssid = ssid
            last_password = password
            connected = False

            if not connect_wifi(ssid, password):
                print(f"⚠️ Connection to {ssid} failed, retrying after restarting NetworkManager...")
                restart_network_manager()
                connect_wifi(ssid, password)
    except Exception as e:
        print(f"❌ Error processing message: {e}")

def monitor_connection():
    global last_connection_time, connected, mqtt_running
    while mqtt_running:
        if time.time() - last_connection_time > 180 and not connected:
            print("🔄 Restarting Avahi due to inactivity...")
            restart_avahi()
            last_connection_time = time.time()
        time.sleep(10)

# MQTT Client Setup
client = mqtt.Client(transport="websockets")
client.on_connect = on_connect
client.on_message = on_message

# Retry connection logic
def connect_mqtt():
    global mqtt_running
    while mqtt_running:
        try:
            client.connect(BROKER, PORT, 60)
            print("🚀 MQTT client connected, starting loop...")
            client.loop_start()
            break
        except Exception as e:
            print(f"❌ Failed to connect to MQTT broker: {e}")
            time.sleep(5)  # Retry every 5 seconds

# Start MQTT connection in a separate thread
mqtt_thread = threading.Thread(target=connect_mqtt, daemon=True)
mqtt_thread.start()

# Start the monitoring thread
monitor_thread = threading.Thread(target=monitor_connection, daemon=True)
monitor_thread.start()

print("🚀 Listening for Wi-Fi credentials...")
try:
    while mqtt_running:
        time.sleep(1)  # Keep the main thread alive
except KeyboardInterrupt:
    print("🛑 Stopping MQTT client and exiting...")
    mqtt_running = False
    client.loop_stop()
    client.disconnect()
