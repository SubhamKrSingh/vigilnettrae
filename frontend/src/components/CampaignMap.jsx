import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap, Marker } from 'react-leaflet';
import useVigilNetStore from '../store/useVigilNetStore';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';


function createPulseIcon(confidence) {
    // Color based on confidence: high = coral, medium = amber
    const color = confidence > 0.8 ? '#D85A30' : '#E09B20';
    const size = confidence > 0.8 ? 14 : 11;

    return divIcon({
        className: '',
        html: `
            <div style="position:relative;width:${size*3}px;height:${size*3}px;">
                <div style="
                    position:absolute;
                    top:50%;left:50%;
                    transform:translate(-50%,-50%);
                    width:${size}px;height:${size}px;
                    border-radius:50%;
                    background:${color};
                    z-index:2;
                "></div>
                <div style="
                    position:absolute;
                    top:50%;left:50%;
                    transform:translate(-50%,-50%);
                    width:${size}px;height:${size}px;
                    border-radius:50%;
                    background:${color};
                    animation:vigilpulse 1.8s ease-out infinite;
                    z-index:1;
                "></div>
            </div>
        `,
        iconSize: [size*3, size*3],
        iconAnchor: [size*1.5, size*1.5],
    });
}


const AutoCenter = ({ campaigns, selectedCampaign }) => {
    const map = useMap();

    useEffect(() => {
        if (campaigns.length === 0) return;

        if (selectedCampaign) {
            map.setView([selectedCampaign.center_lat, selectedCampaign.center_lng], 10);
        } else {
            const defaultLat = 20.5937; // India center
            const defaultLng = 78.9629;
            map.setView([defaultLat, defaultLng], 5);
        }
    }, [campaigns, selectedCampaign, map]);

    return null;
};


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
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <AutoCenter campaigns={campaigns} selectedCampaign={selectedCampaign} />

                {campaigns.map((campaign) => (
                    <React.Fragment key={campaign.id}>
                        <Circle
                            center={[campaign.center_lat, campaign.center_lng]}
                            radius={campaign.radius_km * 1000}
                            pathOptions={{
                                color: '#7F77DD',
                                fillColor: '#7F77DD',
                                fillOpacity: 0.1,
                                weight: 2,
                            }}
                        />
                        <Marker
                            position={[campaign.center_lat, campaign.center_lng]}
                            icon={createPulseIcon(campaign.confidence || 0.75)}
                            eventHandlers={{ click: () => selectCampaign(campaign) }}
                        >
                            <Popup>
                                <div style={{background:'#191C24',color:'#E8E6E0',padding:'8px',borderRadius:'6px',minWidth:'160px'}}>
                                    <div style={{fontWeight:600,marginBottom:4}}>{campaign.campaign_type}</div>
                                    <div style={{fontSize:12,color:'#888780'}}>{campaign.location}</div>
                                    <div style={{fontSize:12,color:'#1DB87A',marginTop:4}}>
                                        Confidence: {Math.round((campaign.confidence||0)*100)}%
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
