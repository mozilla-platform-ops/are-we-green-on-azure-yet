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

const statusIcon = {
  completed: 'circle-check',
  failed: 'circle-xmark',
  exception: 'circle-exclamation',
  pending: 'spinner',
  running: 'gear',
  unscheduled: 'clock'
};
const statusColor = {
  completed: 'green',
  failed: 'red',
  exception: 'orange',
  pending: 'gray',
  running: 'darkgray',
  unscheduled: 'lightgray'
};

const WINDOWS_POOLS = [
  'gecko-t/win11-64-25h2',
  'gecko-t/win11-64-25h2-gpu',
  'gecko-t/win11-64-25h2-source',
  'gecko-t/win11-64-24h2',
  'gecko-t/win11-64-24h2-gpu',
  'gecko-t/win11-64-24h2-source',
  'gecko-t/win10-64-2009',
  'gecko-t/win10-64-2009-gpu',
  'gecko-t/win10-64-2009-source'
];

const TC_BASE = 'https://firefox-ci-tc.services.mozilla.com';
const HG_BASE = 'https://hg-edge.mozilla.org/integration/autoland';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [pushMap, setPushMap] = useState({});
  const [tasks, setTasks] = useState([]);
  const [pushCount, setPushCount] = useState(5);

  useEffect(() => {
    setTasks([]);
    setIsLoading(true);

    async function fetchData() {
      try {
        // get the latest push ID from autoland
        const tipRes = await fetch(
          `${HG_BASE}/json-pushes?version=2&topo=1&startID=0&endID=1`
        );
        const tipData = await tipRes.json();
        const lastPushId = tipData.lastpushid;

        // fetch the last N pushes
        const startID = Math.max(0, lastPushId - pushCount);
        const pushRes = await fetch(
          `${HG_BASE}/json-pushes?version=2&topo=1&startID=${startID}&endID=${lastPushId}`
        );
        const pushData = await pushRes.json();
        const pushIds = Object.keys(pushData.pushes).sort((a, b) => b - a);
        console.log(`fetched ${pushIds.length} autoland pushes (${pushIds[pushIds.length - 1]}..${pushIds[0]})`);

        // resolve each push to a task group via the TC index
        const groupEntries = [];
        const foundPushMap = {};
        await Promise.all(
          pushIds.map(async (pushId) => {
            try {
              const res = await fetch(
                `${TC_BASE}/api/index/v1/tasks/gecko.v2.autoland.pushlog-id.${pushId}`
              );
              if (!res.ok) return;
              const index = await res.json();
              if (index.tasks && index.tasks.length) {
                const taskGroupId = index.tasks[0].taskId;
                groupEntries.push(taskGroupId);
                foundPushMap[taskGroupId] = {
                  ...pushData.pushes[pushId],
                  pushId
                };
              }
            } catch (err) {
              console.error(`index lookup failed for push ${pushId}:`, err);
            }
          })
        );

        if (!groupEntries.length) {
          console.log('no indexed task groups found');
          setIsLoading(false);
          return;
        }

        setPushMap(prev => ({ ...prev, ...foundPushMap }));

        // fetch all pages of each task group, filter to Windows pools
        const allTasks = await Promise.all(
          groupEntries.map(async (taskGroupId) => {
            const groupTasks = [];
            let continuationToken = null;
            try {
              do {
                const url = new URL(
                  `${TC_BASE}/api/queue/v1/task-group/${taskGroupId}/list`
                );
                if (continuationToken) {
                  url.searchParams.set('continuationToken', continuationToken);
                }
                const res = await fetch(url);
                if (!res.ok) break;
                const data = await res.json();
                groupTasks.push(
                  ...data.tasks
                    .filter(t =>
                      WINDOWS_POOLS.includes(
                        `${t.task.provisionerId}/${t.task.workerType}`
                      )
                    )
                    .map(t => ({
                      taskId: t.status.taskId,
                      taskGroupId: t.task.taskGroupId,
                      name: t.task.metadata.name,
                      suite: t.task.metadata.name.split('/')[1] || t.task.metadata.name,
                      pool: `${t.task.provisionerId}/${t.task.workerType}`,
                      tier: (t.task.extra && t.task.extra.treeherder && t.task.extra.treeherder.tier) || 1,
                      state: t.status.state,
                      resolved: (t.status.runs && t.status.runs.length)
                        ? t.status.runs.slice(-1)[0].resolved
                        : undefined
                    }))
                );
                continuationToken = data.continuationToken || null;
              } while (continuationToken);
            } catch (err) {
              console.error(`failed to fetch task group ${taskGroupId}:`, err);
            }
            return groupTasks;
          })
        );

        setTasks(allTasks.flat());
      } catch (err) {
        console.error('fetchData failed:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [pushCount]);

  const tiers = [1, 2, 3];

  // group tasks: tier → suite → pool → tasks[]
  const tasksByTier = {};
  for (const tier of tiers) {
    const tierTasks = tasks.filter(t => t.tier === tier);
    const suites = [...new Set(tierTasks.map(t => t.suite))].sort();
    tasksByTier[tier] = {};
    for (const suite of suites) {
      tasksByTier[tier][suite] = {};
      for (const pool of WINDOWS_POOLS) {
        tasksByTier[tier][suite][pool] = tierTasks
          .filter(t => t.suite === suite && t.pool === pool)
          .sort((a, b) => (a.resolved || '') < (b.resolved || '') ? -1 : 1);
      }
    }
  }

  function tierSummary(tier) {
    const tierTasks = tasks.filter(t => t.tier === tier);
    if (!tierTasks.length) return { total: 0, completed: 0, failed: 0, running: 0, pending: 0 };
    return {
      total: tierTasks.length,
      completed: tierTasks.filter(t => t.state === 'completed').length,
      failed: tierTasks.filter(t => t.state === 'failed').length,
      exception: tierTasks.filter(t => t.state === 'exception').length,
      running: tierTasks.filter(t => t.state === 'running').length,
      pending: tierTasks.filter(t => t.state === 'pending').length,
      unscheduled: tierTasks.filter(t => t.state === 'unscheduled').length,
    };
  }

  // unique pools that actually have tasks
  const activePools = WINDOWS_POOLS.filter(pool =>
    tasks.some(t => t.pool === pool)
  );

  return (
    <Container>
      <h1 className="text-center">is the grass greener on the azure side?</h1>
      <p className="text-muted text-center">
        windows test results from the last {pushCount} autoland pushes
      </p>
      {isLoading && (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      )}

      <h2 className="text-muted text-center">tl;dr</h2>
      <Table>
        <tbody>
          {tiers.map(tier => {
            const summary = tierSummary(tier);
            if (!summary.total) return null;
            const isGreen = summary.failed === 0 && summary.exception === 0;
            return (
              <tr key={tier}>
                <td className="text-end" style={{ width: '30%' }}>
                  <h6>tier {tier}</h6>
                </td>
                <td style={{ width: '20%' }}>
                  <h6 style={{ color: isGreen ? 'green' : 'red' }}>
                    {isGreen ? 'yes' : 'no'}
                  </h6>
                </td>
                <td>
                  {Object.keys(statusColor).map(state => {
                    const count = summary[state] || 0;
                    if (!count) return null;
                    return (
                      <Button
                        key={state}
                        style={{ marginLeft: '0.3em' }}
                        variant="outline-secondary"
                        size="sm">
                        <FontAwesomeIcon
                          className={['pending', 'running'].includes(state) ? 'fa-sm fa-spin' : 'fa-sm'}
                          icon={statusIcon[state]}
                          color={statusColor[state]} />
                        &nbsp;
                        <Badge bg="secondary">{count}</Badge>
                      </Button>
                    );
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {tiers.map(tier => {
        const suites = Object.keys(tasksByTier[tier] || {});
        if (!suites.length) return null;
        return (
          <div key={tier}>
            <h2 className="text-muted text-center">tier {tier}</h2>
            <Table striped size="sm">
              <thead>
                <tr>
                  <th className="text-muted text-end">suite</th>
                  {activePools.map(pool => (
                    <th key={pool} className="text-muted text-center" style={{ fontSize: '0.75em' }}>
                      {pool.split('/')[1]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {suites.map(suite => {
                  const hasAnyTasks = activePools.some(
                    pool => (tasksByTier[tier][suite][pool] || []).length > 0
                  );
                  if (!hasAnyTasks) return null;
                  return (
                    <tr key={suite}>
                      <td className="text-end" style={{ fontSize: '0.85em' }}>{suite}</td>
                      {activePools.map(pool => {
                        const poolTasks = tasksByTier[tier][suite][pool] || [];
                        return (
                          <td key={pool} className="text-center">
                            {poolTasks.slice(-5).map(task => (
                              <a
                                key={task.taskId}
                                href={`${TC_BASE}/tasks/${task.taskId}`}
                                target="_blank"
                                rel="noreferrer"
                                title={`${pushMap[task.taskGroupId]?.user?.split('@')[0] || '?'} (push ${pushMap[task.taskGroupId]?.pushId || '?'})\npushed: ${pushMap[task.taskGroupId] ? moment(pushMap[task.taskGroupId].date * 1000).toISOString() : '?'}\nresolved: ${task.resolved || 'pending'}`}>
                                <FontAwesomeIcon
                                  style={{ margin: '0 1px' }}
                                  className={['pending', 'running'].includes(task.state) ? 'fa-sm fa-spin' : 'fa-sm'}
                                  icon={statusIcon[task.state] || 'circle-question'}
                                  color={statusColor[task.state] || 'gray'} />
                              </a>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        );
      })}

      <Form onSubmit={e => e.preventDefault()}>
        <Row>
          <Col xs lg="3">
            <Form.Group>
              <Form.Label>number of recent autoland pushes</Form.Label>
              <Form.Control
                type="number"
                value={pushCount}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  if (val > 0 && val <= 20) setPushCount(val);
                }} />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      <ul>
        <li>
          status legend:
          {Object.keys(statusColor).map(state => (
            <div key={state}>
              <FontAwesomeIcon
                style={{ margin: '0 1px' }}
                className={['pending', 'running'].includes(state) ? 'fa-sm fa-spin' : 'fa-sm'}
                icon={statusIcon[state]}
                color={statusColor[state]} />
              &nbsp;{state}
            </div>
          ))}
        </li>
        <li className="text-muted">
          results are fetched from the last {pushCount} autoland pushes, filtered to windows azure worker pools, and grouped by treeherder tier.
        </li>
        <li className="text-muted">
          task status icons in the detail tables are limited to the five most recent runs per suite and pool.
        </li>
        <li>
          the code for this github page is hosted at: <a href="https://github.com/mozilla-platform-ops/are-we-green-on-azure-yet">github.com/mozilla-platform-ops/are-we-green-on-azure-yet</a>.
        </li>
      </ul>
    </Container>
  );
}

export default App;
