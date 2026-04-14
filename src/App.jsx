import { useEffect, useState } from 'react'

const TREEHERDER = 'https://treeherder.mozilla.org'

const RESULT_COLORS = {
  success: 'dot-success',
  testfailed: 'dot-testfailed',
  busted: 'dot-busted',
  exception: 'dot-exception',
  retry: 'dot-retry',
  usercancel: 'dot-usercancel',
  superseded: 'dot-superseded',
  unknown: 'dot-unknown'
}

const RESULT_LABELS = [
  'success', 'testfailed', 'busted', 'exception',
  'retry', 'usercancel', 'superseded'
]

// Azure test platforms in Treeherder start with "windows1" (e.g.
// windows11-64-24h2, windows10-64-2009). Build platforms use
// "windows2012-*" (Windows Server 2022 build workers) and hardware
// perf pools use entirely different platform names.
const AZURE_TEST_PLATFORM_RE = /^windows1/

function resultFromJob(job) {
  if (job.state !== 'completed') return job.state
  return job.result || 'unknown'
}

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() / 1000) - timestamp)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [statusMsg, setStatusMsg] = useState('')
  const [hasErrors, setHasErrors] = useState(false)
  const [jobs, setJobs] = useState([])
  const [pushCount, setPushCount] = useState(20)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    setJobs([])
    setHasErrors(false)
    setIsLoading(true)
    setStatusMsg('fetching autoland pushes...')

    async function fetchData() {
      try {
        const pushRes = await fetch(
          `${TREEHERDER}/api/project/autoland/push/?count=${pushCount}`,
          { signal: controller.signal }
        )
        if (!pushRes.ok) throw new Error(`push API returned ${pushRes.status}`)
        const pushData = await pushRes.json()
        const fetchedPushes = pushData.results
        if (cancelled) return
        setStatusMsg(`fetched ${fetchedPushes.length} pushes, loading jobs...`)

        let failedPushes = 0
        const allJobs = await Promise.all(
          fetchedPushes.map(async (push) => {
            const pushJobs = []
            let page = 1
            let hasMore = true
            let pushFailed = false
            while (hasMore && !cancelled) {
              try {
                const res = await fetch(
                  `${TREEHERDER}/api/project/autoland/jobs/` +
                  `?push_id=${push.id}&count=2000&page=${page}&state=completed`,
                  { signal: controller.signal }
                )
                if (!res.ok) {
                  pushFailed = true
                  break
                }
                const data = await res.json()
                pushJobs.push(
                  ...data.results
                    .filter(j =>
                      AZURE_TEST_PLATFORM_RE.test(j.platform) &&
                      j.state === 'completed'
                    )
                    .map(j => ({
                      id: j.id,
                      pushId: push.id,
                      pushRevision: push.revision,
                      pushTimestamp: push.push_timestamp,
                      pushAuthor: push.author,
                      name: j.job_type_name,
                      groupName: j.job_group_name,
                      suite: j.job_group_name,
                      platform: j.platform,
                      tier: j.tier,
                      result: resultFromJob(j),
                      endTimestamp: j.end_timestamp
                    }))
                )
                hasMore = data.results.length === 2000
                page++
              } catch (err) {
                if (err.name === 'AbortError') return pushJobs
                console.error(
                  `jobs fetch failed for push ${push.id}:`, err
                )
                pushFailed = true
                hasMore = false
              }
            }
            if (pushFailed) failedPushes++
            return pushJobs
          })
        )

        if (cancelled) return

        const flatJobs = allJobs.flat()
        const incomplete = failedPushes > 0
        setHasErrors(incomplete)
        setJobs(flatJobs)

        if (!flatJobs.length) {
          setStatusMsg('no azure windows jobs found in recent pushes')
        } else if (incomplete) {
          setStatusMsg(
            `loaded ${flatJobs.length} azure windows jobs from ` +
            `${fetchedPushes.length} pushes ` +
            `(${failedPushes} push(es) had fetch errors — data may be incomplete)`
          )
        } else {
          setStatusMsg(
            `loaded ${flatJobs.length} azure windows jobs from ` +
            `${fetchedPushes.length} pushes`
          )
        }
      } catch (err) {
        if (cancelled || err.name === 'AbortError') return
        console.error('fetchData failed:', err)
        setHasErrors(true)
        setStatusMsg(`error: ${err.message}`)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchData()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [pushCount])

  const tiers = [1, 2, 3]
  const platforms = [...new Set(jobs.map(j => j.platform))].sort()

  const jobsByTier = {}
  for (const tier of tiers) {
    const tierJobs = jobs.filter(j => j.tier === tier)
    const suites = [...new Set(tierJobs.map(j => j.suite))].sort()
    jobsByTier[tier] = {}
    for (const suite of suites) {
      jobsByTier[tier][suite] = {}
      for (const plat of platforms) {
        jobsByTier[tier][suite][plat] = tierJobs
          .filter(j => j.suite === suite && j.platform === plat)
          .sort((a, b) => (a.endTimestamp || 0) - (b.endTimestamp || 0))
      }
    }
  }

  function tierSummary(tier) {
    const tierJobs = jobs.filter(j => j.tier === tier)
    if (!tierJobs.length) return null
    const counts = {}
    for (const j of tierJobs) {
      counts[j.result] = (counts[j.result] || 0) + 1
    }
    return { total: tierJobs.length, ...counts }
  }

  function tierFailures(tier) {
    const failed = jobs.filter(
      j => j.tier === tier &&
        (j.result === 'testfailed' || j.result === 'busted')
    )
    if (!failed.length) return []
    const grouped = {}
    for (const j of failed) {
      const key = `${j.suite}\t${j.platform}`
      if (!grouped[key]) {
        grouped[key] = {
          suite: j.suite,
          platform: j.platform,
          count: 0,
          busted: 0,
          latest: j
        }
      }
      grouped[key].count++
      if (j.result === 'busted') grouped[key].busted++
      if (j.endTimestamp > grouped[key].latest.endTimestamp) {
        grouped[key].latest = j
      }
    }
    return Object.values(grouped).sort((a, b) => b.count - a.count)
  }

  return (
    <>
      <h1>is the grass greener on the azure side?</h1>
      <p className="subtitle">
        azure windows test results from the last {pushCount} autoland pushes
      </p>
      {isLoading && <div className="spinner" />}
      {statusMsg && (
        <p className={`status-msg${hasErrors ? ' status-error' : ''}`}>
          {statusMsg}
        </p>
      )}

      <h2>tl;dr</h2>
      <table className="summary-table">
        <tbody>
          {tiers.map(tier => {
            const summary = tierSummary(tier)
            if (!summary) return null
            const passed = summary.success || 0
            const nonSuccess = summary.total - passed
            const pct = Math.round((passed / summary.total) * 100)
            const isGreen = passed > 0 && nonSuccess === 0
            return (
              <tr key={tier}>
                <td className="tier-label">tier {tier}</td>
                <td className="tier-status">
                  <strong style={{ color: isGreen ? '#2ea44f' : '#d73a49' }}>
                    {pct}%
                  </strong>
                </td>
                <td>
                  <span className="count-detail">
                    {passed} passed
                    {nonSuccess > 0 && (
                      <>, <span style={{ color: '#d73a49' }}>{nonSuccess} non-passing</span></>
                    )}
                    {' '}/ {summary.total} total
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {!isLoading && jobs.length > 0 && tiers.some(t => tierFailures(t).length > 0) && (
        <>
          <h2>what's failing</h2>
          {tiers.map(tier => {
            const failures = tierFailures(tier)
            if (!failures.length) return null
            return (
              <div key={tier} className="failure-section">
                <h3>tier {tier}</h3>
                <table className="failure-table">
                  <thead>
                    <tr>
                      <th>suite</th>
                      <th>platform</th>
                      <th>failures</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failures.map(f => (
                      <tr key={`${f.suite}-${f.platform}`}>
                        <td>{f.suite}</td>
                        <td>{f.platform}</td>
                        <td>
                          <a
                            href={
                              `${TREEHERDER}/jobs?repo=autoland` +
                              `&revision=${f.latest.pushRevision}` +
                              `&selectedTaskRun=${f.latest.id}-0`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="failure-count">
                            {f.count}{f.busted > 0 && ` (${f.busted} busted)`}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </>
      )}

      {tiers.map(tier => {
        const tierSuites = Object.keys(jobsByTier[tier] || {})
        if (!tierSuites.length) return null
        const tierPlatforms = platforms.filter(plat =>
          tierSuites.some(suite =>
            (jobsByTier[tier][suite][plat] || []).length > 0
          )
        )
        if (!tierPlatforms.length) return null
        return (
          <div key={tier}>
            <h2>tier {tier}</h2>
            <table className="detail-table">
              <thead>
                <tr>
                  <th>platform</th>
                  {tierSuites.map(suite => (
                    <th key={suite}>{suite}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tierPlatforms.map(plat => (
                  <tr key={plat}>
                    <td>{plat}</td>
                    {tierSuites.map(suite => {
                      const platJobs =
                        jobsByTier[tier][suite]?.[plat] || []
                      return (
                        <td key={suite}>
                          {platJobs.slice(-5).map(job => (
                            <a
                              key={job.id}
                              href={
                                `${TREEHERDER}/jobs?repo=autoland` +
                                `&revision=${job.pushRevision}` +
                                `&selectedTaskRun=${job.id}-0`
                              }
                              target="_blank"
                              rel="noreferrer"
                              title={
                                `${job.name}\n` +
                                `${job.pushAuthor?.split('@')[0] || '?'}` +
                                ` \u2014 ${timeAgo(job.pushTimestamp)}\n` +
                                `result: ${job.result}`
                              }>
                              <span className={
                                `dot ${RESULT_COLORS[job.result] || RESULT_COLORS.unknown}`
                              } />
                            </a>
                          ))}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}

      <div className="config">
        <label htmlFor="pushCount">
          number of recent autoland pushes
        </label>
        <input
          id="pushCount"
          type="number"
          value={pushCount}
          onChange={e => {
            const val = parseInt(e.target.value)
            if (val > 0 && val <= 50) setPushCount(val)
          }}
        />
      </div>

      <ul className="footer">
        <li>
          <div className="legend">
            {RESULT_LABELS.map(result => (
              <span key={result} className="legend-item">
                <span className={`dot ${RESULT_COLORS[result]}`} />
                {' '}{result}
              </span>
            ))}
          </div>
        </li>
        <li>
          results are fetched via the{' '}
          <a href="https://treeherder.mozilla.org">treeherder</a> API,
          filtered to azure test platforms (Treeherder platforms matching
          windows10-* and windows11-*, excluding windows2012-* build
          workers), and grouped by tier.
        </li>
        <li>
          status icons are limited to the five most recent completed
          runs per suite and platform.
        </li>
        <li>
          source:{' '}
          <a href="https://github.com/mozilla-platform-ops/are-we-green-on-azure-yet">
            github.com/mozilla-platform-ops/are-we-green-on-azure-yet
          </a>
        </li>
      </ul>
    </>
  )
}
