import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';
import './Map.css';
import CreatePoiModal from './CreatePoiModal';

function Map() {
  const { accessToken } = useAuth();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [showModal, setShowModal] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [editingPoi, setEditingPoi] = useState(null);

  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40],
      zoom: 9,
    });

    map.current.on('click', (e) => {
      setEditingPoi(null);
      setClickedCoords([e.lngLat.lng, e.lngLat.lat]);
      setShowModal(true);
    });

    loadPois();
  }, []);

  useEffect(() => {
    if (accessToken && map.current) {
      loadPois();
    }
  }, [accessToken]);

  const handleEditPOI = (poi) => {
    setEditingPoi(poi);
    setClickedCoords([parseFloat(poi.longitude), parseFloat(poi.latitude)]);
    setShowModal(true);
  };

  const displayPOIs = (pois) => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    pois.forEach((poi) => {
      const markerElement = document.createElement('div');
      markerElement.className = 'poi-marker';
      markerElement.title = poi.name;
      markerElement.dataset.poiId = poi.id;
      markerElement.dataset.poiData = JSON.stringify(poi);

      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        const poiData = JSON.parse(markerElement.dataset.poiData);
        handleEditPOI(poiData);
      });

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([parseFloat(poi.longitude), parseFloat(poi.latitude)])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="poi-popup">
                <h3 class="poi-popup-title">${poi.name}</h3>
                ${poi.description ? `<p class="poi-popup-description">${poi.description}</p>` : ''}
              </div>
            `)
        )
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  };

  const loadPois = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/pois/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const pois = await response.json();
        displayPOIs(pois);
      }
    } catch (error) {
      console.error('Error loading POIs:', error);
    }
  };

  return (
    <>
      <div ref={mapContainer} className='map-container' />
      {showModal && (
        <CreatePoiModal
          clickedCoords={clickedCoords}
          setClickedCoords={setClickedCoords}
          editingPoi={editingPoi}
          setEditingPoi={setEditingPoi}
          loadPois={loadPois}
          setShowModal={setShowModal}
        />
      )}
    </>
  );
}

export default Map;
