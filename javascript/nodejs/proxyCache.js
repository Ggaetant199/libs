import CM from "./cacheInstance.js";
import CMR from "./cacheInstanceResponse.js";

const providers = {
  "cache_memory":CM,
  "cache_memory_response":CMR
};

export default async ({key,expire=0,provider="cache_memory_response"},callback) => {
  if(typeof key != "string" || typeof callback != "function" || typeof expire != "number") {
    throw "error";
  }

  let cache = providers[provider];

  if(!cache){
    throw "cache provider not found!";
  }

  let data = await cache.get(key);
  
  if(data){
    return data;
  }

  try {
    data = await callback();
    
    await cache.set(key,data,expire);

    return data;
  } catch (error) {
    throw error;
  }
}