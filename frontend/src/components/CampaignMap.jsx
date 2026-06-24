import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import useVigilNetStore from '../store/useVigilNetStore';
import 'leaflet/dist/leaflet.css';

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 8);
    }
  }, [center, map]);
  return null;
};

const CampaignMap = () => {
  const { campaigns, selectedCampaign, selectCampaign } = useVigilNetStore();

  const defaultCenter = [20.5937, 78.9629];

  return (
    <div className="h-full rounded-2xl overflow-hidden border border-border">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        />
        <MapController
          center={selectedCampaign ? [selectedCampaign.center_lat, selectedCampaign.center_lng] : defaultCenter}
        />
        {campaigns.map((campaign) => {
          const confidence = campaign.confidence || 0.5;
          const color = confidence >= 0.8 ? '#D85A30' : confidence >= 0.6 ? '#E09B20' : '#1DB87A';
          const size = 200 + (campaign.sim_count / 2);
          return (
            <Circle
              key={campaign.id}
              center={[campaign.center_lat, campaign.center_lng]}
              radius={campaign.radius_km * 1000}
              fillColor={color}
              color={color}
              weight={2}
              fillOpacity={0.3}
              eventHandlers={{
                click: () => selectCampaign(campaign),
              }}
            >
              <Popup className="bg-surface border border-border rounded-xl text-text">
                <div className="p-2">
                  <h4 className="font-bold">{campaign.campaign_type}</h4>
                  <p className="text-muted text-sm">{campaign.location}</p>
                  <p className="text-sm mt-1">Confidence: {(confidence * 100).toFixed(0)}%</p>
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default CampaignMap;
