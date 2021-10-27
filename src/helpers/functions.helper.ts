const fs = require('fs');

const rmArray = function(arr: any, attr: any, value: any){
  var i = arr.length;
  while(i--){
     if( arr[i] 
         && arr[i].hasOwnProperty(attr) 
         && (arguments.length > 2 && arr[i][attr] === value ) ){ 

         arr.splice(i,1);

     }
  }
  return arr;
}

 const removeDuplicates = (a: any, b: any) => {
  b = b.filter( function( item ) {
      for( var i=0, len=a.length; i<len; i++ ){
          if( a[i]._id === item._id ) {
              return false;
          }
      }
      return true;
  });
  return b
}

 const capitalizeFirstLetter = (string: string) => {
   if(string){
     return string.charAt(0).toUpperCase() + string.slice(1);
   }else{
     return ""
   }
}

const randomIntFromInterval = (min: any, max: any) => { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

 const getValueByKey = (key: string, data: any) => {
  var i, len = data.length;
  
  for (i = 0; i < len; i++) {
      if (data[i] && data[i].hasOwnProperty(key)) {
          return data[i][key];
      }
  }
  return -1;
}

 const addDate = (value: any) => {
  var d = new Date();
  d.setDate(d.getDate()+value);
  return d
}

 const subtractDate = (value: any) => {
  var d: any = new Date();
  d.setDate(d.getDate()-parseInt(value),10);
  return d
}


 const sortObject = (unordered: any)=>{
  const ordered = {};
  Object.keys(unordered).sort().forEach(function(key) {
    ordered[key] = unordered[key];
  });
  return ordered
}

 const combineArrayOfObjects = (array: any)=>{
  let object = array.reduce(
    (obj, item) => Object.assign(obj, { [item.media_name]: item.count }), {});
    console.log(object);
    return object
}

 const subtractTwoDates = (start, end)=>{
  const date1: any = new Date(start);
  const date2: any = new Date(end);
  const diffTime = Math.abs(date2 - date1);
  const diffDays = diffTime / (1000 * 60 ); 

  return diffDays.toFixed(1)
}

const calculateTime = (filter, date) => {
  var datePast: any = new Date(date);
  var dateNow: any = new Date();

  var seconds = Math.floor(((dateNow) - datePast) / 1000);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(minutes / 60);
  var days = Math.floor(hours / 24);
  var weeks = Math.floor(days / 7);
  var years = Math.floor(days / 365);

  if(filter === "month"){
    if(days < 30){
      return true
    }else{
      return false
    }
  }else if(filter === "week"){
    if(days < 7){
      return true
    }else{
      return false
    }
  }

}

const checkRouteConflict =(username: string) =>{
  let routes = [ "hellaviews", "feed", "search", "purchase", "profile", "payment", "chat", "post", "notification", "settings", "admin", "live", "stories", "signup", "login", "reset_password", "forget_password", "confirm_email", "cashout" ]
  let isSlashExist = username.includes("/")
  if(routes.indexOf(username) === -1 && !isSlashExist){
    return false
  }else{
    return true
  }
}

const checkURL = (url: string) => {
  if (url.match(/\.(jpeg|jpg|gif|png|JPEG|JPG|GIF|PNG)$/) != null) {
    return "image";
  } else if (url.match(/\.(mp4|MP4|mov|MOV)$/) != null) {
    return "video";
  }
}

const arrayDiff =(a1: any, a2: any) =>{

  var a: any[] = [], diff: any[] = [];

  for (var i = 0; i < a1.length; i++) {
      a[a1[i]] = true;
  }

  for (var i = 0; i < a2.length; i++) {
      if (a[a2[i]]) {
          delete a[a2[i]];
      } else {
          a[a2[i]] = true;
      }
  }

  for (var k in a) {
      diff.push(k);
  }

  return diff;
}

const getFromBetween = {
  results:[],
  string:"",
  getFromBetween:function (sub1: any,sub2: any) {
      if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
      var SP = this.string.indexOf(sub1)+sub1.length;
      var string1 = this.string.substr(0,SP);
      var string2 = this.string.substr(SP);
      var TP = string1.length + string2.indexOf(sub2);
      return this.string.substring(SP,TP);
  },
  removeFromBetween:function (sub1: any,sub2: any) {
      if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
      var removal = sub1+this.getFromBetween(sub1,sub2)+sub2;
      this.string = this.string.replace(removal,"");
  },
  getAllResults:function (sub1: any,sub2: any) {
      // first check to see if we do have both substrings
      if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return;

      // find one result
      var result = this.getFromBetween(sub1,sub2);
      // push it to the results array
      this.results.push(result);
      // remove the most recently found one from the string
      this.removeFromBetween(sub1,sub2);

      // if there's more substrings
      if(this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
          this.getAllResults(sub1,sub2);
      }
      else return;
  },
  get:function (string: string,sub1: any,sub2: any) {
      this.results = [];
      this.string = string;
      this.getAllResults(sub1,sub2);
      return this.results;
  }
};

const strParse = (json: any) => {
  json = JSON.stringify(json)
  json = JSON.parse(json)
  return json
}

function deleteFiles(files: any, callback: any){
  var i: number = files.length;
  files.forEach(function(filepath){
    fs.unlink(filepath, function(err) {
      i--;
      if (err) {
        callback(err);
        return;
      } else if (i <= 0) {
        callback(null);
      }
    });
  });
}

const calcSubscriptionInterval = (type: string) => {
  if(type === "1-month"){
    return 30
  }else if(type === "3-month"){
    return 90
  }else if(type === "6-month"){
    return 180
  }else if(type === "1-year"){
    return 365
  }
}

const calculateTimeReturnValue = (date: any) => {
  var datePast: any = new Date(date);
  var dateNow: any = new Date();

  var seconds = Math.floor(((dateNow) - datePast) / 1000);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(minutes / 60);
  var days = Math.floor(hours / 24);
  var years = Math.floor(days / 365);

  // hours = hours-(days*24);
  // minutes = minutes-(days*24*60)-(hours*60);
  // seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
  return {
    seconds,
    minutes,
    hours,
    days,
    years
  }
}

const stripDate = (string: string) => (([year, day, month]) => ({ day, month, year }))(string.split('-'));

const arrayToText = (array: any) => {
  let str: string = "";
  array.map((value, index) => {
    if (index === array.length - 1) {
      str += value
    } else {
      str += value + ", "
    }
  })
  return str
}

const mergeNotifications = (notifications: any) => {
  const mergedNotification = []
  notifications.map((notify) => {
    const notification = notify
    if (notification.body) {
      const str = notification.body;
      const result = getFromBetween.get(str, "{{", "}}")
      if (result.length) {
        result.map((mf) => {
          notification.body = notification.body.replace(`{{${mf}}}`, Array.isArray(notification.merge_fields[mf]) ? arrayToText(notification.merge_fields[mf]) : notification.merge_fields[mf]);
        })
      }
    }
    mergedNotification.push(notification)
  })
  return mergedNotification
}

export {
  capitalizeFirstLetter,
  subtractTwoDates,
  combineArrayOfObjects,
  sortObject,
  subtractDate,
  addDate,
  getValueByKey,
  removeDuplicates,
  rmArray,
  calculateTime,
  arrayDiff,
  checkRouteConflict,
  getFromBetween,
  checkURL,
  randomIntFromInterval,
  strParse,
  deleteFiles,
  stripDate,
  calcSubscriptionInterval,
  calculateTimeReturnValue,
  mergeNotifications
}