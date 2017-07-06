import React from 'react'
import PropTypes from 'prop-types'
import './Project.css'
import { Link } from 'react-router'
import ProjectActions from './ProjectActions'

const Project = ({ children, project }) => (
  <div>
    <div className="project-title content-text">
      <Link to={`/projects/${project.id}`}>{project.title}</Link>
    </div>

    {children}
  </div>
)

Project.propTypes = {
  children: PropTypes.node,
  project: PropTypes.object.isRequired
}

export default Project
