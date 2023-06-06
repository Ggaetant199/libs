const utils  = {
  localStorage:{
    getItem(key){
      return  localStorage.getItem(key);
    },
    setItem(key,value){
      localStorage.setItem(key,value);
    },
    clear(){
      localStorage.clear();
    },
    removeItem(key){
      localStorage.removeItem(key);
    }
  },

  sessionStorage:{
    getItem(key){
      return  sessionStorage.getItem(key);
    },
    setItem(key,value){
      sessionStorage.setItem(key,value);
    },
    clear(){
      sessionStorage.clear();
    },
    removeItem(key){
      sessionStorage.removeItem(key);
    }
  },

  json:{
    encode(data){
      return  JSON.stringify(data);
    },
    decode(data){
      return  JSON.parse(data);
    }
  }
}

class CacheSessionStorage {
  constructor({name="cache",version=1,maxItems=25,defaultExpire=60*5,expireCacheDB=3600*24*2}){
    this.name="cache_"+name;
    this.version=version;
    this.countItems=0;
    this.maxItems=maxItems;
    this.defaultExpire=defaultExpire;
    this.expireCacheDB=expireCacheDB;
    this.isOpen=false;
    this.cache={
    };

    this._init()
  }

  async get(key) {
    if(!this.isOpen){
      return  null;
    }

    if(!this.cache[key]){
      return null;
    }

    if(this.cache[key].expire < Date.now()){
      this.del(key);
      return null; 
    }

    return this.cache[key].data;
  }

  async set(key, val, expire=null){
    if(!this.isOpen){
      return  false;
    }

    if(!(typeof expire == "number" && expire>0)){
      expire = this.defaultExpire;
    }

    if(this.countItems.length >= this.maxItems){
      if(!await this.delFisrt()){
        return false;
      }
    }

    this.cache[key]={key, data:val, expire:Date.now() + expire * 1000};

    this._save();

    return true;
  }

  async del(key){
    if(!this.isOpen){
      return  false;
    }

    if(!this.cache[key]){
      return true;
    }

    delete this.cache[key];

    this._save();

    return true;
  }

  async delFisrt(){
    if(!this.isOpen){
      return  false;
    }

    const keys  = Object.keys(this.cache);

    if(keys.length > 0){
      delete this.cache[keys[0]];

      this._save();

      return true;
    }

    return true;
  }

  async flush(){
    if(!this.isOpen){
      return;
    }

    this.cache={};
    this._save();
  }

  _init(){
    if(!this._scanDB()){
      return;
    }

    let key = this._getKeyNameCache();

    if(sessionStorage){
      let cache = sessionStorage.getItem(key);

      if(cache){
        this.cache = this._decode(cache);

      } else {
        this._save();
      }
    } else  {
      return;
    }

    this.isOpen = true;
  }

  _scanDB(){
    let keyDateSet  = "sessionStorage_"+this.name+"_dateSet";
    let keyVersion  = "sessionStorage_"+this.name+"_version";

    let dateSet  =  utils.localStorage.getItem(keyDateSet);
    let version  = utils.localStorage.getItem(keyVersion);

    const deleteDB = () => {
      try {
        utils.localStorage.removeItem(this._getKeyNameCache());
        utils.localStorage.setItem(keyDateSet, Date.now()+this.expireCacheDB*1000);
        utils.localStorage.setItem(keyVersion, this.version);  
        return  true;
      } catch (error) {
        return  false;
      }
    }

    if(dateSet  &&  version){
      if(version!=this.version  ||  dateSet < Date.now()){
        return deleteDB();
      }
    } else  {
      return deleteDB();
    }

    return  true;
  }

  _save(){
    let key = this._getKeyNameCache();
    
    this._countItems();

    if(sessionStorage){
      try{
        sessionStorage.setItem(key,this._encode(this.cache));
      }catch(error){
        console.log(error);
      }
    }
  }

  _getKeys(){
    return  Object.keys(this.cache);
  }

  _getLength(){
    return  this._getKeys().length;
  }

  _countItems(){
    this.countItems = this._getLength();
  }

  _getKeyNameCache(){
    return  this.name;
  }

  _encode(data){
    return utils.json.encode(data);
  }

  _decode(data){
    return  utils.json.decode(data);
  }
}

class CacheLocalStorage {
  constructor({name="cache",version=1,maxItems=25,defaultExpire=60*5,expireCacheDB=3600*24*7}){
    this.name="cache_"+name;
    this.version=version;
    this.countItems=0;
    this.maxItems=maxItems;
    this.defaultExpire=defaultExpire;
    this.expireCacheDB=expireCacheDB;
    this.isOpen=false;
    this.cache={
    };

    this._init()
  }

  async get(key) {
    if(!this.isOpen){
      return  null;
    }

    if(!this.cache[key]){
      return null;
    }

    if(this.cache[key].expire < Date.now()){
      this.del(key);
      return null; 
    }

    return this.cache[key].data;
  }

