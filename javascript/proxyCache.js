import cache from './CacheStorage.js'

const providers = {
  "cache1":new  cache("indexedDB",{name:"user",version:1}),
  "cache2":new  cache("localStorage",{name:"product",version:1}),
  "cache3":new  cache("sessionStorage",{name:"review",version:1}),
};

async function  proxyCache  ({provider="cache1",key,expire=60},callback){
  if(typeof key != "string" || typeof callback != "function" || typeof expire != "number") {
    throw "error";
  }
  
  let cache = null;

  cache = providers[provider];

  if(cache){
    let data = await cache.get(key);

    if(data){
      return  data;
    }

    data  = await callback();
    
    cache.set(key,data,expire);

    return  data;
  } else  {
    return  await callback();
  }
}

export  default proxyCache;