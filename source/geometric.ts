const resultXyz = { x: 0, y: 0, z: 0 };
export function getCentroid(
    coordinates: readonly { lat: number; lng: number }[],
    result?: LatLng
) {
    if (coordinates.length === 0) return initializeLatLng(result, NaN, NaN);

    // 緯度経度を 3D デカルト座標に変換して平均を計算
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    for (let i = 0; i < coordinates.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const c = coordinates[i]!;
        latLngToCartesian(c.lat, c.lng, resultXyz);
        sumX += resultXyz.x;
        sumY += resultXyz.y;
        sumZ += resultXyz.z;
    }
    // 平均した 3D 座標を緯度経度に戻す
    return cartesianToLatLng(
        sumX / coordinates.length,
        sumY / coordinates.length,
        sumZ / coordinates.length,
        result
    );
}

function latLngToCartesian(
    lat: number,
    lng: number,
    result: { x: number; y: number; z: number }
) {
    // 地球の半径 ( km )
    const R = 6371;

    const latRadian = (lat * Math.PI) / 180;
    const lngRadian = (lng * Math.PI) / 180;

    const x = R * Math.cos(latRadian) * Math.cos(lngRadian);
    const y = R * Math.cos(latRadian) * Math.sin(lngRadian);
    const z = R * Math.sin(latRadian);

    result.x = x;
    result.y = y;
    result.z = z;
}

interface LatLng {
    lat: number;
    lng: number;
}
function initializeLatLng(place: LatLng | undefined, lat: number, lng: number) {
    if (!place) {
        return { lat, lng };
    }
    place.lat = lat;
    place.lng = lng;
    return place;
}
function cartesianToLatLng(x: number, y: number, z: number, result?: LatLng) {
    const latRadian = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lngRadian = Math.atan2(y, x);

    const lat = (latRadian * 180) / Math.PI;
    const lng = (lngRadian * 180) / Math.PI;

    return initializeLatLng(result, lat, lng);
}
export function distance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
) {
    const R = 6371000; // 地球の平均半径 (メートル)
    const φ1 = (lat1 * Math.PI) / 180; // 緯度1をラジアンに変換
    const φ2 = (lat2 * Math.PI) / 180; // 緯度2をラジアンに変換
    const Δφ = ((lat2 - lat1) * Math.PI) / 180; // 緯度の差
    const Δλ = ((lng2 - lng1) * Math.PI) / 180; // 経度の差

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // メートル単位の距離

    return distance;
}
