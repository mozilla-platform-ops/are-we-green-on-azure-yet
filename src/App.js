import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const icon = {
  completed: 'check-circle',
  failed: 'times-circle',
  exception: 'exclamation-circle',
  pending: 'spinner',
  running: 'cog'
};
const color = {
  completed: 'green',
  failed: 'red',
  exception: 'orange',
  pending: 'gray',
  running: 'darkgray'
};
const pools = [
  'gecko-t/win7-32-azure',
  'gecko-t/win7-32-gpu-azure',
  'gecko-t/win10-64-azure',
  'gecko-t/win10-64-gpu-azure'
];
const usualSuspects = [
  'mcornmesser@mozilla.com',
  'rthijssen@mozilla.com'
];

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [testSuiteResults, setTestSuiteResults] = useState({});
  useEffect(() => {
    usualSuspects.forEach(suspect => {
      fetch(`https://hg.mozilla.org/try/json-pushes?full=1&startdate=2020-11-10&user=${suspect}`)
        .then(response => response.json())
        .then(pushLog => {
          Object.keys(pushLog)
            .filter(pushId => pushLog[pushId].changesets[0].files[0] === 'try_task_config.json')
            .forEach(pushId => {
              fetch(`https://firefox-ci-tc.services.mozilla.com/api/index/v1/tasks/gecko.v2.try.pushlog-id.${pushId}`)
                .then(response => {
                  if (response.ok) return response.json();
                  throw response;
                })
                .then(index => {
                  setGroups(_groups => [
                    ..._groups.filter(_group => _group !== index.tasks[0].taskId),
                    index.tasks[0].taskId
                  ])
                }).catch(err => {
                  console.error(err);
                });
            });
        })
        .catch(err => {
          console.error(err);
        });
    });
  }, []);
  useEffect(() => {
    groups.forEach(taskGroupId => {
      fetch(`https://firefox-ci-tc.services.mozilla.com/api/queue/v1/task-group/${taskGroupId}/list`)
        .then(response => {
          if (response.ok) return response.json();
          throw response;
        })
        .then(taskGroup => {
          setTasks(tasks => [
            ...tasks.filter(_task => _task.taskGroupId !== taskGroupId),
            ...taskGroup.tasks
              .filter(_task => pools.includes(`${_task.task.provisionerId}/${_task.task.workerType}`))
              .map(_task => ({
                taskId: _task.status.taskId,
                taskGroupId: _task.task.taskGroupId,
                name: _task.task.metadata.name,
                suite: _task.task.metadata.name.split('/')[1],
                pool: `${_task.task.provisionerId}/${_task.task.workerType}`,
                state: _task.status.state,
                resolved: (!!_task.status.runs && !!_task.status.runs.length) ? _task.status.runs.slice(-1)[0].resolved : undefined
              }))
          ]);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  }, [groups]);

  useEffect(() => {
    setTestSuiteResults(testSuiteResults => ({
      ...testSuiteResults,
      ...tasks.reduce((sA, task) => {
            let { suite } = task;
            return {
              ...sA,
              [suite]: pools.reduce((pA, pool) => ({
                ...pA,
                [pool]: tasks.filter(t => t.suite === suite && t.pool === pool)
              }), {})
            };
          }, {})
    }));
  }, [tasks]);

  return (
    <Container>
      <h1 className="text-center">are we green on azure yet?</h1>
      {
        (isLoading)
          ? (
              <div className="text-center">
                <Spinner animation="border" size="lg" />
              </div>
            )
          : null
      }
      <h2 className="text-muted text-center">
        tl;dr
      </h2>
      <Table>
        <tbody>
          {
            pools.sort().map(pool => (
              <tr key={pool}>
                <td className="text-right" style={{width: '50%'}}>
                  <h6>
                    {pool.split('/')[1].replace('-azure', '')}
                  </h6>
                </td>
                <td style={{width: '50%'}}>
                  {
                    // inspect the last task result for each suite in the pool.
                    // if all suites have been tested and all have a last task status of completed, call it green.
                    Object.keys(testSuiteResults).map(suite => {
                      let poolSuitetasks = tasks
                        .filter(t => t.suite === suite && t.pool === pool)
                        .sort((tA, tB) => (tA.resolved < tB.resolved) ? -1 : (tA.resolved > tB.resolved) ? 1 : 0);
                      return !!poolSuitetasks.length && poolSuitetasks.slice(-1)[0].state === 'completed'
                    }).includes(false)
                      ? (
                          <h6 style={{color: 'red'}}>
                            no
                          </h6>
                        )
                      : (
                          <h6 style={{color: 'green'}}>
                            yes
                          </h6>
                        )
                  }
                </td>
              </tr>
            ))
          }
        </tbody>
      </Table>
      <h2 className="text-muted text-center">
        detail
      </h2>
      <Table striped size="sm">
        <thead>
          <tr>
            <th className="text-muted text-right">
              suite
            </th>
            {
              pools.sort().map(pool => (
                <th key={pool} className="text-muted text-center">
                  {pool.split('/')[1].replace('-azure', '')}
                </th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(testSuiteResults).sort().map(suite => (
              <tr key={suite}>
                <td className="text-right">{suite}</td>
                {
                  pools.sort().map(pool => (
                    <td key={pool} className="text-center">
                      {
                        testSuiteResults[suite][pool].sort((tA, tB) => (tA.resolved < tB.resolved) ? -1 : (tA.resolved > tB.resolved) ? 1 : 0).slice(-5).map(task => (
                          <a key={task.taskId} href={`https://firefox-ci-tc.services.mozilla.com/tasks/${task.taskId}`} target="_blank" rel="noreferrer" title={task.resolved}>
                            <FontAwesomeIcon
                              style={{margin: '0 1px'}}
                              className={['pending', 'running'].includes(task.state) ? 'fa-sm fa-spin' : 'fa-sm'}
                              icon={icon[task.state]}
                              color={color[task.state]} />
                          </a>
                        ))
                      }
                    </td>
                  ))
                }
              </tr>
            ))
          }
        </tbody>
      </Table>
      <p>
        the code for this github page is hosted at: <a href="https://github.com/mozilla-platform-ops/are-we-green-on-azure-yet">github.com/mozilla-platform-ops/are-we-green-on-azure-yet</a>.<br />
        the work to green up tests is tracked in: <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=1676850">bug 1676850</a>.<br />
      </p>
    </Container>
  );
}

export default App;
