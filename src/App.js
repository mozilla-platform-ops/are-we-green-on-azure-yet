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
  success: 'circle-check',
  testfailed: 'circle-xmark',
  busted: 'circle-xmark',
  exception: 'circle-exclamation',
  retry: 'rotate',
  usercancel: 'ban',
  superseded: 'forward',
  pending: 'spinner',
  running: 'gear',
  unknown: 'circle-question'
};
const statusColor = {
  success: 'green',
  testfailed: 'red',
  busted: 'darkred',
  exception: 'orange',
  retry: 'goldenrod',
  usercancel: 'gray',
  superseded: 'gray',
  pending: 'gray',
  running: 'darkgray',
  unknown: 'lightgray'
};

const TREEHERDER = 'https://treeherder.mozilla.org';

function resultFromJob(job) {
  if (job.state === 'pending') return 'pending';
  if (job.state === 'running') return 'running';
  return job.result || 'unknown';
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [jobs, setJobs] = useState([]);
  const [pushCount, setPushCount] = useState(5);

  useEffect(() => {
    setJobs([]);
    setIsLoading(true);
    setStatusMsg('fetching autoland pushes...');

    async function fetchData() {
      try {
        // get recent pushes
        const pushRes = await fetch(
          `${TREEHERDER}/api/project/autoland/push/?count=${pushCount}`
        );
        if (!pushRes.ok) throw new Error(`push API returned ${pushRes.status}`);
        const pushData = await pushRes.json();
        const fetchedPushes = pushData.results;
        setStatusMsg(`fetched ${fetchedPushes.length} pushes, loading jobs...`);

        // fetch jobs for each push in parallel
        const allJobs = await Promise.all(
          fetchedPushes.map(async (push) => {
            const pushJobs = [];
            let page = 1;
            let hasMore = true;
            while (hasMore) {
              try {
                const res = await fetch(
                  `${TREEHERDER}/api/project/autoland/jobs/?push_id=${push.id}&count=2000&page=${page}`
                );
                if (!res.ok) break;
                const data = await res.json();
                const windowsJobs = data.results
                  .filter(j => j.platform.startsWith('windows'))
                  .map(j => ({
                    id: j.id,
                    pushId: push.id,
                    pushRevision: push.revision,
                    pushTimestamp: push.push_timestamp,
                    pushAuthor: push.author,
                    name: j.job_type_name,
                    suite: j.job_group_name,
                    symbol: j.job_type_symbol,
                    platform: j.platform,
                    tier: j.tier,
                    result: resultFromJob(j),
                    state: j.state,
                    endTimestamp: j.end_timestamp
                  }));
                pushJobs.push(...windowsJobs);
                hasMore = data.results.length === 2000;
                page++;
              } catch (err) {
                console.error(`failed to fetch jobs for push ${push.id} page ${page}:`, err);
                hasMore = false;
              }
            }
            return pushJobs;
          })
        );

        const flatJobs = allJobs.flat();
        setJobs(flatJobs);
        setStatusMsg(flatJobs.length
          ? `loaded ${flatJobs.length} windows jobs from ${fetchedPushes.length} pushes`
          : 'no windows jobs found in recent pushes'
        );
      } catch (err) {
        console.error('fetchData failed:', err);
        setStatusMsg(`error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [pushCount]);

  const tiers = [1, 2, 3];

  // group jobs: tier → suite → platform → jobs[]
  const platforms = [...new Set(jobs.map(j => j.platform))].sort();
  const jobsByTier = {};
  for (const tier of tiers) {
    const tierJobs = jobs.filter(j => j.tier === tier);
    const suites = [...new Set(tierJobs.map(j => j.suite))].sort();
    jobsByTier[tier] = {};
    for (const suite of suites) {
      jobsByTier[tier][suite] = {};
      for (const plat of platforms) {
        jobsByTier[tier][suite][plat] = tierJobs
          .filter(j => j.suite === suite && j.platform === plat)
          .sort((a, b) => (a.endTimestamp || 0) - (b.endTimestamp || 0));
      }
    }
  }

  function tierSummary(tier) {
    const tierJobs = jobs.filter(j => j.tier === tier);
    if (!tierJobs.length) return { total: 0 };
    const counts = {};
    for (const j of tierJobs) {
      counts[j.result] = (counts[j.result] || 0) + 1;
    }
    return { total: tierJobs.length, ...counts };
  }

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
      {statusMsg && (
        <p className="text-muted text-center" style={{ fontSize: '0.85em' }}>
          {statusMsg}
        </p>
      )}

      <h2 className="text-muted text-center">tl;dr</h2>
      <Table>
        <tbody>
          {tiers.map(tier => {
            const summary = tierSummary(tier);
            if (!summary.total) return null;
            const failures = (summary.testfailed || 0) + (summary.busted || 0) + (summary.exception || 0);
            const isGreen = failures === 0;
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
                  {Object.keys(statusColor).map(result => {
                    const count = summary[result] || 0;
                    if (!count) return null;
                    return (
                      <Button
                        key={result}
                        style={{ marginLeft: '0.3em' }}
                        variant="outline-secondary"
                        size="sm">
                        <FontAwesomeIcon
                          className={['pending', 'running'].includes(result) ? 'fa-sm fa-spin' : 'fa-sm'}
                          icon={statusIcon[result]}
                          color={statusColor[result]} />
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
        const suites = Object.keys(jobsByTier[tier] || {});
        if (!suites.length) return null;
        const tierPlatforms = platforms.filter(plat =>
          suites.some(suite => (jobsByTier[tier][suite][plat] || []).length > 0)
        );
        if (!tierPlatforms.length) return null;
        return (
          <div key={tier}>
            <h2 className="text-muted text-center">tier {tier}</h2>
            <Table striped size="sm">
              <thead>
                <tr>
                  <th className="text-muted text-end">suite</th>
                  {tierPlatforms.map(plat => (
                    <th key={plat} className="text-muted text-center" style={{ fontSize: '0.75em' }}>
                      {plat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {suites.map(suite => {
                  const hasJobs = tierPlatforms.some(
                    plat => (jobsByTier[tier][suite][plat] || []).length > 0
                  );
                  if (!hasJobs) return null;
                  return (
                    <tr key={suite}>
                      <td className="text-end" style={{ fontSize: '0.85em' }}>{suite}</td>
                      {tierPlatforms.map(plat => {
                        const platJobs = jobsByTier[tier][suite][plat] || [];
                        return (
                          <td key={plat} className="text-center">
                            {platJobs.slice(-5).map(job => (
                              <a
                                key={job.id}
                                href={`${TREEHERDER}/jobs?repo=autoland&revision=${job.pushRevision}&selectedTaskRun=${job.id}-0`}
                                target="_blank"
                                rel="noreferrer"
                                title={`${job.name}\n${job.pushAuthor?.split('@')[0] || '?'}\npushed: ${moment(job.pushTimestamp * 1000).fromNow()}\nresult: ${job.result}`}>
                                <FontAwesomeIcon
                                  style={{ margin: '0 1px' }}
                                  className={['pending', 'running'].includes(job.result) ? 'fa-sm fa-spin' : 'fa-sm'}
                                  icon={statusIcon[job.result] || statusIcon.unknown}
                                  color={statusColor[job.result] || statusColor.unknown} />
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
          {Object.entries(statusColor).map(([result, color]) => (
            <div key={result}>
              <FontAwesomeIcon
                style={{ margin: '0 1px' }}
                className={['pending', 'running'].includes(result) ? 'fa-sm fa-spin' : 'fa-sm'}
                icon={statusIcon[result]}
                color={color} />
              &nbsp;{result}
            </div>
          ))}
        </li>
        <li className="text-muted">
          results are fetched from the last {pushCount} autoland pushes via the treeherder API, filtered to windows platforms, and grouped by tier.
        </li>
        <li className="text-muted">
          task status icons in the detail tables are limited to the five most recent runs per suite and platform.
        </li>
        <li>
          the code for this github page is hosted at: <a href="https://github.com/mozilla-platform-ops/are-we-green-on-azure-yet">github.com/mozilla-platform-ops/are-we-green-on-azure-yet</a>.
        </li>
      </ul>
    </Container>
  );
}

export default App;
