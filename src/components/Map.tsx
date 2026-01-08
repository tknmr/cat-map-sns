import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = () => {
  const position: [number, number] = [35.6895, 139.6917]; // 東京の緯度経度

  return (
    <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100vw' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={position}>
        <Popup>サンプルの猫スポット</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;