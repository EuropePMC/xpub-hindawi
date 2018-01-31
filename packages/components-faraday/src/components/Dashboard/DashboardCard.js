import React from 'react'
import { get, isEmpty } from 'lodash'
import classnames from 'classnames'
import { Button, Icon } from '@pubsweet/ui'

import { parseVersion, getFilesURL, downloadAll } from './utils'
import classes from './Dashboard.local.scss'

const DashboardCard = ({ project, listView, version }) => {
  const { submitted, author, title, type, version: vers } = parseVersion(
    version,
  )
  const files = getFilesURL(get(version, 'files'))
  const status = get(project, 'status') || 'Draft'
  const hasFiles = !isEmpty(files)

  return (
    <div className={classes.card}>
      <div className={classes.leftSide}>
        <div
          className={classes.title}
          dangerouslySetInnerHTML={{ __html: title }} // eslint-disable-line
        />

        <div className={classes.quickInfo}>
          <div className={classes.status}>{status}</div>
          <div className={classes.version}>{`v${vers} ${
            submitted ? `- updated on ${submitted}` : ''
          }`}</div>
        </div>
      </div>
      <div className={classes.rightSide}>
        <div
          className={classnames({
            [classes.disabled]: !hasFiles,
            [classes.pointer]: true,
          })}
          onClick={() => (hasFiles ? downloadAll(files) : null)}
        >
          <Icon>download</Icon>
        </div>

        <a href={`/projects/${project.id}/versions/${version.id}/submit`}>
          Details
        </a>
      </div>
      {!listView && (
        <div className={classes.expandedView}>
          <div className={classes.column3}>
            <div className={classes.column2}>
              <div>Submission author</div>
              <div>Abstract</div>
            </div>
            <div className={classes.column2}>
              <div>{author}</div>
              <a>View</a>
            </div>
          </div>
          <div className={classes.column3}>
            <div className={classes.column2}>
              <div>Submitted On</div>
              <div>Type</div>
            </div>
            <div className={classes.column2}>
              <div>{submitted}</div>
              <div>
                <span className={classes.status}>{type}</span>
              </div>
            </div>
          </div>
          <div className={classes.column3}>
            <div className={classes.column2}>
              <div>Handling Editor</div>
              <div>Reviewers</div>
            </div>
            <div className={classes.column2}>
              <Button className={classes.button} primary>
                Invite
              </Button>
              <Button className={classes.button} primary>
                Invite
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardCard