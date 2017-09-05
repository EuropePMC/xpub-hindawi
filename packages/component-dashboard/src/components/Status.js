import React from 'react'
import classes from './Status.local.css'

const labels = {
  new: 'Unsubmitted',
  submitted: 'Submitted',
  accepted: 'Accepted',
  assignedToEditor: 'Assigned to editor',
  assigningReviewers: 'Assigning reviewers'
}

const Status = ({ status }) => (
  <div className={classes.root}>
    {labels[status] || 'Unsubmitted'}
  </div>
)

export default Status
