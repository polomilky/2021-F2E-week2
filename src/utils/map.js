import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});
L.Marker.prototype.options.icon = DefaultIcon;

// 建立地圖
const createMap = (divId, options) => {
    let map = L.map(divId, options)
    return map
}

// 建立地圖function
const createTileLayer = (map, url, options) => {
    let tileLayer = L.tileLayer(url, options)
    tileLayer.addTo(map)
    return tileLayer
}

// 建立mark icon
const createIcon = options => {
    return L.icon(options);
};

// 透過[x, y]添加mark
const createMakerByXY = (map, coordinate, options = {}) => {
    let marker = L.marker(L.latLng(coordinate[0], coordinate[1]), options);
    marker.addTo(map);
    return marker;
};

// 繪製路線
const createPolyLine = (map, geo, options) => {
    let polyLine = L.polyline(geo, options)
    polyLine.addTo(map)
    map.fitBounds(polyLine.getBounds());
    return polyLine
}

export default {
    createMap,
    createTileLayer,
    createPolyLine,
    createIcon,
    createMakerByXY
}