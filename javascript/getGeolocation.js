export  default async ()=>{
  return  new Promise(resolve=>{
    let result  = null;

    if(navigator.geolocation){
      function  succuess(pos){
        let lat = pos.coords.latitude;
        let long = pos.coords.longitude;
        
        result  = {
          success:true,
          coords:{
            lat:lat,
            lat:long
          }
        }

        resolve(result);
      }
  
      function  error(){
        result = {
          success:false,
          coords:{
            lat:null,
            long:null
          }
        };

        resolve(result);
      }
  
      navigator.geolocation.getCurrentPosition(succuess,error);
    } else  {
      resolve(result);
    }
  });
}