  async set(key, val, expire=null){
    if(!this.isOpen){
      return  false;
    }

    if(!(typeof expire == "number" && expire>0)){
      expire = this.defaultExpire;
    }

    if(this.countItems.length >= this.maxItems){
      if(!await this.delFisrt()){
        return false;
      }
    }

    this.cache[key]={key, data:val, expire:Date.now() + expire * 1000};

    this._save();

    return true;
  }

  async del(key){
    if(!this.isOpen){
      return  false;
    }

    if(!this.cache[key]){
      return true;
    }

    delete this.cache[key];

    this._save();

    return true;
  }

  async delFisrt(){
    if(!this.isOpen){
      return  false;
    }

    const keys  = Object.keys(this.cache);

    if(keys.length > 0){
      delete this.cache[keys[0]];

      this._save();

      return true;
    }

    return true;
  }

  async flush(){
    if(!this.isOpen){
      return;
    }

    this.cache={};
    this._save();
  }

  _init(){
    if(!this._scanDB()){
      return;
    }
    
    let key = this._getKeyNameCache();

    if(localStorage){
      let cache = localStorage.getItem(key);

      if(cache){
        this.cache = this._decode(cache);

      } else {
        this._save();
      }
    }else{
      return;
    }

    this.isOpen = true;
  }

  _scanDB(){
    let keyDateSet  = "localStorage_"+this.name+"_dateSet";
    let keyVersion  = "localStorage_"+this.name+"_version";

    let dateSet  =  utils.localStorage.getItem(keyDateSet);
    let version  = utils.localStorage.getItem(keyVersion);

    const deleteDB = () => {
      try {
        utils.localStorage.removeItem(this._getKeyNameCache());
        utils.localStorage.setItem(keyDateSet, Date.now()+this.expireCacheDB*1000);
        utils.localStorage.setItem(keyVersion, this.version);  
        return  true;
      } catch (error) {
        return  false;
      }
    }

    if(dateSet  &&  version){
      if(version!=this.version  ||  dateSet < Date.now()){
        return deleteDB();
      }
    } else  {
      return deleteDB();
    }

    return  true;
  }

  _save(){
    let key = this._getKeyNameCache();
    
    this._countItems();

    if(localStorage){
      try{
        localStorage.setItem(key,this._encode(this.cache));
      }catch(error){
        console.log(error);
      }
    }
  }

  _getKeys(){
    return  Object.keys(this.cache);
  }

  _getLength(){
    return  this._getKeys().length;
  }

  _countItems(){
    this.countItems = this._getLength();
  }

  _getKeyNameCache(){
    return  this.name;
  }

  _encode(data){
    return utils.json.encode(data);
  }

  _decode(data){
    return  utils.json.decode(data);
  }
}

class CacheIndexedDB{
  constructor({name="default",version=1,maxItems=1000,defaultExpire=60*5,expireCacheDB=3600*2*7}){
    this.dbName="cache_"+name;
    this.version=version;
    this.storeName=this.dbName+"_store"+version;
    this.maxItems=maxItems;
    this.defaultExpire=defaultExpire;
    this.expireCacheDB=expireCacheDB;
    this.isOpen=false;
    this.isNotOpen=false;

    this._openDB();
  }

  async _openDB(){
    let indexedDB = window.indexedDB  ||  window.mozIndexedDB ||  windeow.webkitIndexedDB ||  window.msIndexedDB;

    if(!await this._scanDB()){
      this.isNotOpen=true;
      return;
    }

    const request = indexedDB.open(this.dbName,1);

    request.onerror=(event)=>{
      console.log("failled  to  open  database",  event.target.error);
      this.isNotOpen=true;
    };

    request.onsuccess=(event)=>{
      this.db = event.target.result;
      this.isOpen=true;
    };

    request.onupgradeneeded=(event)=>{
      const db  = event.target.result;
      db.createObjectStore(this.storeName,{keyPath:"key"});
    }
  }

  async _scanDB(){
    let keyDateSet  = "indexedDB_"+this.dbName+"_dateSet";
    let keyVersion  = "indexedDB_"+this.dbName+"_version";

    let dateSet  =  utils.localStorage.getItem(keyDateSet);
    let version  = utils.localStorage.getItem(keyVersion);

    const deleteDB = () => {
      return new Promise(resolve=>{
        const deleteDBRequest = indexedDB.deleteDatabase(this.dbName);
  
        deleteDBRequest.onerror=(error)=>{
          console.log("failled  to  delete  dataBase",error.target.error);
          resolve(false);
        }
  
        deleteDBRequest.onsuccess=()=>{
          utils.localStorage.setItem(keyDateSet, Date.now()+this.expireCacheDB*1000);
          utils.localStorage.setItem(keyVersion, this.version);
          
          resolve(true);
        }
      });
    }

    if(dateSet  &&  version){
      if(version!=this.version  ||  dateSet < Date.now()){
        return  await deleteDB();
      }
    } else  {
      return await deleteDB();
    }

    return  true;
  }

