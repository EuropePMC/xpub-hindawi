import React from 'react'
import { get } from 'lodash'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { change as changeForm } from 'redux-form'
import {
  compose,
  lifecycle,
  withState,
  getContext,
  withContext,
  withHandlers,
} from 'recompose'
import { SortableList } from 'pubsweet-components-faraday/src/components'

import FileSection from './FileSection'
import classes from './Files.local.scss'

import {
  uploadFile,
  deleteFile,
  getRequestStatus,
  getSignedUrl,
  getFileError,
} from '../../redux/files'

const Files = ({
  files,
  addFile,
  moveItem,
  removeFile,
  changeList,
  dropSortableFile,
  previewFile,
  error,
  ...rest
}) => (
  <div>
    {error && (
      <div
        className={classnames({
          [classes['error-container']]: true,
          [classes.hidden]: !error,
        })}
      >
        Error uploading file, please try again.
      </div>
    )}
    <FileSection
      addFile={addFile('manuscripts')}
      allowedFileExtensions={['pdf', 'doc', 'docx']}
      changeList={changeList}
      dropSortableFile={dropSortableFile}
      files={get(files, 'manuscripts') || []}
      isFirst
      listId="manuscripts"
      maxFiles={Number.POSITIVE_INFINITY}
      moveItem={moveItem('manuscripts')}
      previewFile={previewFile}
      removeFile={removeFile('manuscripts')}
      title="Main manuscript"
    />
    <FileSection
      addFile={addFile('supplementary')}
      changeList={changeList}
      dropSortableFile={dropSortableFile}
      files={get(files, 'supplementary') || []}
      listId="supplementary"
      maxFiles={Number.POSITIVE_INFINITY}
      moveItem={moveItem('supplementary')}
      previewFile={previewFile}
      removeFile={removeFile('supplementary')}
      title="Supplementarry files"
    />
    <FileSection
      addFile={addFile('coverLetter')}
      allowedFileExtensions={['pdf', 'doc', 'docx']}
      changeList={changeList}
      dropSortableFile={dropSortableFile}
      files={get(files, 'coverLetter') || []}
      isLast
      listId="coverLetter"
      maxFiles={1}
      moveItem={moveItem('coverLetter')}
      previewFile={previewFile}
      removeFile={removeFile('coverLetter')}
      title="Cover letter"
    />
  </div>
)

export default compose(
  withRouter,
  getContext({ version: PropTypes.object, project: PropTypes.object }),
  connect(
    state => ({
      isFetching: getRequestStatus(state),
      error: getFileError(state),
    }),
    {
      changeForm,
      uploadFile,
      deleteFile,
      getSignedUrl,
    },
  ),
  withState('files', 'setFiles', {
    manuscripts: [],
    coverLetter: [],
    supplementary: [],
  }),
  lifecycle({
    componentDidMount() {
      const { version: { files }, setFiles } = this.props
      setFiles(prev => ({
        manuscripts: get(files, 'manuscripts') || [],
        coverLetter: get(files, 'coverLetter') || [],
        supplementary: get(files, 'supplementary') || [],
      }))
    },
  }),
  withHandlers({
    previewFile: ({ getSignedUrl }) => fileId => e => {
      e.preventDefault()
      getSignedUrl(fileId).then(({ signedUrl }) => {
        window.open(signedUrl)
      })
    },
    dropSortableFile: ({ files, setFiles, changeForm }) => () => {
      setFiles(files)
      changeForm('wizard', 'files', files)
    },
    changeList: ({ files, setFiles, changeForm }) => (
      fromListId,
      toListId,
      id,
    ) => {
      const swappedFile = files[fromListId].find(f => f.id === id)

      const fromFiles = files[fromListId].filter(f => f.id !== id)
      const toFiles = [...files[toListId], swappedFile]

      const newFiles = {
        ...files,
        [toListId]: toFiles,
        [fromListId]: fromFiles,
      }
      setFiles(newFiles)
      changeForm('wizard', 'files', files)
    },
    addFile: ({
      files,
      uploadFile,
      setFiles,
      changeForm,
      version,
    }) => type => file => {
      uploadFile(file, type, version.id)
        .then(file => {
          const newFiles = {
            ...files,
            [type]: [...files[type], file],
          }
          setFiles(newFiles)
          changeForm('wizard', 'files', newFiles)
        })
        .catch(e => console.error(`Couldn't upload file.`, e))
    },
    moveItem: ({ moveFiles, files, setFiles }) => type => (
      dragIndex,
      hoverIndex,
    ) => {
      const newFiles = {
        ...files,
        [type]: SortableList.moveItem(files[type], dragIndex, hoverIndex),
      }
      setFiles(newFiles)
    },
    removeFile: ({
      setFiles,
      changeForm,
      files,
      deleteFile,
      version,
    }) => type => id => e => {
      e.preventDefault()
      deleteFile(id)
      const newFiles = {
        ...files,
        [type]: files[type].filter(f => f.id !== id),
      }
      setFiles(newFiles, type)
      changeForm('wizard', 'files', files)
    },
  }),
  withContext(
    {
      isFetching: PropTypes.object,
    },
    ({ isFetching }) => ({
      isFetching,
    }),
  ),
)(Files)
