(this["webpackJsonpare-we-green-on-azure-yet"]=this["webpackJsonpare-we-green-on-azure-yet"]||[]).push([[0],{31:function(e,t,n){},39:function(e,t,n){"use strict";n.r(t);var s=n(0),c=n(1),r=n.n(c),a=n(19),i=n.n(a),o=(n(31),n(8)),l=n(6),u=n(14),d=n(9),j=n(22),h=n(25),f=n(20),b=n(21),m=n(18),p=n(13),O=n(17),g=n.n(O),x={completed:"check-circle",failed:"times-circle",exception:"exclamation-circle",pending:"spinner",running:"cog"},k={completed:"green",failed:"red",exception:"orange",pending:"gray",running:"darkgray"},v=["gecko-t/win7-32-azure","gecko-t/win7-32-gpu-azure","gecko-t/win10-64-azure","gecko-t/win10-64-gpu-azure"],y=["jmaher@mozilla.com","mcornmesser@mozilla.com","rthijssen@mozilla.com"];var z=function(){var e=Object(c.useState)(!0),t=Object(d.a)(e,2),n=t[0],r=t[1],a=Object(c.useState)([]),i=Object(d.a)(a,2),O=i[0],z=i[1],w=Object(c.useState)({}),I=Object(d.a)(w,2),N=I[0],S=I[1],E=Object(c.useState)([]),G=Object(d.a)(E,2),F=G[0],T=G[1],Y=Object(c.useState)({}),_=Object(d.a)(Y,2),C=_[0],D=_[1];return Object(c.useEffect)((function(){O.length||y.forEach((function(e){fetch("https://hg.mozilla.org/try/json-pushes?full=1&startdate=".concat(g()().add(-14,"days").format("YYYY-MM-DD"),"&user=").concat(e)).then((function(e){return e.json()})).then((function(e){Object.keys(e).filter((function(t){return"try_task_config.json"===e[t].changesets[0].files[0]})).forEach((function(t){fetch("https://firefox-ci-tc.services.mozilla.com/api/index/v1/tasks/gecko.v2.try.pushlog-id.".concat(t)).then((function(e){if(e.ok)return e.json();throw e})).then((function(n){if(n.tasks&&n.tasks.length){var s=n.tasks[0].taskId;z((function(e){return[].concat(Object(u.a)(e.filter((function(e){return e!==s}))),[s])})),S((function(n){return Object(l.a)(Object(l.a)({},n),{},Object(o.a)({},s,Object(l.a)(Object(l.a)({},e[t]),{},{pushId:t})))}))}})).catch((function(e){console.error(e)}))}))})).catch((function(e){console.error(e)}))}))}),[O]),Object(c.useEffect)((function(){O.forEach((function(e){fetch("https://firefox-ci-tc.services.mozilla.com/api/queue/v1/task-group/".concat(e,"/list")).then((function(e){if(e.ok)return e.json();throw e})).then((function(t){T((function(n){return[].concat(Object(u.a)(n.filter((function(t){return t.taskGroupId!==e}))),Object(u.a)(t.tasks.filter((function(e){return v.includes("".concat(e.task.provisionerId,"/").concat(e.task.workerType))})).map((function(e){return{taskId:e.status.taskId,taskGroupId:e.task.taskGroupId,name:e.task.metadata.name,suite:e.task.metadata.name.split("/")[1],pool:"".concat(e.task.provisionerId,"/").concat(e.task.workerType),state:e.status.state,resolved:e.status.runs&&e.status.runs.length?e.status.runs.slice(-1)[0].resolved:void 0}}))))}))})).catch((function(e){console.error(e)})).finally((function(){r(!1)}))}))}),[O]),Object(c.useEffect)((function(){D((function(e){return Object(l.a)(Object(l.a)({},e),F.reduce((function(e,t){var n=t.suite;return Object(l.a)(Object(l.a)({},e),{},Object(o.a)({},n,v.reduce((function(e,t){return Object(l.a)(Object(l.a)({},e),{},Object(o.a)({},t,F.filter((function(e){return e.suite===n&&e.pool===t}))))}),{})))}),{}))}))}),[F]),Object(s.jsxs)(f.a,{children:[Object(s.jsx)("h1",{className:"text-center",children:"is the grass greener on the azure side?"}),n?Object(s.jsx)("div",{className:"text-center",children:Object(s.jsx)(b.a,{animation:"border",size:"lg"})}):null,Object(s.jsx)("h2",{className:"text-muted text-center",children:"tl;dr"}),Object(s.jsx)(m.a,{children:v.sort().map((function(e){return Object(s.jsxs)("tbody",{children:[Object(s.jsxs)("tr",{children:[Object(s.jsx)("td",{className:"text-right",style:{width:"50%"},children:Object(s.jsx)("h6",{children:e.split("/")[1].replace("-azure","")})}),Object(s.jsx)("td",{style:{width:"50%"},children:Object.keys(C).map((function(t){var n=F.filter((function(n){return n.suite===t&&n.pool===e})).sort((function(e,t){return e.resolved<t.resolved?-1:e.resolved>t.resolved?1:0}));return!!n.length&&"completed"===n.slice(-1)[0].state})).includes(!1)?Object(s.jsx)("h6",{style:{color:"red"},children:"no"}):Object(s.jsx)("h6",{style:{color:"green"},children:"yes"})})]}),Object(s.jsx)("tr",{className:"text-center",children:Object(s.jsx)("td",{colSpan:"2",children:Object.keys(k).map((function(t){return Object(s.jsxs)(h.a,{style:{marginLeft:"0.3em"},variant:"outline-secondary",size:"sm",children:[Object(s.jsx)(p.a,{style:{margin:"0 1px"},className:["pending","running"].includes(t)?"fa-sm fa-spin":"fa-sm",icon:x[t],color:k[t]}),"\xa0",Object(s.jsxs)(j.a,{variant:"secondary",children:[Object.keys(C).map((function(t){var n=F.filter((function(n){return n.suite===t&&n.pool===e})).sort((function(e,t){return e.resolved<t.resolved?-1:e.resolved>t.resolved?1:0}));return n.length?n.slice(-1)[0].state:void 0})).filter((function(e){return e===t})).length," / ",Object.keys(C).filter((function(t){return!!F.filter((function(n){return n.suite===t&&n.pool===e})).length})).length]})]},t)}))})})]},e)}))}),Object(s.jsx)("h2",{className:"text-muted text-center",children:"detail"}),Object(s.jsxs)(m.a,{striped:!0,size:"sm",children:[Object(s.jsx)("thead",{children:Object(s.jsxs)("tr",{children:[Object(s.jsx)("th",{className:"text-muted text-right",children:"suite"}),v.sort().map((function(e){return Object(s.jsx)("th",{className:"text-muted text-center",children:e.split("/")[1].replace("-azure","")},e)}))]})}),Object(s.jsx)("tbody",{children:Object.keys(C).sort().map((function(e){return Object(s.jsxs)("tr",{children:[Object(s.jsx)("td",{className:"text-right",children:e}),v.sort().map((function(t){return Object(s.jsx)("td",{className:"text-center",children:C[e][t].sort((function(e,t){return e.resolved<t.resolved?-1:e.resolved>t.resolved?1:0})).slice(-5).map((function(e){return Object(s.jsx)("a",{href:"https://firefox-ci-tc.services.mozilla.com/tasks/".concat(e.taskId),target:"_blank",rel:"noreferrer",title:"".concat(N[e.taskGroupId].user.split("@")[0]," (try/").concat(N[e.taskGroupId].pushId,"): pushed: ").concat(g()(1e3*N[e.taskGroupId].date).toISOString()," resolved: ").concat(e.resolved),children:Object(s.jsx)(p.a,{style:{margin:"0 1px"},className:["pending","running"].includes(e.state)?"fa-sm fa-spin":"fa-sm",icon:x[e.state],color:k[e.state]})},e.taskId)}))},t)}))]},e)}))})]}),Object(s.jsxs)("ul",{children:[Object(s.jsxs)("li",{children:["status legend:",Object.keys(k).map((function(e){return Object(s.jsxs)("div",{children:[Object(s.jsx)(p.a,{style:{margin:"0 1px"},className:["pending","running"].includes(e)?"fa-sm fa-spin":"fa-sm",icon:x[e],color:k[e]}),"\xa0",e]},e)}))]}),Object(s.jsx)("li",{className:"text-muted",children:"task status counts, in the tl;dr table, are determined by the last task run for the test suite and platform."}),Object(s.jsx)("li",{className:"text-muted",children:"task status indicators, in the detail table, are limited to the five most recent task runs for the test suite and platform."}),Object(s.jsx)("li",{className:"text-muted",children:"the try push-log is used to find task groups containing tasks that are configured to run on azure worker types for pushes from a configured subset of users."}),Object(s.jsxs)("li",{children:["the code for this github page is hosted at: ",Object(s.jsx)("a",{href:"https://github.com/mozilla-platform-ops/are-we-green-on-azure-yet",children:"github.com/mozilla-platform-ops/are-we-green-on-azure-yet"}),"."]}),Object(s.jsxs)("li",{children:["the work to green up tests is tracked in: ",Object(s.jsx)("a",{href:"https://bugzilla.mozilla.org/show_bug.cgi?id=1676850",children:"bug 1676850"}),"."]})]})]})},w=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,40)).then((function(t){var n=t.getCLS,s=t.getFID,c=t.getFCP,r=t.getLCP,a=t.getTTFB;n(e),s(e),c(e),r(e),a(e)}))},I=(n(38),n(11)),N=n(23),S=n(24);I.b.add(N.a,S.a),i.a.render(Object(s.jsx)(r.a.StrictMode,{children:Object(s.jsx)(z,{})}),document.getElementById("root")),w()}},[[39,1,2]]]);
//# sourceMappingURL=main.264da661.chunk.js.map