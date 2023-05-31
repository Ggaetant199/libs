import isArray from "./isArray.js";
import isObject from "./isObject.js";

export default {
  string (val) {
    return typeof val == "string"
  },

  number (val) {
    return typeof val == "number"
  },

  boolean (val) {
    return typeof val == "boolean"
  },

  email (email) {
    return (typeof email == "string" && /^[\w-\.]+@([\w-]+\.)+[\w-]{2,10}$/g.test(email));
  },

  password (password) {
    if (typeof password != "string" || password.length < 8 || password.length > 60) {
      return false;
    }

    if (!/[a-z]+/.test(password)) {
      return false;
    }

    if (!/[A-Z]+/.test(password)) {
      return false;
    }

    if (!/[0-9]+/.test(password)) {
      return false;
    }

    return true;
  },

  tel (tel) {
    return (typeof tel == "string" && /^\+[0-9]{4,60}$/.test(tel));
  },

  slug (slug) {
    return (typeof slug == "string" && /^[0-9a-z-]{2,255}$/.test(slug));
  },

  productRef (ref) {
    return (typeof ref == "string" && /^[0-9a-z-]{2,100}$/.test(ref));
  },

  webSite (webSite) {
    return (typeof webSite == "string" && /^(http|https):\/\/.{4,300}$/.test(webSite));
  },

  userName (userName) {
    return (typeof userName == "string" && /^[0-9a-z_]{2,60}$/.test(userName));
  },

  body (body, matches=[],scrit=true) {
    if(!isArray(matches)){
      return  {boolean:false,  error:"matches is  not array"};
    }

    if(!isObject(body)){
      return  {boolean:false,  error:"body is  not object"};
    }

    let len = matches.length;

    if(scrit){
      let lenBody = Object.keys(body).length;

      if(len>lenBody){
        return  {boolean:false,  error:"matches > body values"};
      } else if(len<lenBody){
        return  {boolean:false,  error:"matches < body values"};
      }
    }
    

    for (let i = 0; i < len; i++) {
      const matche  = matches[i];

      if(!isObject(matche)){
        return  {boolean:false,  error:"matche is  not object"};
      }

      if(!this.string(matche.key)){
        return  {boolean:false,  error:"key is  not string"};
      }

      if(!matche.op){
        return  {boolean:false,  error:"op  is  not define"};
      }

      const val = body[matche.key];

      if(val ==  undefined){
        return  {boolean:false,  error:"val for key:"+  matche.key+ " is  not find in  body"};
      }

      if(typeof matche.op ==  "function"){
        const result = matche.op(val);

        if(!this.boolean(result)){
          return  {boolean:false,  error:"result  of  op  function  is  not boolean for key:"+  matche.key};
        }

        if(!result){
          return  {boolean:false,  error:"result  of  op  function  return false for key:"+  matche.key};
        }
      } else if(typeof matche.op ==  "string"){
        switch (matche.op) {
          case "isString":
            if(!this.string(val)){
              return  {boolean:false,  error:"val is  not string for key:"+  matche.key};
            }
            break;
          case "isNumber":
            if(!this.number(val)){
              return  {boolean:false,  error:"val is  not number for key:"+  matche.key};
            }  
            break;
          case "isEmail":
            if(!this.email(val)){
              return  {boolean:false,  error:"val is  not valide  email for key:"+  matche.key};
            }
            break;
          case "isTel":
            if(!this.tel(val)){
              return  {boolean:false,  error:"val is  not valide tel for key:"+  matche.key};
            }
            break;
          case "isUserName":
            if(!this.userName(val)){
              return  {boolean:false,  error:"val is  not valide  userName  for key:"+  matche.key};
            }
            break;
          case "isPassword":
            if(!this.password(val)){
              return  {boolean:false,  error:"val is  not valide  password for key:"+  matche.key};
            }
            break;
          case "isBoolean":
            if(!this.boolean(val)){
              return  {boolean:false,  error:"val is  not boolean for key:"+  matche.key};
            }    
            break;
          case "isWebSite":
            if(!this.webSite(val)){
              return  {boolean:false,  error:"val is  not valide  webSite for key:"+  matche.key};
            }  
            break;
          case "isSlug":
            if(!this.slug(val)){
              return  {boolean:false,  error:"val is  not valide  slug for key:"+  matche.key};
            }    
            break;
          default:
            return  {boolean:false,  error:"op  is  not corespondante to  matche  val for key:"+  matche.key};
        }
      } else {
        return  {boolean:false,  error:"op  is  not corespondante to  matche  val for key:"+  matche.key};
      }
    }

    return  {boolean:true,  error:null};
  }
}