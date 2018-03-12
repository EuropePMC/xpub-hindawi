import React from 'react'
import { get } from 'lodash'
import PropTypes from 'prop-types'
import { Button, Icon, th } from '@pubsweet/ui'
import styled, { css } from 'styled-components'
import { compose, getContext, withHandlers } from 'recompose'
import {
  withModal,
  ConfirmationModal,
} from 'pubsweet-component-modal/src/components'

import { parseVersion, parseJournalIssue } from './utils'

import ZipFiles from './ZipFiles'

const DashboardCard = ({
  deleteProject,
  history,
  project,
  version,
  showAbstractModal,
  journal,
  cancelSubmission,
  ...rest
}) => {
  const { submitted, title, type } = parseVersion(version)
  const status = get(project, 'status') || 'Draft'
  const metadata = get(version, 'metadata')
  const files = get(version, 'files')
  const customId = project.customId || project.id.split('-')[0]
  const hasFiles = files ? Object.values(files).some(f => f.length > 0) : false
  const journalIssueType = parseJournalIssue(journal, metadata)
  const manuscriptMeta = `${type} - ${
    journalIssueType ? journalIssueType.label : 'N/A'
  }`

  return version ? (
    <Card data-test={customId}>
      <ListView>
        <Top>
          <LeftDetails flex="5">
            <ManuscriptId>{`ID ${customId}`}</ManuscriptId>
            <Title
              title={title}
              dangerouslySetInnerHTML={{ __html: title }} // eslint-disable-line
            />
          </LeftDetails>
          <RightDetails flex="2">
            <ZipFiles disabled={!hasFiles} fragmentId={version.id}>
              <ClickableIcon disabled={!hasFiles}>
                <Icon>download</Icon>
              </ClickableIcon>
            </ZipFiles>
            {!project.status && (
              <ActionButtons
                data-test="button-resume-submission"
                onClick={() =>
                  history.push(
                    `/projects/${project.id}/versions/${version.id}/submit`,
                  )
                }
              >
                RESUME SUBMISSION
              </ActionButtons>
            )}
          </RightDetails>
        </Top>
        <Bottom>
          <LeftDetails flex="2">
            <Status>{status}</Status>
            <DateField>{submitted || ''}</DateField>
          </LeftDetails>
          <RightDetails flex="5">
            <ManuscriptType title={manuscriptMeta}>
              {manuscriptMeta}
            </ManuscriptType>
            {project.status ? (
              <Details
                data-test="button-details"
                onClick={() =>
                  history.push(
                    `/projects/${project.id}/versions/${version.id}/manuscript`,
                  )
                }
              >
                Details
                <Icon color="#667080">chevron-right</Icon>
              </Details>
            ) : (
              <Details
                data-test="button-cancel-submission"
                onClick={cancelSubmission}
              >
                Cancel submission
              </Details>
            )}
          </RightDetails>
        </Bottom>
      </ListView>
      {project.status && (
        <DetailsView>
          <Top>
            <AuthorList>
              {version.authors.map(
                (
                  {
                    firstName,
                    lastName,
                    middleName,
                    email,
                    isSubmitting,
                    isCorresponding,
                  },
                  index,
                  arr,
                ) => (
                  <Author key={email}>
                    {isSubmitting && <AuthorStatus>SA</AuthorStatus>}
                    {isCorresponding &&
                      !isSubmitting && <AuthorStatus>CA</AuthorStatus>}
                    <AuthorName>
                      {firstName} {middleName} {lastName}
                    </AuthorName>
                    {arr.length - 1 === index ? '' : ','}
                  </Author>
                ),
              )}
            </AuthorList>
          </Top>
        </DetailsView>
      )}
    </Card>
  ) : null
}

export default compose(
  getContext({ journal: PropTypes.object }),
  withModal({
    modalComponent: ConfirmationModal,
  }),
  withHandlers({
    cancelSubmission: ({
      showModal,
      deleteProject,
      project,
      hideModal,
    }) => () => {
      const modalConfig = {
        onConfirm: () => {
          deleteProject(project)
          hideModal()
        },
        dismissable: false,
        title: 'Are you sure you want to delete the manuscript?',
        subtitle: 'This operation cannot be undone!',
      }
      showModal(modalConfig)
    },
  }),
)(DashboardCard)

// #region styled-components
const defaultText = css`
  color: ${th('colorText')};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeBaseSmall')};
`

const AuthorList = styled.span`
  ${defaultText};
  text-align: left;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`

const AuthorName = styled.span`
  text-decoration: underline;
  padding-left: 2px;
`
const Author = styled.div`
  padding-right: ${th('subGridUnit')};
`

const AuthorStatus = styled.span`
  border: ${th('borderDefault')};
  ${defaultText};
  text-align: center;
  text-transform: uppercase;
  padding: 0 2px;
`

const ActionButtons = styled(Button)`
  ${defaultText};
  align-items: center;
  background-color: ${th('colorPrimary')};
  color: ${th('colorTextReverse')};
  display: flex;
  padding: 4px 8px;
  text-align: center;
  height: calc(${th('subGridUnit')}*5);
`

const LeftDetails = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex: ${({ flex }) => flex || 1};
  max-width: 75%;
`

const RightDetails = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  flex: ${({ flex }) => flex || 1};
  max-width: 75%;
`

const DetailsView = styled.div`
  align-items: center;
  border-top: ${th('borderDefault')};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`

const ListView = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
`

const ManuscriptId = styled.div`
  ${defaultText};
  margin-right: 8px;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
`

const Details = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  ${defaultText};
  margin-left: 16px;
  text-decoration: underline;
  text-align: center;
  text-transform: uppercase;
  white-space: nowrap;
`

const ClickableIcon = styled.div`
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  margin: 0 7px;

  svg {
    stroke: ${({ disabled, theme }) =>
      disabled ? theme.colorBackgroundHue : theme.colorPrimary};
  }
`

const Card = styled.div`
  align-items: center;
  border: ${th('borderDefault')};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-bottom: 10px;
  background-color: ${th('backgroundColorReverse')};
`

const Top = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
`
const Bottom = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0 10px 10px 10px;
  width: 100%;
  box-sizing: border-box;
  justify-content: space-between;
`

const ManuscriptType = styled.div`
  ${defaultText};
  padding: 6px 4px;
  margin-left: 10px;
  text-align: right;
  text-transform: capitalize;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`

const Title = styled.div`
  ${defaultText};
  font-family: ${th('fontHeading')};
  color: ${th('colorPrimary')};
  font-weight: bold;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`

const Status = styled.div`
  border: ${th('borderDefault')};
  ${defaultText};
  font-weight: bold;
  padding: 0.2em 0.5em;
  text-align: left;
  text-transform: uppercase;
`

const DateField = styled.span`
  ${defaultText};
  margin: 0 ${th('subGridUnit')};
  text-align: left;
`
// #endregion
