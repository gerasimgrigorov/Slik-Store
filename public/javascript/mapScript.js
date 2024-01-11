mapboxgl.accessToken = 'pk.eyJ1IjoiZ2Vyb2FybWFuaSIsImEiOiJjbHBneng3cmQwNDUzMnFwMGEyanFnN2o2In0.6KhAJ6eTWlXQyjGFNBVlvQ';
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: [25.50, 42.77], // starting position [lng, lat]
        zoom: 6, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());


map.on('load', () => {
    // Add an image to use as a custom marker
    map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker', image);
            // Add a GeoJSON source with 2 points
            map.addSource('points', {
                'type': 'geojson',
                'data': {
                'type': 'FeatureCollection',
                'features': [
                    {
                        // feature for Mapbox DC
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [ 27.8899, 43.2202]
                        },
                        'properties': {
                            'title': 'Mall Varna',
                            'description': 'Blvd. "Vladislav Varnenchik" 186, Varna'
                        }
                    },
                    {
                        // feature for Mapbox SF
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [23.3149,  42.6577]
                        },
                        'properties': {
                            'title': 'Paradice Center',
                            'description': 'Blvd. "Cherni vrah" 100, Sofia'
                        }
                    },
                    {
                        // feature for Mapbox SF
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [24.7817, 42.1448]
                        }, 
                        'properties': {
                            'title': 'Plaza Mall',
                            'description': '3, Dr. Georgi Stranski Str, Plovdiv'
                        }
                    }
                    ]
                }
            });
            
            map.addLayer({
                'id': 'points',
                'type': 'symbol',
                'source': 'points',
                'layout': {
                    'icon-image': 'custom-marker'
                }
            });
        }
    );
});


map.on('click', (event) => {
    const features = map.queryRenderedFeatures(event.point);
    if (!features.length) {
        return;
    }

    const feature = features[0];
    const properties = feature.properties;

    // Check if the feature has the expected properties
    if (!properties || !properties.title || !properties.description) {
        return;
    }

    const popup = new mapboxgl.Popup({ offset: [0, -15] })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(
            `<h4 style="text-align: center; font-size: 18px; font-weight: 600; margin-bottom: 5px;">${properties.title}</h4>
            <p style="margin-bottom: 5px;">Address: ${properties.description}</p>`
        )
        .addTo(map);
});

