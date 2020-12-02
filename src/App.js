import React, { useEffect, useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';

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

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [pushMap, setPushMap] = useState({});
  const [tasks, setTasks] = useState([]);
  const [testSuiteResults, setTestSuiteResults] = useState({});
  const [usualSuspects, setUsualSuspects] = useState([
    'jmaher@mozilla.com',
    'mcornmesser@mozilla.com',
    'rthijssen@mozilla.com'
  ]);
  const [pushAgeInDays, setPushAgeInDays] = useState(14);

  useEffect(() => {
    if (!!usualSuspects && !!usualSuspects.length && !!pushAgeInDays) {
      setGroups([]);
      usualSuspects.forEach(suspect => {
        const startDate = moment().add((0 - pushAgeInDays), 'days').format('YYYY-MM-DD');
        fetch(`https://hg.mozilla.org/try/json-pushes?full=1&startdate=${startDate}&user=${suspect}`)
          .then(response => response.json())
          .then(pushLog => {
            const pushIds = Object.keys(pushLog);
            console.log(`checking ${pushIds.length} pushes by ${suspect.split('@')[0]} since ${startDate}`);
            pushIds
              .filter(pushId => pushLog[pushId].changesets[0].files[0] === 'try_task_config.json')
              .forEach(pushId => {
                fetch(`https://firefox-ci-tc.services.mozilla.com/api/index/v1/tasks/gecko.v2.try.pushlog-id.${pushId}`)
                  .then(response => {
                    if (response.ok) return response.json();
                    throw response;
                  })
                  .then(index => {
                    if (!!index.tasks && !!index.tasks.length) {
                      const taskGroupId = index.tasks[0].taskId;
                      // append the task group id to the list of task group ids (if not already present)
                      setGroups(_groups => [
                        ..._groups.filter(_group => _group !== taskGroupId),
                        taskGroupId
                      ]);
                      // map task group id to push
                      setPushMap(_pushMap => ({
                        ..._pushMap,
                        [taskGroupId]: {
                          ...pushLog[pushId],
                          pushId
                        }
                      }));
                      console.log(`mapped task group: ${taskGroupId}, to push: ${pushId}, by: ${suspect.split('@')[0]}`);
                    } else {
                      console.log(`no tasks from push: ${pushId} by: ${suspect.split('@')[0]}`);
                    }
                  }).catch(err => {
                    console.error(err);
                  });
              });
          })
          .catch(err => {
            console.error(err);
          });
      });
    }
  }, [usualSuspects, pushAgeInDays]);
  useEffect(() => {
    if (!!groups && !!groups.length) {
      setTasks(_tasks => _tasks.filter(_task => groups.includes(_task.taskGroupId)));
    }
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

  async function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <Container>
      <h1 className="text-center">is the grass greener on the azure side?</h1>
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
        {
          pools.sort().map(pool => (
            <tbody key={pool}>
              <tr>
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
              <tr className="text-center">
                <td colSpan="2">
                  {
                    Object.keys(color).map(state => (
                      <Button
                        key={state}
                        style={{ marginLeft: '0.3em' }}
                        variant="outline-secondary"
                        size="sm">
                        <FontAwesomeIcon
                          style={{margin: '0 1px'}}
                          className={['pending', 'running'].includes(state) ? 'fa-sm fa-spin' : 'fa-sm'}
                          icon={icon[state]}
                          color={color[state]} />
                        &nbsp;
                        <Badge variant="secondary">
                          {
                            Object.keys(testSuiteResults).map(suite => {
                              let poolSuitetasks = tasks
                                .filter(t => t.suite === suite && t.pool === pool)
                                .sort((tA, tB) => (tA.resolved < tB.resolved) ? -1 : (tA.resolved > tB.resolved) ? 1 : 0);
                              return (!!poolSuitetasks.length)
                                ? poolSuitetasks.slice(-1)[0].state
                                : undefined
                            }).filter(_state => _state === state).length
                          } / {
                            Object.keys(testSuiteResults).filter(suite => !!tasks.filter(t => t.suite === suite && t.pool === pool).length).length
                          }
                        </Badge>
                      </Button>
                    ))
                  }
                </td>
              </tr>
            </tbody>
          ))
        }
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
                          <a key={task.taskId} href={`https://firefox-ci-tc.services.mozilla.com/tasks/${task.taskId}`} target="_blank" rel="noreferrer" title={`${pushMap[task.taskGroupId].user.split('@')[0]} (try/${pushMap[task.taskGroupId].pushId}): pushed: ${moment(pushMap[task.taskGroupId].date * 1000).toISOString()} resolved: ${task.resolved}`}>
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
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col>
            <Form.Group>
              <Form.Label>include try pushes by</Form.Label>
              <Form.Control
                type="text"
                value={usualSuspects.join(', ')}
                onChange={e => { const { value } = e.target; setUsualSuspects(value.split(',').map(x => x.trim())); }} />
            </Form.Group>
          </Col>
          <Col xs lg="2">
            <Form.Group>
              <Form.Label>push age in days</Form.Label>
              <Form.Control
                type="number"
                value={pushAgeInDays}
                onChange={e => { const _pushAgeInDays = parseInt(e.target.value); if (_pushAgeInDays > -1 && _pushAgeInDays < 31) { setPushAgeInDays(_pushAgeInDays); }; }} />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      <ul>
        <li>
          status legend:
          {
            Object.keys(color).map(state => (
              <div key={state}>
                <FontAwesomeIcon
                  style={{margin: '0 1px'}}
                  className={['pending', 'running'].includes(state) ? 'fa-sm fa-spin' : 'fa-sm'}
                  icon={icon[state]}
                  color={color[state]} />
                &nbsp;
                {state}
              </div>
            ))
          }
        </li>
        <li className="text-muted">
          task status counts, in the tl;dr table, are determined by the last task run for the test suite and platform.
        </li>
        <li className="text-muted">
          task status indicators, in the detail table, are limited to the five most recent task runs for the test suite and platform.
        </li>
        <li className="text-muted">
          the try push-log is used to find task groups containing tasks that are configured to run on azure worker types for pushes in the last {pushAgeInDays} days, from a configured subset of users including: {usualSuspects.map(us => us.split('@')[0]).join(', ')}.
        </li>
        <li>
          the code for this github page is hosted at: <a href="https://github.com/mozilla-platform-ops/are-we-green-on-azure-yet">github.com/mozilla-platform-ops/are-we-green-on-azure-yet</a>.
        </li>
        <li>
          the work to green up tests is tracked in: <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=1676850">bug 1676850</a>.
        </li>
      </ul>
    </Container>
  );
}

export default App;