  async set (key,value,expire=0){
    if(!(await this._dbIsOpen())){
      return false;
    }
    
    const count = await this.count();
    
    if(count<-1){
      return  false;
    }

    if(count  >= this.maxItems){
      if(!await this.delFisrt()){
        return  false;
      }
    }

    return  await new Promise((resolve)=>{      
      try {
        const objectStore = this._getObjectStore("readwrite");
        
        const exp = (expire>0)?expire:this.defaultExpire;
        expire  = Date.now()  + exp*1000;

        const putRequest  = objectStore.put({key,value,expire});
        
        putRequest.onerror  = (event)=>{
          console.log("failled  to  set value", event.target.error);
          resolve(false);
        }

        putRequest.onsuccess  = ()=>{
          resolve(true);
        }
      } catch (error) {
        console.log(error);
        resolve(false);
      } 
    }); 
  }

  async get (key) {
    if(!(await this._dbIsOpen())){
      return null;
    }

    return  await new Promise (resolve=>{
      try {
        const objectStore = this._getObjectStore("readonly");
        const getRequest  = objectStore.get(key);
                
        getRequest.onerror=(event)=>{
          console.log("failled  to  get value",event.target.error);
          resolve(null);
        };
  
        getRequest.onsuccess=(event)=>{
          const cacheData = event.target.result;

          if(cacheData  &&  cacheData.expire  > Date.now()){
            resolve(cacheData.value);
          } else  {
            this.del(key);
            resolve(null);
          }
        };
      } catch (error) {
        console.log(error);
        resolve(null);
      }
    });
  }

  async del(key)  {
    if(!(await this._dbIsOpen())){
      return false;
    }

    return  await new Promise (resolve=>{
      try {
        const objectStore = this._getObjectStore("readwrite");
        const deleteRequest = objectStore.delete(key);
  
        deleteRequest.onerror = (event)=>{
          console.log("failled  to  delete  value",event.target.error);
          resolve(false);
        }
  
        deleteRequest.onsuccess=()=>{
          resolve(true);
        };
      } catch (error) {
        console.log(error);
        resolve(false);
      }
    });
  }

  async flush() {
    if(!(await this._dbIsOpen())){
      return false;
    }

    return  await new Promise(resolve=>{
      try {
        const objectStore = this._getObjectStore("readwrite");
        const clearRequest  = objectStore.clear();  

        clearRequest.onsuccess=()=>{
          resolve(true);
        }

        clearRequest.onerror=()=>{
          resolve(false);
        }
      } catch (error) {
        console.log(error);  
        resolve(false);
      }
    })
  }

  async delFisrt(){
    if(!(await this._dbIsOpen())){
      return false;
    }

    return  await new Promise (resolve=>{
      try {
        const objectStore = this._getObjectStore("readwrite");
        const deleteFirstRequest = objectStore.openCursor();
  
        deleteFirstRequest.onerror = (event)=>{
          console.log("failled  to  delete  value",event.target.error);
          resolve(false);
        }
  
        deleteFirstRequest.onsuccess=(event)=>{
          let cursor  = event.target.result;
          this.del(cursor.key);
        };
      } catch (error) {
        console.log(error);
        resolve(false);
      }
    });
  }

  async count() {
    if(!(await this._dbIsOpen())){
      return false;
    }

    return  await new Promise(resolve=>{
      try {
        const objectStore = this._getObjectStore("readonly");
        const countRequest  = objectStore.count();  

        countRequest.onsuccess=(event)=>{
          const count = event.target.result;
          resolve(count);
        }

        countRequest.onerror=()=>{
          resolve(-1);
        }
      } catch (error) {
        console.log(error);  
        resolve(-1);
      }
    })
  }

  async _dbIsOpen(){
    return  await new Promise(resolve=>{
      const id  = setInterval(() => {
        if(this.isOpen){
          resolve(true);

          clearInterval(id);
          return;
        }

        if(this.isNotOpen){
          resolve(false);

          clearInterval(id);
          return;
        }
      }, 10);
    });
  }

  _getObjectStore(mode){
    const transaction = this.db.transaction([this.storeName],mode);
    return  transaction.objectStore(this.storeName); 
  }
}

function  cacheStorage(provider, options){
  switch (provider) {
    case "indexedDB":
      return  new  CacheIndexedDB((options?.indexedDBOptions)?options.indexedDBOptions:options);
    case "localStorage":
      return  new  CacheLocalStorage((options?.localStorageOptions)?options.localStorageOptions:options);
    case "sessionStorage":
      return new  CacheSessionStorage((options?.sessionStorageOptions)?options.sesssionStorageOptions:options);
    default :
    return new  CacheSessionStorage((options?.sessionStorageOptions)?options.sesssionStorageOptions:options);
  }
}

export  default cacheStorage;

export {
  CacheLocalStorage,CacheSessionStorage,CacheIndexedDB
}