(this["webpackJsonpare-we-green-on-azure-yet"]=this["webpackJsonpare-we-green-on-azure-yet"]||[]).push([[0],{30:function(e,t,n){},37:function(e,t,n){"use strict";n.r(t);var r=n(0),s=n(1),c=n.n(s),a=n(18),i=n.n(a),o=(n(30),n(8)),l=n(7),u=n(13),d=n(11),j=n(21),h=n(24),f=n(19),b=n(20),m=n(17),p=n(16),O={completed:"check-circle",failed:"times-circle",exception:"exclamation-circle",pending:"spinner",running:"cog"},g={completed:"green",failed:"red",exception:"orange",pending:"gray",running:"darkgray"},x=["gecko-t/win7-32-azure","gecko-t/win7-32-gpu-azure","gecko-t/win10-64-azure","gecko-t/win10-64-gpu-azure"],k=["mcornmesser@mozilla.com","rthijssen@mozilla.com"];var v=function(){var e=Object(s.useState)(!0),t=Object(d.a)(e,2),n=t[0],c=t[1],a=Object(s.useState)([]),i=Object(d.a)(a,2),v=i[0],y=i[1],z=Object(s.useState)([]),w=Object(d.a)(z,2),N=w[0],I=w[1],E=Object(s.useState)({}),S=Object(d.a)(E,2),F=S[0],T=S[1];return Object(s.useEffect)((function(){v.length||k.forEach((function(e){fetch("https://hg.mozilla.org/try/json-pushes?full=1&startdate=2020-11-10&user=".concat(e)).then((function(e){return e.json()})).then((function(e){Object.keys(e).filter((function(t){return"try_task_config.json"===e[t].changesets[0].files[0]})).forEach((function(e){fetch("https://firefox-ci-tc.services.mozilla.com/api/index/v1/tasks/gecko.v2.try.pushlog-id.".concat(e)).then((function(e){if(e.ok)return e.json();throw e})).then((function(e){y((function(t){return[].concat(Object(u.a)(t.filter((function(t){return t!==e.tasks[0].taskId}))),[e.tasks[0].taskId])}))})).catch((function(e){console.error(e)}))}))})).catch((function(e){console.error(e)}))}))}),[v]),Object(s.useEffect)((function(){v.forEach((function(e){fetch("https://firefox-ci-tc.services.mozilla.com/api/queue/v1/task-group/".concat(e,"/list")).then((function(e){if(e.ok)return e.json();throw e})).then((function(t){I((function(n){return[].concat(Object(u.a)(n.filter((function(t){return t.taskGroupId!==e}))),Object(u.a)(t.tasks.filter((function(e){return x.includes("".concat(e.task.provisionerId,"/").concat(e.task.workerType))})).map((function(e){return{taskId:e.status.taskId,taskGroupId:e.task.taskGroupId,name:e.task.metadata.name,suite:e.task.metadata.name.split("/")[1],pool:"".concat(e.task.provisionerId,"/").concat(e.task.workerType),state:e.status.state,resolved:e.status.runs&&e.status.runs.length?e.status.runs.slice(-1)[0].resolved:void 0}}))))}))})).catch((function(e){console.error(e)})).finally((function(){c(!1)}))}))}),[v]),Object(s.useEffect)((function(){T((function(e){return Object(l.a)(Object(l.a)({},e),N.reduce((function(e,t){var n=t.suite;return Object(l.a)(Object(l.a)({},e),{},Object(o.a)({},n,x.reduce((function(e,t){return Object(l.a)(Object(l.a)({},e),{},Object(o.a)({},t,N.filter((function(e){return e.suite===n&&e.pool===t}))))}),{})))}),{}))}))}),[N]),Object(r.jsxs)(f.a,{children:[Object(r.jsx)("h1",{className:"text-center",children:"are we green on azure yet?"}),n?Object(r.jsx)("div",{className:"text-center",children:Object(r.jsx)(b.a,{animation:"border",size:"lg"})}):null,Object(r.jsx)("h2",{className:"text-muted text-center",children:"tl;dr"}),Object(r.jsx)(m.a,{children:x.sort().map((function(e){return Object(r.jsxs)("tbody",{children:[Object(r.jsxs)("tr",{children:[Object(r.jsx)("td",{className:"text-right",style:{width:"50%"},children:Object(r.jsx)("h6",{children:e.split("/")[1].replace("-azure","")})}),Object(r.jsx)("td",{style:{width:"50%"},children:Object.keys(F).map((function(t){var n=N.filter((function(n){return n.suite===t&&n.pool===e})).sort((function(e,t){return e.resolved<t.resolved?-1:e.resolved>t.resolved?1:0}));return!!n.length&&"completed"===n.slice(-1)[0].state})).includes(!1)?Object(r.jsx)("h6",{style:{color:"red"},children:"no"}):Object(r.jsx)("h6",{style:{color:"green"},children:"yes"})})]}),Object(r.jsx)("tr",{className:"text-center",children:Object(r.jsx)("td",{colSpan:"2",children:Object.keys(g).map((function(t){return Object(r.jsxs)(h.a,{style:{marginLeft:"0.3em"},variant:"outline-secondary",size:"sm",children:[Object(r.jsx)(p.a,{style:{margin:"0 1px"},className:["pending","running"].includes(t)?"fa-sm fa-spin":"fa-sm",icon:O[t],color:g[t]}),"\xa0",Object(r.jsx)(j.a,{variant:"secondary",children:Object.keys(F).map((function(t){var n=N.filter((function(n){return n.suite===t&&n.pool===e})).sort((function(e,t){return e.resolved<t.resolved?-1:e.resolved>t.resolved?1:0}));return n.length?n.slice(-1)[0].state:void 0})).filter((function(e){return e===t})).length})]},t)}))})})]},e)}))}),Object(r.jsx)("h2",{className:"text-muted text-center",children:"detail"}),Object(r.jsxs)(m.a,{striped:!0,size:"sm",children:[Object(r.jsx)("thead",{children:Object(r.jsxs)("tr",{children:[Object(r.jsx)("th",{className:"text-muted text-right",children:"suite"}),x.sort().map((function(e){return Object(r.jsx)("th",{className:"text-muted text-center",children:e.split("/")[1].replace("-azure","")},e)}))]})}),Object(r.jsx)("tbody",{children:Object.keys(F).sort().map((function(e){return Object(r.jsxs)("tr",{children:[Object(r.jsx)("td",{className:"text-right",children:e}),x.sort().map((function(t){return Object(r.jsx)("td",{className:"text-center",children:F[e][t].sort((function(e,t){return e.resolved<t.resolved?-1:e.resolved>t.resolved?1:0})).slice(-5).map((function(e){return Object(r.jsx)("a",{href:"https://firefox-ci-tc.services.mozilla.com/tasks/".concat(e.taskId),target:"_blank",rel:"noreferrer",title:e.resolved,children:Object(r.jsx)(p.a,{style:{margin:"0 1px"},className:["pending","running"].includes(e.state)?"fa-sm fa-spin":"fa-sm",icon:O[e.state],color:g[e.state]})},e.taskId)}))},t)}))]},e)}))})]}),Object(r.jsxs)("ul",{children:[Object(r.jsx)("li",{className:"text-muted",children:"task status counts, in the tl;dr table, are determined by the last task run for the test suite and platform."}),Object(r.jsx)("li",{className:"text-muted",children:"task status indicators, in the detail table, are limited to the five most recent task runs for the test suite and platform."}),Object(r.jsx)("li",{className:"text-muted",children:"the try push-log is used to find task groups containing tasks that are configured to run on azure worker types for pushes from a configured subset of users."}),Object(r.jsxs)("li",{children:["the code for this github page is hosted at: ",Object(r.jsx)("a",{href:"https://github.com/mozilla-platform-ops/are-we-green-on-azure-yet",children:"github.com/mozilla-platform-ops/are-we-green-on-azure-yet"}),"."]}),Object(r.jsxs)("li",{children:["the work to green up tests is tracked in: ",Object(r.jsx)("a",{href:"https://bugzilla.mozilla.org/show_bug.cgi?id=1676850",children:"bug 1676850"}),"."]})]})]})},y=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,38)).then((function(t){var n=t.getCLS,r=t.getFID,s=t.getFCP,c=t.getLCP,a=t.getTTFB;n(e),r(e),s(e),c(e),a(e)}))},z=(n(36),n(10)),w=n(22),N=n(23);z.b.add(w.a,N.a),i.a.render(Object(r.jsx)(c.a.StrictMode,{children:Object(r.jsx)(v,{})}),document.getElementById("root")),y()}},[[37,1,2]]]);
//# sourceMappingURL=main.753bc74a.chunk.js.map