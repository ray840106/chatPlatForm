import{u as i,z as u,c as l}from"./index-875e2a01.js";var e=null;const m=()=>{e=new WebSocket("ws://localhost:5001");const o=i(),n=u();e.onopen=function(){console.log("websocket connected!!")},e.onmessage=function(s){const a=l(()=>o.state.rooms);let t=JSON.parse(s.data);console.log(t),t.hasOwnProperty("updData")&&(t.updData.ROOMID==n.query.ROOMID?o.commit("setWsRes",t):a.value.filter(r=>r.ROOMID==t.updData.ROOMID)&&o.commit("m_updRooms",t.updData))},e.onerror=function(s){console.log("error",s)}},d=o=>{console.log(e.readyState),c(e,function(){console.log("message sent!!!"),e.send(JSON.stringify(o))})};function c(o,n){setTimeout(function(){o.readyState===1?(console.log("Connection is made"),n!=null&&n()):(console.log("wait for connection..."),c(o,n))},5)}export{m as c,d as s};