(this["webpackJsonpare-we-green-on-azure-yet"]=this["webpackJsonpare-we-green-on-azure-yet"]||[]).push([[0],{27:function(e,t,c){},34:function(e,t,c){"use strict";c.r(t);var n=c(2),r=c(0),a=c.n(r),s=c(16),i=c.n(s),o=(c(27),c(6)),u=c(4),l=c(15),j=c(5),b=c(18),d=c(19),h=c(17),f={completed:"check-circle",failed:"times-circle",exception:"exclamation-circle",pending:"spinner",running:"play-circle"},p={completed:"green",failed:"red",exception:"amber",pending:"gray",running:"blue"};var O=function(){var e=Object(r.useState)(!0),t=Object(j.a)(e,2),c=(t[0],t[1]),a=Object(r.useState)(["gecko-t/win7-32-azure","gecko-t/win7-32-gpu-azure","gecko-t/win10-64-azure","gecko-t/win10-64-gpu-azure"]),s=Object(j.a)(a,2),i=s[0],O=(s[1],Object(r.useState)(["cq_jFOOGTryTs8Q3VoO9kg","YAzpJW1sSAaGZ0NKw4tHCw","S8UhCdtwSfS7ciycZFViIQ","QcXaBa22SH6PCWysVYAyCA","IbMJaXOyQy-u4xmXLV4PKw","XsKNeXRwQi6XWcVt7gSoyg"])),g=Object(j.a)(O,2),m=g[0],x=(g[1],Object(r.useState)([])),k=Object(j.a)(x,2),w=k[0],y=k[1],z=Object(r.useState)({}),v=Object(j.a)(z,2),S=v[0],I=v[1];return Object(r.useEffect)((function(){m.forEach((function(e){fetch("https://firefox-ci-tc.services.mozilla.com/api/queue/v1/task-group/".concat(e,"/list")).then((function(e){if(e.ok)return e.json();throw e})).then((function(t){y((function(c){return[].concat(Object(l.a)(c.filter((function(t){return t.taskGroupId!==e}))),Object(l.a)(t.tasks.filter((function(e){return i.includes("".concat(e.task.provisionerId,"/").concat(e.task.workerType))})).map((function(e){return{taskId:e.status.taskId,taskGroupId:e.task.taskGroupId,name:e.task.metadata.name,suite:e.task.metadata.name.split("/")[1],pool:"".concat(e.task.provisionerId,"/").concat(e.task.workerType),state:e.status.state,resolved:e.status.runs&&e.status.runs.length?e.status.runs.slice(-1)[0].resolved:void 0}}))))}))})).catch((function(e){console.error(e)})).finally((function(){c(!1)}))}))}),[m]),Object(r.useEffect)((function(){I((function(e){return Object(u.a)(Object(u.a)({},e),w.reduce((function(e,t){var c=t.suite;return Object(u.a)(Object(u.a)({},e),{},Object(o.a)({},c,i.reduce((function(e,t){return Object(u.a)(Object(u.a)({},e),{},Object(o.a)({},t,w.filter((function(e){return e.suite===c&&e.pool===t}))))}),{})))}),{}))}))}),[i,w]),Object(n.jsxs)(b.a,{children:[Object(n.jsx)("h1",{children:"are we green on azure yet?"}),Object(n.jsxs)(d.a,{striped:!0,size:"sm",children:[Object(n.jsx)("thead",{children:Object(n.jsxs)("tr",{children:[Object(n.jsx)("th",{className:"text-muted text-right",children:"suite"}),i.sort().map((function(e){return Object(n.jsx)("th",{className:"text-muted text-center",children:e.split("/")[1].replace("-azure","")})}))]})}),Object(n.jsx)("tbody",{children:Object.keys(S).sort().map((function(e){return Object(n.jsxs)("tr",{children:[Object(n.jsx)("td",{className:"text-right",children:e}),i.sort().map((function(t){return Object(n.jsx)("td",{className:"text-center",children:S[e][t].map((function(e){return Object(n.jsx)("a",{href:"https://firefox-ci-tc.services.mozilla.com/tasks/".concat(e.taskId),target:"_blank",children:Object(n.jsx)(h.a,{className:"fa-sm",icon:f[e.state],color:p[e.state]})})}))})}))]})}))})]}),Object(n.jsxs)("p",{children:["the code for this github page is hosted at: ",Object(n.jsx)("a",{href:"https://github.com/mozilla-platform-ops/are-we-green-on-azure-yet",children:"github.com/mozilla-platform-ops/are-we-green-on-azure-yet"}),".",Object(n.jsx)("br",{}),"the work to green up tests is tracked in: ",Object(n.jsx)("a",{href:"https://bugzilla.mozilla.org/show_bug.cgi?id=1676850",children:"bug 1676850"}),".",Object(n.jsx)("br",{})]})]})},g=function(e){e&&e instanceof Function&&c.e(3).then(c.bind(null,35)).then((function(t){var c=t.getCLS,n=t.getFID,r=t.getFCP,a=t.getLCP,s=t.getTTFB;c(e),n(e),r(e),a(e),s(e)}))},m=(c(33),c(8)),x=c(20),k=c(21);m.b.add(x.a,k.a),i.a.render(Object(n.jsx)(a.a.StrictMode,{children:Object(n.jsx)(O,{})}),document.getElementById("root")),g()}},[[34,1,2]]]);
//# sourceMappingURL=main.f2e6ac02.chunk.js.map