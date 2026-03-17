# ✈️ Flight Radar: France

A sleek, real-time flight tracking application focused on the French airspace. This project utilizes the **OpenSky Network API** to fetch live aircraft data and **Leaflet.js** for an interactive, high-performance map interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **Live Tracking**: Real-time aircraft positions updated every 10 seconds.
- **French Focus**: Pre-configured bounds to show activity specifically over Metropolitan France.
- **Interactive Map**: Built with Leaflet.js using a custom dark-themed map (CartoDB Dark Matter).
- **Detailed Insights**: Click any aircraft to see its:
  - Callsign
  - Origin Country
  - Altitude (meters)
  - Velocity (km/h)
  - True Track (heading)
  - ICAO24 Hex code
- **Glassmorphism UI**: Modern, semi-transparent overlays for a premium feel.
- **Directional Markers**: Aircraft icons rotate to match their real-time heading.

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System)
- **Logic**: Vanilla JavaScript (ES6+)
- **Map Library**: [Leaflet.js](https://leafletjs.com/)
- **Data Source**: [OpenSky Network API](https://opensky-network.org/)
- **Typography**: Inter (Google Fonts)

## 🚀 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/rahmanmdmustafizur958-ai/flight-rudder-app.git
    ```
2.  **Open the project**:
    Simply open `index.html` in any modern web browser.

## 📡 API Usage

The application fetches data from the OpenSky REST API using the following bounding box for France:
- **Latitude**: 42.3°N to 51.1°N
- **Longitude**: -4.8°E to 8.2°E

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
*Created with ❤️ powered by OpenSky Network.*
