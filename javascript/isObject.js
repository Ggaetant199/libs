export  default (o)=>{
  if(Array.isArray(o)){
    return  false;
  }

  if (typeof  o !=  "object"){
    return  false;
  }

  if(o  ==  null){
    return  false;
  }

  return  true;
}