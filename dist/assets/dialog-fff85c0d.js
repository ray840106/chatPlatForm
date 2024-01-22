import{_ as i,g as d,o as c,a as g,b as e,h as n,D as m,d as u,l as f,t as p}from"./index-124aa391.js";const h={name:"dialog",props:{openShow:{type:Boolean},size:{type:String,default:"Regular"},hideFooter:{type:Boolean,default:!1},hideHeader:{type:Boolean,default:!1},content:{type:String,default:""}},methods:{clickclose(){this.$emit("close")},confirm(){this.$emit("confirm"),this.$emit("close")}}},y={key:0,id:"popup-modal",tabindex:"-1",class:"flex items-center justify-center bg-slate-300 bg-opacity-40 fixed top-0 left-0 right-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"},x={class:"relative w-full max-w-md max-h-full"},b={class:"relative bg-white rounded-lg shadow dark:bg-gray-700"},v=e("span",{class:"sr-only"},"Close modal",-1),k={class:"p-6 text-center"},_={class:"mb-5 text-lg font-normal text-gray-500 dark:text-gray-400"};function w(l,t,a,B,C,o){const r=d("font-awesome-icon");return a.openShow?(c(),g("div",y,[e("div",x,[e("div",b,[e("button",{onClick:t[0]||(t[0]=s=>o.clickclose()),type:"button",class:"absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white","data-modal-hide":"popup-modal"},[n(r,{icon:"fa-solid fa-x"}),v]),e("div",k,[n(r,{icon:"fa-solid fa-circle-exclamation",class:"w-12 h-12 mb-2 text-red-500"}),e("h3",_,[m(l.$slots,"body",{},()=>[f(p(a.content),1)])]),e("button",{onClick:t[1]||(t[1]=s=>o.confirm()),"data-modal-hide":"popup-modal",type:"button",class:"text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"}," Yes, I'm sure "),e("button",{onClick:t[2]||(t[2]=s=>o.clickclose()),"data-modal-hide":"popup-modal",type:"button",class:"text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"},"No, cancel")])])])])):u("",!0)}const $=i(h,[["render",w]]);export{$ as D};
