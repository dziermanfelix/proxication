import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { usePoi } from '../contexts/PoiContext';
import './Map.css';
import CreatePoiModal from './CreatePoiModal';
import DeletePoiModal from './DeletePoiModal';

function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);

  const { pois, setShowPoiModal, setClickedCoords, setSelectedPoi } = usePoi();

  const handleEditPoi = useCallback(
    (poi) => {
      setSelectedPoi(poi);
      setClickedCoords([parseFloat(poi.longitude), parseFloat(poi.latitude)]);
      setShowPoiModal(true);
    },
    [setSelectedPoi, setClickedCoords, setShowPoiModal]
  );

  const displayPois = useCallback(
    (pois) => {
      if (!map.current) return;
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
          handleEditPoi(poiData);
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
    },
    [handleEditPoi]
  );

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
      setSelectedPoi(null);
      setClickedCoords([e.lngLat.lng, e.lngLat.lat]);
      setShowPoiModal(true);
    });
  }, [setShowPoiModal, setClickedCoords, setSelectedPoi]);

  useEffect(() => {
    if (map.current) {
      displayPois(pois);
    }
  }, [pois, displayPois]);

  return (
    <>
      <div ref={mapContainer} className='map-container' />
      <CreatePoiModal />
      <DeletePoiModal />
    </>
  );
}

export default Map;
