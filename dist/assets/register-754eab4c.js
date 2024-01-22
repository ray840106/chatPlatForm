import{e as x,r as b,o as h,a as v,b as e,q as o,v as d,s as c,h as u,n,m as i,y as w,l as m,f as _}from"./index-124aa391.js";import{r as k,a as p}from"./EyeIcon-2cc5150f.js";const N={class:"p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mt-16 md:mt-16 lg:mt-0"},S={class:"grid gap-6 mb-6 md:grid-cols-2"},C=e("label",{for:"first_name",class:"block mb-2 text-sm font-medium text-gray-900 dark:text-white"},"First name",-1),O=e("label",{for:"last_name",class:"block mb-2 text-sm font-medium text-gray-900 dark:text-white"},"Last name",-1),A=e("label",{for:"company",class:"block mb-2 text-sm font-medium text-gray-900 dark:text-white"},"Company",-1),M=e("label",{for:"phone",class:"block mb-2 text-sm font-medium text-gray-900 dark:text-white"},"Phone number",-1),I={class:"mb-6"},R=e("label",{for:"email",class:"block mb-2 text-sm font-medium text-gray-900 dark:text-white"},"Email address",-1),E={class:"mb-6"},P=e("label",{for:"password",class:"block mb-2 text-sm font-medium text-gray-900 dark:text-white"},"Password",-1),D={class:"relative text-gray-400 focus-within:text-gray-600 block"},T=["type"],U={class:"mb-6"},V=e("label",{for:"confirm_password",class:"block mb-2 text-sm font-medium text-gray-900 dark:text-white"},"Confirm password",-1),q={class:"relative text-gray-400 focus-within:text-gray-600 block"},F=["type"],W={class:"flex items-start mb-6"},B={class:"flex items-center h-5"},L=e("label",{for:"remember",class:"ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"},[m("I agree with the "),e("a",{href:"#",class:"text-blue-600 hover:underline dark:text-blue-500"},"terms and conditions"),m(".")],-1),$=e("div",{class:"mt-2"},[e("a",{href:"/#/login",class:"font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline"},"login")],-1),z={__name:"register",setup(Y){const f=x(),t=b({}),l=b(!0),s=b(!0);function y(){if(!t.value.CONDITIONS){alert("Agree to terms");return}if(t.value.PASSWORD!==t.value.CONFIRM_PASSWORD){alert("Enter the password twice to the same");return}_({method:"post",url:"/API/auth",responseType:"json",params:{method:"register"},data:{user:t.value}}).then(function(g){g.data.done_TF&&f.push({path:"/login"})})}return(g,r)=>(h(),v("div",N,[e("form",null,[e("div",S,[e("div",null,[C,o(e("input",{"onUpdate:modelValue":r[0]||(r[0]=a=>t.value.FIRST_NAME=a),type:"text",id:"first_name",class:"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",placeholder:"John",required:""},null,512),[[d,t.value.FIRST_NAME]])]),e("div",null,[O,o(e("input",{"onUpdate:modelValue":r[1]||(r[1]=a=>t.value.LAST_NAME=a),type:"text",id:"last_name",class:"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",placeholder:"Doe",required:""},null,512),[[d,t.value.LAST_NAME]])]),e("div",null,[A,o(e("input",{"onUpdate:modelValue":r[2]||(r[2]=a=>t.value.COMPANY=a),type:"text",id:"company",class:"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",placeholder:"CYCU",required:""},null,512),[[d,t.value.COMPANY]])]),e("div",null,[M,o(e("input",{"onUpdate:modelValue":r[3]||(r[3]=a=>t.value.PHONE_NUMBER=a),type:"text",id:"phone",class:"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",placeholder:"0912345678",pattern:"[0-9]{10}",required:""},null,512),[[d,t.value.PHONE_NUMBER]])])]),e("div",I,[R,o(e("input",{"onUpdate:modelValue":r[4]||(r[4]=a=>t.value.EMAIL=a),type:"text",id:"email",class:"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",placeholder:"john.doe@company.com",required:""},null,512),[[d,t.value.EMAIL]])]),e("div",E,[P,e("div",D,[o(e("input",{"onUpdate:modelValue":r[5]||(r[5]=a=>t.value.PASSWORD=a),type:l.value?"password":"text",id:"password",class:"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 pr-10",placeholder:"•••••••••",required:""},null,8,T),[[c,t.value.PASSWORD]]),u(i(k),{class:n(["w-6 h-6 absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer",l.value?"block":"hidden"]),onClick:r[6]||(r[6]=a=>l.value=!l.value)},null,8,["class"]),u(i(p),{class:n(["w-6 h-6 absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer",l.value?"hidden":"block"]),onClick:r[7]||(r[7]=a=>l.value=!l.value)},null,8,["class"])])]),e("div",U,[V,e("div",q,[o(e("input",{"onUpdate:modelValue":r[8]||(r[8]=a=>t.value.CONFIRM_PASSWORD=a),type:s.value?"password":"text",id:"confirm_password",class:"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 pr-10",placeholder:"•••••••••",required:""},null,8,F),[[c,t.value.CONFIRM_PASSWORD]]),u(i(k),{class:n(["w-6 h-6 absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer",s.value?"block":"hidden"]),onClick:r[9]||(r[9]=a=>s.value=!s.value)},null,8,["class"]),u(i(p),{class:n(["w-6 h-6 absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer",s.value?"hidden":"block"]),onClick:r[10]||(r[10]=a=>s.value=!s.value)},null,8,["class"])])]),e("div",W,[e("div",B,[o(e("input",{id:"remember","onUpdate:modelValue":r[11]||(r[11]=a=>t.value.CONDITIONS=a),type:"checkbox",value:"",class:"w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800",required:""},null,512),[[w,t.value.CONDITIONS]])]),L]),e("button",{onClick:y,type:"button",class:"text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"},"Submit"),$])]))}};export{z as default};
