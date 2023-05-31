import isArray from "./isArray.js"

function  toRad(degrees){
  return  degrees * (Math.PI / 180);
}

//  formule de  haversine
export  default (pointA,  pointB)=>{
  if(isArray(pointA)  &&  isArray(pointB) &&  pointA.length == 2  &&  pointB.length == 2){
    const lat1  = pointA[0];
    const long1  = pointA[1];
    const lat2  = pointB[0];
    const long2  = pointB[1];

    const earthRadius = 6371//  rayon de  la  terre en  kilomère
    const dLat  = toRad(lat2-lat1);
    const dLong  = toRad(long2-long1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) * Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a),  Math.sqrt(1 - a));
    const distance  = earthRadius * c;

    return  distance;
  }

  return  null;
}