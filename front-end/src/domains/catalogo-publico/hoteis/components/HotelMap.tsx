import type { IHotel, IHotelCoordinates } from "@/entities/hotel/hotel.types";
import L, { type Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, type ReactElement } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Corrige o caminho dos ícones padrão do Leaflet, que quebra com bundlers (Vite) por padrão.
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MAP_ZOOM = 13;

interface IHotelMapProps {
  center: IHotelCoordinates;
  hotels: IHotel[];
  selectedHotelId: string | null;
  onSelectHotel: (hotelId: string) => void;
}

/** Centraliza o mapa e abre o popup do hotel selecionado a partir da lista. */
function FlyToSelectedHotel({
  hotels,
  selectedHotelId,
  markerRefs,
}: {
  hotels: IHotel[];
  selectedHotelId: string | null;
  markerRefs: React.RefObject<Map<string, LeafletMarker>>;
}): null {
  const map = useMap();

  useEffect(() => {
    if (!selectedHotelId) {
      return;
    }
    const hotel = hotels.find((item) => item.id === selectedHotelId);
    if (!hotel) {
      return;
    }
    map.flyTo([hotel.coordinates.lat, hotel.coordinates.lon], MAP_ZOOM, {
      duration: 0.6,
    });
    markerRefs.current.get(selectedHotelId)?.openPopup();
  }, [selectedHotelId, hotels, map, markerRefs]);

  return null;
}

export function HotelMap({
  center,
  hotels,
  selectedHotelId,
  onSelectHotel,
}: IHotelMapProps): ReactElement {
  const markerRefs = useRef<Map<string, LeafletMarker>>(new Map());

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl border border-zinc-200 shadow-sm lg:h-[520px]">
      <MapContainer
        center={[center.lat, center.lon]}
        zoom={MAP_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hotels.map((hotel: IHotel) => (
          <Marker
            key={hotel.id}
            position={[hotel.coordinates.lat, hotel.coordinates.lon]}
            icon={defaultIcon}
            ref={(instance) => {
              if (instance) {
                markerRefs.current.set(hotel.id, instance);
              } else {
                markerRefs.current.delete(hotel.id);
              }
            }}
            eventHandlers={{ click: () => onSelectHotel(hotel.id) }}
          >
            <Popup>
              <p className="font-semibold">{hotel.name}</p>
              {hotel.address ? <p>{hotel.address}</p> : null}
            </Popup>
          </Marker>
        ))}

        <FlyToSelectedHotel
          hotels={hotels}
          selectedHotelId={selectedHotelId}
          markerRefs={markerRefs}
        />
      </MapContainer>
    </div>
  );
}
