/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {
  useState,
  useMemo,
  useContext,
  useEffect,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import { Checkbox } from '@trussworks/react-uswds';
import { DECIMAL_BASE } from '@ttahub/common';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import GoalStatusDropdown from './components/GoalStatusDropdown';
import ContextMenu from '../ContextMenu';
import { DATE_DISPLAY_FORMAT } from '../../Constants';
import ObjectiveCard from './ObjectiveCard';
import FlagStatus from './FlagStatus';
import ExpanderButton from '../ExpanderButton';
import './GoalCard.scss';
import { goalPropTypes } from './constants';
import isAdmin, {
  hasApproveActivityReportInRegion,
  canEditOrCreateGoals,
} from '../../permissions';
import UserContext from '../../UserContext';
import { deleteGoal } from '../../fetchers/goals';
import AppLoadingContext from '../../AppLoadingContext';
import GoalStatusChangeAlert from './components/GoalStatusChangeAlert';
import useObjectiveStatusMonitor from '../../hooks/useObjectiveStatusMonitor';
import DataCard from '../DataCard';
import Tag from '../Tag';
import SpecialistTags from '../../pages/RecipientRecord/pages/Monitoring/components/SpecialistTags';

export const ObjectiveSwitch = ({
  objective,
  objectivesExpanded,
  regionId,
  goalStatus,
  dispatchStatusChange,
  isMonitoringGoal,
}) => (
  <ObjectiveCard
    objective={objective}
    objectivesExpanded={objectivesExpanded}
    goalStatus={goalStatus}
    regionId={regionId}
    dispatchStatusChange={dispatchStatusChange}
    isMonitoringGoal={isMonitoringGoal}
  />
);

ObjectiveSwitch.propTypes = {
  objective: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string,
  }).isRequired,
  objectivesExpanded: PropTypes.bool.isRequired,
  regionId: PropTypes.number.isRequired,
  goalStatus: PropTypes.string.isRequired,
  dispatchStatusChange: PropTypes.func.isRequired,
  isMonitoringGoal: PropTypes.bool.isRequired,
};

