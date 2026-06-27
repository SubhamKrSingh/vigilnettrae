import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Marker, useMap } from 'react-leaflet';
import useVigilNetStore from '../store/useVigilNetStore';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import { useMapRef } from '../context/MapContext';

function MapControllerInternal() {
    const map = useMap();
    const { mapRef } = useMapRef();
    useEffect(() => {
        mapRef.current = map;
    }, [map, mapRef]);
    return null;
}

function createPulseIcon(campaign) {
    const confidence = campaign.confidence || 0.75;
    const isLive = campaign.is_demo || campaign.status === "live";
    const color = isLive ? "#D85A30" : (confidence > 0.8 ? "#D85A30" : "#E09B20");
    const size = isLive ? 18 : (confidence > 0.8 ? 14 : 11);
    const pulseCount = isLive ? 3 : 1; // triple ring for live

    const rings = Array.from({ length: pulseCount }, (_, i) => `
        <div style="
            position:absolute;
            top:50%;left:50%;
            transform:translate(-50%,-50%);
            width:${size}px;height:${size}px;
            border-radius:50%;
            background:${color};
            animation:vigilpulse ${1.6 + i * 0.4}s ease-out ${i * 0.4}s infinite;
            z-index:${1 + i};
        "></div>
    `).join('');

    return divIcon({
        className: '',
        html: `
            <div style="position:relative;width:${size * 4}px;height:${size * 4}px;">
                <div style="
                    position:absolute;top:50%;left:50%;
                    transform:translate(-50%,-50%);
                    width:${size}px;height:${size}px;
                    border-radius:50%;background:${color};z-index:10;
                    box-shadow:0 0 ${isLive ? 12 : 6}px ${color};
                "></div>
                ${rings}
            </div>
        `,
        iconSize: [size * 4, size * 4],
        iconAnchor: [size * 2, size * 2],
    });
}

function MapControllerInternal() {
    const map = useMap();
    const { mapRef } = useMapRef();
    useEffect(() => {
        mapRef.current = map;
    }, [map, mapRef]);
    return null;
}

const CampaignMap = () => {
    const { campaigns, selectedCampaign, selectCampaign } = useVigilNetStore();
    const mapRef = useRef(null);

    return (
        <div className="rounded-2xl border border-border overflow-hidden h-full">
            <MapContainer
                ref={mapRef}
                style={{ height: '100%', width: '100%', borderRadius: '12px' }}
                center={[20.5937, 78.9629]}
                zoom={5}
            >
                <MapControllerInternal />
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {campaigns.map((campaign) => (
                    <React.Fragment key={campaign.id}>
                        <Circle
                            center={[campaign.lat, campaign.lng]}
                            radius={campaign.radius_km * 1000}
                            pathOptions={{
                                color: '#7F77DD',
                                fillColor: '#7F77DD',
                                fillOpacity: 0.1,
                                weight: 2,
                            }}
                        />
                        <Marker
                            position={[campaign.lat, campaign.lng]}
                            icon={createPulseIcon(campaign)}
                            eventHandlers={{ click: () => selectCampaign(campaign) }}
                        >
                            <Popup>
                                <div style={{
                                    background: '#191C24',
                                    color: '#E8E6E0',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    minWidth: '160px'
                                }}>
                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                        {campaign.campaign_type}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#888780' }}>
                                        {campaign.location}
                                    </div>
                                    <div style={{
                                        fontSize: 12,
                                        color: '#1DB87A',
                                        marginTop: 4
                                    }}>
                                        Confidence: {Math.round((campaign.confidence ?? 0) * 100)}%
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    </React.Fragment>
                ))}
            </MapContainer>
        </div>
    );
};

export default CampaignMap;
