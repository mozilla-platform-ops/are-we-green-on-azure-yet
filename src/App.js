import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const icon = {
  completed: 'check-circle',
  failed: 'times-circle',
  exception: 'exclamation-circle',
  pending: 'spinner',
  running: 'play-circle'
};
const color = {
  completed: 'green',
  failed: 'red',
  exception: 'amber',
  pending: 'gray',
  running: 'blue'
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [pools, setPools] = useState([
    'gecko-t/win7-32-azure',
    'gecko-t/win7-32-gpu-azure',
    'gecko-t/win10-64-azure',
    'gecko-t/win10-64-gpu-azure'
  ]);
  const [groups, setGroups] = useState([
    'cq_jFOOGTryTs8Q3VoO9kg',
    'YAzpJW1sSAaGZ0NKw4tHCw',
    'S8UhCdtwSfS7ciycZFViIQ'
  ]);
  const [tasks, setTasks] = useState([]);
  const [testSuiteResults, setTestSuiteResults] = useState({});
  
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
  }, [pools, tasks]);

  return (
    <Container>
      <h1>are we green on azure yet?</h1>
      <Table striped size="sm">
        <thead>
          <tr>
            <th className="text-muted text-right">
              suite
            </th>
            {
              pools.map(pool => (
                <th className="text-muted text-center">
                  {pool.split('/')[1].replace('-azure', '')}
                </th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(testSuiteResults).map(suite => (
              <tr>
                <td className="text-right">{suite}</td>
                {
                  pools.map(pool => (
                    <td className="text-center">
                      {
                        testSuiteResults[suite][pool].map(task => (
                          <a href={`https://firefox-ci-tc.services.mozilla.com/tasks/${task.taskId}`} target="_blank">
                            <FontAwesomeIcon
                              className="fa-sm"
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
    </Container>
  );
}

export default App;