export default function GoalCard({
  goal,
  recipientId,
  regionId,
  showCloseSuspendGoalModal,
  showReopenGoalModal,
  performGoalStatusUpdate,
  handleGoalCheckboxSelect,
  isChecked,
  hideCheckbox,
  showReadOnlyStatus,
  hideGoalOptions,
  erroneouslySelected,
}) {
  const {
    id, // for keys and such, from the api
    ids, // all rolled up ids
    goalStatus,
    createdOn,
    goalText,
    objectiveCount,
    reasons,
    objectives,
    previousStatus,
    createdVia,
    collaborators,
    onAR,
    isReopenedGoal,
  } = goal;

  // Check for monitoring goal.
  const reasonsToMonitor = [...reasons];
  let isMonitoringGoal = false;
  if (goal.createdVia === 'monitoring') {
    reasonsToMonitor.push('Monitoring Goal');
    isMonitoringGoal = true;
  }

  const { user } = useContext(UserContext);
  const { setIsAppLoading } = useContext(AppLoadingContext);
  const [invalidStatusChangeAttempted, setInvalidStatusChangeAttempted] = useState();
  const sortedObjectives = [...objectives];
  sortedObjectives.sort((a, b) => (new Date(a.endDate) < new Date(b.endDate) ? 1 : -1));
  const hasEditButtonPermissions = canEditOrCreateGoals(
    user,
    parseInt(regionId, DECIMAL_BASE),
  );
  // eslint-disable-next-line max-len
  const { atLeastOneObjectiveIsNotCompletedOrSuspended, dispatchStatusChange } = useObjectiveStatusMonitor(objectives);

  useEffect(() => {
    if (
      invalidStatusChangeAttempted === true
      && !atLeastOneObjectiveIsNotCompletedOrSuspended
    ) {
      setInvalidStatusChangeAttempted(false);
    }
  }, [
    atLeastOneObjectiveIsNotCompletedOrSuspended,
    invalidStatusChangeAttempted,
  ]);

  const [deleteError, setDeleteError] = useState(false);
  const isMerged = createdVia === 'merge';

  const lastTTA = useMemo(
    () => objectives.reduce(
      (prev, curr) => (new Date(prev) > new Date(curr.endDate) ? prev : curr.endDate),
      '',
    ),
    [objectives],
  );
  const history = useHistory();

  const goalNumbers = `${goal.goalNumbers.join(', ')}${
    isReopenedGoal ? '-R' : ''
  }`;

  const editLink = `/recipient-tta-records/${recipientId}/region/${regionId}/goals?id[]=${ids.join(
    '&id[]=',
  )}`;
  const viewLink = `/recipient-tta-records/${recipientId}/region/${regionId}/goals/view?${ids
    .map((d) => `id[]=${d}`)
    .join('&')}`;

  const onUpdateGoalStatus = (newStatus) => {
    const statusesThatNeedObjectivesFinished = ['Closed', 'Suspended'];

    if (
      statusesThatNeedObjectivesFinished.includes(newStatus)
      && atLeastOneObjectiveIsNotCompletedOrSuspended
    ) {
      setInvalidStatusChangeAttempted(true);
      return;
    }
    setInvalidStatusChangeAttempted(false);
    if (
      newStatus === 'Completed'
      || newStatus === 'Closed'
      || newStatus === 'Ceased/Suspended'
      || newStatus === 'Suspended'
    ) {
      // Must provide reason for Close or Suspend.
      showCloseSuspendGoalModal(newStatus, ids, goalStatus);
    } else {
      performGoalStatusUpdate(ids, newStatus, goalStatus);
    }
  };

  const [objectivesExpanded, setObjectivesExpanded] = useState(false);

  const closeOrOpenObjectives = () => {
    setObjectivesExpanded(!objectivesExpanded);
  };

  const contextMenuLabel = `Actions for goal ${id}`;

  const menuItems = [];

  if (goalStatus === 'Closed' && hasEditButtonPermissions) {
    menuItems.push({
      label: 'Reopen',
      onClick: () => {
        showReopenGoalModal(id);
      },
    });
    menuItems.push({
      label: 'View',
      onClick: () => {
        history.push(viewLink);
      },
    });
  } else if (hasEditButtonPermissions) {
    menuItems.push({
      label: 'Edit',
      onClick: () => {
        history.push(editLink);
      },
    });
  } else {
    menuItems.push({
      label: 'View',
      onClick: () => {
        history.push(viewLink);
      },
    });
  }

  const canDeleteQualifiedGoals = (() => {
    if (isAdmin(user)) {
      return true;
    }

    return hasApproveActivityReportInRegion(
      user,
      parseInt(regionId, DECIMAL_BASE),
    );
  })();

  if (
    canDeleteQualifiedGoals
    && !onAR
    && ['Draft', 'Not Started'].includes(goalStatus)
  ) {
    menuItems.push({
      label: 'Delete',
      onClick: async () => {
        try {
          setDeleteError(false);
          setIsAppLoading(true);
          await deleteGoal(ids, regionId);
          history.push(
            `/recipient-tta-records/${recipientId}/region/${regionId}/rttapa`,
            { message: 'Goal deleted successfully' },
          );
        } catch (e) {
          setDeleteError(true);
        } finally {
          setIsAppLoading(false);
        }
      },
    });
  }

  const internalLeftMargin = hideCheckbox ? '' : 'desktop:margin-left-5';

  const getResponses = () => {
    const responses = goal.responses.length ? goal.responses[0].response : [];
    return responses.map((r) => r).join(', ');
  };

  const renderEnteredBy = () => {
    let specialists = [];

    if (isMonitoringGoal) {
      specialists = [
        {
          name: 'System-generated',
          roles: ['OHS'],
        },
      ];
    } else if (collaborators && collaborators.length > 0) {
      const creatorsWithName = collaborators.filter((c) => c.goalCreatorName);

      if (creatorsWithName.length > 0) {
        specialists = creatorsWithName.map((c) => {
          let roles = [];

          if (c.goalCreatorRoles) {
            // convert roles to array, handling different possible formats
            if (typeof c.goalCreatorRoles === 'string') {
              // e.g. "GS, ECS"
              roles = c.goalCreatorRoles.split(',').map((r) => r.trim());
            } else if (Array.isArray(c.goalCreatorRoles)) {
              // already an array
              roles = c.goalCreatorRoles;
            } else {
              // something else, try to flatten it
              roles = [c.goalCreatorRoles].flat().filter(Boolean);
            }
          }

          return {
            name: c.goalCreatorName,
            roles,
          };
        });
      }
    }

    return <SpecialistTags specialists={specialists} />;
  };

  return (
    <DataCard
      testId="goalCard"
      className="ttahub-goal-card"
      errorBorder={erroneouslySelected || deleteError}
    >
      <div className="display-flex flex-justify">
        <div className="display-flex flex-align-start flex-row">
          {!hideCheckbox && (
            <Checkbox
              id={`goal-select-${id}`}
              label=""
              value={id}
              checked={isChecked}
              onChange={handleGoalCheckboxSelect}
              aria-label={`Select goal ${goalText}`}
              className="margin-right-1"
              data-testid="selectGoalTestId"
            />
          )}
          <GoalStatusDropdown
            showReadOnlyStatus={showReadOnlyStatus}
            goalId={id}
            status={goalStatus}
            onUpdateGoalStatus={onUpdateGoalStatus}
            previousStatus={previousStatus || 'Not Started'} // Open the escape hatch!
            regionId={regionId}
          />
        </div>
        {!hideGoalOptions && (
          <ContextMenu
            label={contextMenuLabel}
            menuItems={menuItems}
            menuWidthOffset={100}
          />
        )}
      </div>
      <GoalStatusChangeAlert
        internalLeftMargin={internalLeftMargin}
        editLink={editLink}
        invalidStatusChangeAttempted={invalidStatusChangeAttempted}
      />
      <div
        className={`display-flex flex-wrap margin-y-2 ${internalLeftMargin}`}
      >
        <div className="ttahub-goal-card__goal-column ttahub-goal-card__goal-column__goal-text padding-right-3">
          <h3 className="usa-prose usa-prose margin-y-0">
            Goal
            {' '}
            {goalNumbers}
            {' '}
            {isMerged && <Tag>Merged</Tag>}
          </h3>
          <p className="text-wrap usa-prose margin-y-0">
            {goalText}
            {' '}
            <FlagStatus reasons={reasonsToMonitor} goalNumbers={goalNumbers} />
          </p>
          {goal.isFei ? (
            <div className="grid-row">
              <p className="usa-prose text-bold margin-bottom-0 margin-top-1 margin-right-1">
                Root cause:
              </p>
              <p className="usa-prose margin-bottom-0 margin-top-1">
                {getResponses()}
              </p>
            </div>
          ) : null}
        </div>
        <div className="ttahub-goal-card__goal-column ttahub-goal-card__goal-column__goal-source padding-right-3">
          <p className="usa-prose text-bold margin-y-0">Goal source</p>
          <p className="usa-prose margin-y-0">{goal.source}</p>
        </div>
        <div className="ttahub-goal-card__goal-column ttahub-goal-card__goal-column__created-on padding-right-3">
          <p className="usa-prose text-bold  margin-y-0">Created on</p>
          <p className="usa-prose margin-y-0">
            {moment(createdOn, 'YYYY-MM-DD').format(DATE_DISPLAY_FORMAT)}
          </p>
        </div>
        <div className="ttahub-goal-card__goal-column ttahub-goal-card__goal-column__last-tta padding-right-3">
          <p className="usa-prose text-bold margin-y-0">Last TTA</p>
          <p className="usa-prose margin-y-0">{lastTTA}</p>
        </div>
        <div className="ttahub-goal-card__goal-column ttahub-goal-card__goal-column__entered-by padding-right-3">
          <p className="usa-prose text-bold margin-y-0">Entered by</p>
          {renderEnteredBy()}
        </div>
      </div>

      <div className={internalLeftMargin}>
        <ExpanderButton
          type="objective"
          ariaLabel={`objectives for goal ${goal.goalNumbers.join('')}`}
          closeOrOpen={closeOrOpenObjectives}
          count={objectiveCount}
          expanded={objectivesExpanded}
        />
      </div>
      {sortedObjectives.map((obj) => (
        <ObjectiveSwitch
          key={`objective_${uuidv4()}`}
          objective={obj}
          objectivesExpanded={objectivesExpanded}
          goalStatus={goalStatus}
          regionId={parseInt(regionId, DECIMAL_BASE)}
          dispatchStatusChange={dispatchStatusChange}
          isMonitoringGoal={isMonitoringGoal}
        />
      ))}
    </DataCard>
  );
}

GoalCard.propTypes = {
  goal: goalPropTypes.isRequired,
  recipientId: PropTypes.string.isRequired,
  regionId: PropTypes.string.isRequired,
  showCloseSuspendGoalModal: PropTypes.func.isRequired,
  showReopenGoalModal: PropTypes.func.isRequired,
  performGoalStatusUpdate: PropTypes.func.isRequired,
  handleGoalCheckboxSelect: PropTypes.func.isRequired,
  isChecked: PropTypes.bool.isRequired,
  hideCheckbox: PropTypes.bool,
  showReadOnlyStatus: PropTypes.bool,
  hideGoalOptions: PropTypes.bool,
  erroneouslySelected: PropTypes.bool,
};

GoalCard.defaultProps = {
  hideCheckbox: false,
  showReadOnlyStatus: false,
  hideGoalOptions: false,
  erroneouslySelected: false,
};
