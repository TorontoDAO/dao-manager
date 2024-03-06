import React, { useEffect, useState } from "react"
import L from "leaflet"
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"

// Define a custom icon since Leaflet's default icon might not work properly without extra configuration
const pinIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
})

function DraggableMarker({ location }: any) {
  const [position, setPosition] = useState({ lat: 51.505, lng: -0.09 })
  const map = useMapEvents({
    dragend() {
      const { lat, lng } = map.getCenter()
      setPosition({ lat, lng })
    },
  })

  useEffect(() => {
    if (location?.latitude)
      setPosition({ lat: location?.latitude, lng: location?.longitude })
  }, [location])

  return (
    <Marker
      position={position}
      draggable={true}
      icon={pinIcon}
      eventHandlers={{
        dragend: (event) => {
          const { lat, lng } = event.target.getLatLng()
          setPosition({ lat, lng })
        },
      }}
    />
  )
}

export function SetLocation({ location }: any) {
  return (
    <div>
      <p className="mt-3 mb-2 text-sm font-semibold text-white">
        Please drag the pin the right location
      </p>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <DraggableMarker location={location} />
      </MapContainer>
    </div>
  )
}
