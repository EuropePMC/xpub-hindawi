import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Spinner, th } from '@pubsweet/ui'
import styled, { withTheme } from 'styled-components'
import { DropTarget } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import { compose, getContext, withHandlers, withState } from 'recompose'
import { SortableList } from 'pubsweet-components-faraday/src/components'

import FileItem from './FileItem'
import FilePicker from './FilePicker'

const DragHandle = withTheme(({ theme }) => (
  <Handle>
    <Icon color={theme.colorPrimary} size={3}>
      chevron_up
    </Icon>
    <Icon color={theme.colorPrimary} size={3}>
      menu
    </Icon>
    <Icon color={theme.colorPrimary} size={3}>
      chevron_down
    </Icon>
  </Handle>
))

const FileSection = ({
  error,
  title,
  files,
  listId,
  isOver,
  isLast,
  isFirst,
  addFile,
  canDrop,
  moveItem,
  theme,
  isFileOver,
  removeFile,
  connectFileDrop,
  connectDropTarget,
  allowedFileExtensions,
  isFetching,
  canDropFile,
  disabledFilepicker,
  dropSortableFile,
  previewFile,
}) => (
  <DropSection
    innerRef={instance => {
      connectFileDrop(instance)
      connectDropTarget(instance)
    }}
    isFirst={isFirst}
    isLast={isLast}
    over={isFileOver || (isOver && canDrop)}
  >
    <Header>
      <PickerContainer data-test={`upload-${listId}`}>
        <Title>{title}</Title>
        {!isFetching[listId] ? (
          <FilePicker
            allowedFileExtensions={allowedFileExtensions}
            disabled={disabledFilepicker()}
            onUpload={addFile}
          >
            <UploadButton
              data-test={`button-upload-${listId}`}
              disabled={disabledFilepicker()}
            >
              <Icon
                color={
                  disabledFilepicker()
                    ? theme.colorSecondary
                    : theme.colorPrimary
                }
              >
                file-plus
              </Icon>
            </UploadButton>
          </FilePicker>
        ) : (
          <Spinner />
        )}
      </PickerContainer>
      <Error>{error}</Error>
    </Header>
    <SortableList
      beginDragProps={['id', 'index', 'name', 'listId']}
      dragHandle={DragHandle}
      dropItem={dropSortableFile}
      items={files}
      listId={listId}
      listItem={FileItem}
      moveItem={moveItem}
      previewFile={previewFile}
      removeFile={removeFile}
    />
    <InfoContainer>
      <span>Drag files here or use the add button.</span>
    </InfoContainer>
  </DropSection>
)

export default compose(
  withTheme,
  getContext({
    isFetching: PropTypes.object,
  }),
  withState('error', 'setError', ''),
  withHandlers({
    clearError: ({ setError }) => () => {
      setError(e => '')
    },
  }),
  withHandlers({
    setError: ({ setError, clearError }) => err => {
      setError(e => err, () => setTimeout(clearError, 3000))
    },
    disabledFilepicker: ({ files, maxFiles }) => () => files.length >= maxFiles,
  }),
  DropTarget(
    'item',
    {
      drop(
        {
          changeList,
          listId: toListId,
          maxFiles,
          files,
          setError,
          allowedFileExtensions,
        },
        monitor,
      ) {
        const { listId: fromListId, id, name } = monitor.getItem()
        const fileExtention = name.split('.')[1]

        if (
          allowedFileExtensions &&
          !allowedFileExtensions.includes(fileExtention)
        ) {
          setError('Invalid file type.')
          return
        }

        if (files.length >= maxFiles) {
          setError('No more files can be added to this section.')
          return
        }
        if (toListId === fromListId) return
        changeList(fromListId, toListId, id)
      },
      canDrop({ listId: toListId, setError }, monitor) {
        const { listId: fromListId } = monitor.getItem()
        return toListId !== fromListId
      },
    },
    (connect, monitor) => ({
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  ),
  DropTarget(
    NativeTypes.FILE,
    {
      drop(
        { files, maxFiles, addFile, allowedFileExtensions, setError },
        monitor,
      ) {
        const [file] = monitor.getItem().files
        const fileExtention = file.name.split('.')[1]

        if (files.length >= maxFiles) {
          setError('No more files can be added to this section.')
          return
        }

        if (
          allowedFileExtensions &&
          !allowedFileExtensions.includes(fileExtention)
        ) {
          setError('Invalid file type.')
        } else {
          addFile(file)
        }
      },
    },
    (connect, monitor) => ({
      connectFileDrop: connect.dropTarget(),
      isFileOver: monitor.isOver(),
      canDropFile: monitor.canDrop(),
    }),
  ),
)(FileSection)

// #region styles
const Error = styled.span`
  color: ${th('colorError')};
  font-size: ${th('fontSizeBaseSmall')};
  margin-right: ${th('subGridUnit')};
`

const UploadButton = styled.div`
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  margin-left: ${th('subGridUnit')};
`

const PickerContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
`

const Title = styled.span`
  margin: ${th('subGridUnit')};
  text-transform: uppercase;
`

const Header = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
`

const DropSection = styled.div`
  border: ${th('borderDefault')};
  border-top: ${({ isFirst, theme }) =>
    isFirst ? theme.borderDefault : 'none'};
  border-bottom: ${({ isLast, theme }) =>
    isLast ? theme.borderDefault : `1px dashed ${theme.colorBorder}`};
  background-color: ${({ theme, over }) =>
    over ? theme.colorSecondary : theme.backgroundColorReverse};
  display: flex;
  flex-direction: column;
  padding: ${th('subGridUnit')};
`

const Handle = styled.div`
  align-items: center;
  border-right: ${th('borderDefault')};
  cursor: move;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: calc(${th('subGridUnit')}*2);
  padding: calc(${th('subGridUnit')}/2);
  span {
    padding: 0;
  }
`

const InfoContainer = styled.div`
  align-items: center;
  display: flex;
  height: 60px;
  justify-content: center;
  margin: calc(${th('subGridUnit')}*2) 0;

  span {
    color: ${th('colorTextPlaceholder')};
    font-size: ${th('fontSizeBaseSmall')};
  }
`
// #endregion
