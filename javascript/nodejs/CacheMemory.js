import {createClient} from "redis";

class LocalCacheMemory{
  constructor(options) {
    this.options=options;

    this.intervalId;

    this._init();

    this.runCheck();
  }

  _init(){
    this.maxItems  = this.options.maxItems||1000;
    this.defaultExpire  = this.options.defaultExpire||60*30;
    this.checkperiod  = this.options.checkperiod||3600;

    this.items={};
    this.countItems=0;
    this.vsize=0;
    this.lockWrite={};
  }

  setCheckPeriod(val){
    if(typeof val != "number" &&  val > 0){
      return;
    }
    this.checkperiod = val;
  }

  setMaxItems(val){
    if(typeof val != "number" &&  val > 0){
      return;
    }
    this.maxItems = val;
  }

  setDefaultExpire(val){
    if(typeof val != "number" &&  val > 0){
      return;
    }
    this.defaultExpire = val;
  }

  async set(key,val,expire=null){
    if(typeof key!="string"){
      return false;
    }

    try {
      await this._getLock(key);
    
      if(typeof expire == "number" && expire > 0){
        expire = Date.now()+expire*1000;
      } else {
        expire = Date.now()+this.defaultExpire*1000;
      }
  
      if(this.exist(key)){
        this.items[key].data = val;
        return true;
      }

      if(this.maxItems > 0 && this.countItems >= this.maxItems){
        await this.delFirstItem();
      }
  
      this.items[key] = {data:val,expire:expire};
      this.countItems = this.countItems+1;

      return  true;
    } catch (error) {
      return  false;  
    } finally {
      this._releaseLock(key);
    }
  }

  async setIfExist (key,callback) {
    let data = await this.get(key);

    if(data){
      data  = callback(data);

      if(data != undefined){
        await this.set(key,data);
      }
    }
  }

  async get(key){
    if(typeof key!="string"){
      return null;
    }
    
    try {
      await this._getLock(key);

      let val = this.items[key];

      if(!val){
        return null;
      }
  
      if(val.expire && val.expire < Date.now()){
        this.del(key);
        return null;
      }
      
      return val.data;
    } catch (error) {
      return  null;
    } finally {
      this._releaseLock(key);
    }
  }

  exist(key){
    if(this.items[key]){
      return  true;
    }
    return false;
  }
  
  async del(key){
    try {
      await this._getLock(key);

      if(!this.exist(key)){
        return false;
      }
  
      delete this.items[key];
  
      this.countItems = this.countItems-1;
  
      return true; 
    } catch (error) {
      return  false;
    } finally {
      this._releaseLock(key);
    }
  }

  async delFirstItem () {
    let keys = [];
    let len = 0;

    keys = await this.getkeys();
    len = keys.length;

    if(len>0){
      return await this.del(keys[0]);
    }

    return false;
  }

  async getkeys(){
    try {
      await this._getLock("*");

      return  Object.keys(this.items);
    } catch (error) {
      return [];
    }finally{
      this._releaseLock("*"); 
    }
  }

  async getkeysLength(){
    return (await this.getkeys()).length;
  }

  async flush(){
    try {
      await this._getLock("*");

      this._init();

      return  true;
    } catch (error) {
      return  false;
    } finally {
      this._releaseLock("*");
    }
  }

  runCheck () {
    if(this.checkperiod>0){
      this._check();
    }
  }


  _check(){ 
    this.intervalId = setInterval(async ()=>{
      let keys = [];
      let len = 0;

      try {
        await this._getLock("*");

        keys = Object.keys(this.items);
        len = keys.length;
  
      } catch (error) {
        return;
      }finally{
        this._releaseLock("*"); 
      }

      for (let i = 0; i < len; i++) {
        await this.get(keys[i]);
      }
    }, this.checkperiod*1000);
  }

  async _waitWriteIsNotLock (key) {
    if(this.lockWrite[key] || this.lockWrite["*"]){
      await new Promise(resolve=>{
        const id  = setInterval(() => {
          if(!this.lockWrite[key] && !this.lockWrite["*"]){
            clearInterval(id)
            resolve()
          }
        }, 10);
      })
    }

    return true;
  }

  async close () {
    await this.flush();

    if(this.intervalId != undefined)  {
      clearInterval(this.intervalId);
    }
  }

  async _getLock (key) {
    await this._waitWriteIsNotLock(key);
    this.lockWrite[key] = true;
    return;
  }

  async _releaseLock (key) {
    delete  this.lockWrite[key];
    return;
  }

  log(){
    console.log(this);
  }

  async getStats(){
    try {
      await this._getLock("*");

      let keys = Object.keys(this.items);

      return  {
        keys:keys.length,
        ksize:JSON.stringify(keys).length,
        vsize:JSON.stringify(this.items).length,
      }
    } catch (error) {
      return null;
    }finally{
      this._releaseLock("*"); 
    }
  }
}

class RedisProvider{
  constructor(options){
    this.client = null;

    this._init(options);
  }

  async _init(options) {
    this.defaultExpire  = options.defaultExpire||60*30;

    let url = options.url||"";
    let db = options.db||1;

    this.client = createClient({
      url,
      database:db
    });

    try {
      await this.client.connect();
    } catch (error) {
      console.log(error);
      this.client=null;      
    }
  }

  async get(key) {
    if(!this._clientOk()){
      return  null;
    }

    try {
      let res = await this.client.get(key);
     
      if(res){
        return  JSON.parse(res);
      }

      return  null;
    } catch (error) {
      return  null;
    }
  }

  async set(key,val,expire=null){
    if(!this._clientOk()){
      return  false;
    }

    try {
      val=JSON.stringify(val);

      await this.client.set(key, val);

      if(!(expire  &&  expire  > 0)){
        expire = this.defaultExpire;
      }

      await  this.client.expire(key,expire);

      return true;
    } catch (error) {
      return  false;
    }
  }

  async del(key){
    if(!this._clientOk()){
      return  false;
    }

    try {
      await this.client.del(key);

      return  true;
    } catch (error) {
      return  false;
    }
  }

  async flush(){
    try {
      await this.client.flushAll();
    } catch (error) {
      
    }
  }

  _clientOk(){
    if(this.client  && this.client.isOpen){
      return  true;
    }
    

    return  false;
  }
}

class CacheMemory{
  constructor(provider, options) {
    switch (provider) {
      case "redis":
        return  new RedisProvider(options);
      default:
        return  new LocalCacheMemory(options);
    }
  }
}

export default CacheMemory;