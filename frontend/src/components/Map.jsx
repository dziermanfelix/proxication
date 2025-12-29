import { useEffect, useRef, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { usePoi } from '../contexts/PoiContext';
import './Map.css';
import SearchBox from './SearchBox';
import CreatePoiModal from './CreatePoiModal';
import DeletePoiModal from './DeletePoiModal';

function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const lodgingMarkersRef = useRef([]);
  const [mapInstance, setMapInstance] = useState(null);
  const [lodgingPlaces, setLodgingPlaces] = useState([]);

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

  const displayLodgingPlaces = useCallback(
    (places) => {
      if (!map.current) return;

      // Remove existing lodging markers
      lodgingMarkersRef.current.forEach((marker) => marker.remove());
      lodgingMarkersRef.current = [];

      if (places.length === 0) return;

      places.forEach((place) => {
        const [lng, lat] = place.center;
        const placeName = place.text || place.place_name || 'Unknown';

        const markerElement = document.createElement('div');
        markerElement.className = 'lodging-marker';
        markerElement.title = placeName;

        const popupContent = document.createElement('div');
        popupContent.className = 'lodging-popup';

        const title = document.createElement('h3');
        title.className = 'lodging-popup-title';
        title.textContent = placeName;
        popupContent.appendChild(title);

        if (place.properties?.address) {
          const address = document.createElement('p');
          address.className = 'lodging-popup-address';
          address.textContent = place.properties.address;
          popupContent.appendChild(address);
        }

        if (place.properties?.category) {
          const category = document.createElement('p');
          category.className = 'lodging-popup-category';
          category.textContent = place.properties.category;
          popupContent.appendChild(category);
        }

        const createBtn = document.createElement('button');
        createBtn.className = 'lodging-create-poi-btn';
        createBtn.textContent = 'Create POI from this location';
        createBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedPoi(null);
          setClickedCoords([lng, lat]);
          setShowPoiModal(true);
        });
        popupContent.appendChild(createBtn);

        const marker = new mapboxgl.Marker({
          element: markerElement,
          anchor: 'bottom',
        })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent))
          .addTo(map.current);

        lodgingMarkersRef.current.push(marker);
      });
    },
    [setShowPoiModal, setClickedCoords, setSelectedPoi]
  );

  const handleLodgingPlacesChange = useCallback((places) => {
    setLodgingPlaces(places);
  }, []);

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

    // Set map instance in state so SearchBox can render
    setMapInstance(map.current);
  }, [setShowPoiModal, setClickedCoords, setSelectedPoi]);

  useEffect(() => {
    if (map.current) {
      displayPois(pois);
    }
  }, [pois, displayPois]);

  useEffect(() => {
    if (map.current && lodgingPlaces.length > 0) {
      displayLodgingPlaces(lodgingPlaces);
    } else if (map.current && lodgingPlaces.length === 0) {
      // Clear lodging markers when list is empty
      lodgingMarkersRef.current.forEach((marker) => marker.remove());
      lodgingMarkersRef.current = [];
    }
  }, [lodgingPlaces, displayLodgingPlaces]);

  return (
    <>
      <div ref={mapContainer} className='map-container' />
      {mapInstance && <SearchBox map={mapInstance} onLodgingPlacesChange={handleLodgingPlacesChange} />}
      <CreatePoiModal />
      <DeletePoiModal />
    </>
  );
}

export default Map;
