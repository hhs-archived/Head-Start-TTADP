import faker from '@faker-js/faker';
import db from '../models';
import { createOrUpdate } from './activityReports';
import { createReport, destroyReport } from '../testUtils';
import { FILE_STATUSES, GOAL_STATUS, OBJECTIVE_STATUS } from '../constants';

const {
  Goal,
  ActivityReportGoal,
  ActivityRecipient,
  File,
  Objective,
  ActivityReportObjective,
  ActivityReportObjectiveTopic,
  ActivityReportObjectiveFile,
  ActivityReportObjectiveResource,
  Topic,
  Resource,
} = db;

describe('createOrUpdate', () => {
  let report;
  let topic;
  let file;
  let grantIds;
  let goals;
  let objectives;
  let arecips;
  let resource;

  const ttaProvided = faker.lorem.paragraphs(5);
  const url = faker.internet.url();

  beforeAll(async () => {
    report = await createReport({
      version: 2,
      userId: faker.datatype.number({ min: 666 }),
      activityRecipients: [
        {
          grantId: faker.datatype.number({ min: 666 }),
        },
        {
          grantId: faker.datatype.number({ min: 666 }),
        },
        {
          grantId: faker.datatype.number({ min: 666 }),
        },
        {
          grantId: faker.datatype.number({ min: 666 }),
        },
        {
          grantId: faker.datatype.number({ min: 666 }),
        },
        {
          grantId: faker.datatype.number({ min: 666 }),
        },
        {
          grantId: faker.datatype.number({ min: 666 }),
        },
        {
          grantId: faker.datatype.number({ min: 666 }),
        },
        {
          grantId: faker.datatype.number({ min: 666 }),
        },
        {
          grantId: faker.datatype.number({ min: 666 }),
        },
        {
          grantId: faker.datatype.number({ min: 666 }),
        },
        {
          grantId: faker.datatype.number({ min: 666 }),
        },
      ],
    });

    arecips = await ActivityRecipient.findAll({
      where: {
        activityReportId: report.id,
      },
    });

    grantIds = arecips.map((ar) => ar.grantId);

    topic = await Topic.create({
      name: faker.lorem.sentence(),
    });

    goals = await Promise.all(grantIds.map((grantId) => Goal.create({
      name: faker.lorem.sentence(),
      status: GOAL_STATUS.NOT_STARTED,
      createdVia: 'activityReport',
      grantId,
      onAR: true,
      onApprovedAR: false,
    })));

    await Promise.all((goals.map((g) => (
      ActivityReportGoal.create({
        activityReportId: report.id,
        goalId: g.id,
        name: g.name,
        status: g.status,
      })
    ))));

    objectives = await Promise.all((goals.map((g) => (
      Objective.create({
        title: faker.lorem.sentence(),
        status: OBJECTIVE_STATUS.COMPLETE,
        createdVia: 'activityReport',
        onAR: true,
        onApprovedAR: false,
        goalId: g.id,
      })
    ))));

    const aros = await Promise.all((objectives.map((o) => (
      ActivityReportObjective.create({
        activityReportId: report.id,
        objectiveId: o.id,
        ttaProvided,
        title: o.title,
        status: o.status,
      })
    ))));

    file = await File.create({
      originalFileName: faker.system.fileName(),
      key: faker.system.fileName(),
      fileSize: 5555,
      status: FILE_STATUSES.APPROVED,
    });

    await Promise.all((aros.map((aro) => (
      ActivityReportObjectiveFile.create({
        activityReportObjectiveId: aro.id,
        fileId: file.id,
      })
    ))));

    await Promise.all((aros.map((aro) => (
      ActivityReportObjectiveTopic.create({
        activityReportObjectiveId: aro.id,
        topicId: topic.id,
      })
    ))));

    resource = await Resource.create({
      url,
    });

    await Promise.all((aros.map((aro) => (
      ActivityReportObjectiveResource.create({
        activityReportObjectiveId: aro.id,
        resourceId: resource.id,
      })
    ))));
  });

  afterAll(async () => {
    await ActivityReportObjectiveResource.destroy({
      where: {
        resourceId: resource.id,
      },
      individualHooks: true,
    });

    await Resource.destroy({
      where: {
        id: resource.id,
      },
      individualHooks: true,
    });

    await ActivityReportObjectiveTopic.destroy({
      where: {
        topicId: topic.id,
      },
      individualHooks: true,
    });

    await ActivityReportObjectiveFile.destroy({
      where: {
        fileId: file.id,
      },
      individualHooks: true,
    });

    await File.destroy({
      where: {
        id: file.id,
      },
      individualHooks: true,
    });

    await ActivityReportObjective.destroy({
      where: {
        activityReportId: report.id,
      },
      individualHooks: true,
    });

    await Objective.destroy({
      where: {
        goalId: goals[0].id,
      },
      individualHooks: true,
      force: true,
    });

    await ActivityReportGoal.destroy({
      where: {
        activityReportId: report.id,
      },
      individualHooks: true,
    });

    await Goal.destroy({
      where: {
        grantId: grantIds[0],
      },
      individualHooks: true,
      force: true,
    });

    await Topic.destroy({
      where: {
        id: topic.id,
      },
      individualHooks: true,
      force: true,
    });

    await destroyReport(report);
    await db.sequelize.close();
  });

  it('you can safely remove an activityRecipient after you\'ve created objective files', async () => {
    const recipientsWhoHaveGoalsThatShouldBeRemoved = [grantIds[0], grantIds[1]];
    const goal = goals[0].dataValues;

    const request = {
      recipientsWhoHaveGoalsThatShouldBeRemoved,
      goals: [{
        id: goal.id,
        name: goal.name,
        status: goal.status,
        timeframe: null,
        isFromSmartsheetTtaPlan: null,
        grantId: grantIds[0],
        goalTemplateId: null,
        onAR: true,
        onApprovedAR: false,
        isRttapa: null,
        createdVia: 'activityReport',
        rtrOrder: 1,
        source: '',
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
        isCurated: false,
        prompts: [],
        objectives: [{
          id: objectives[0].dataValues.id,
          otherEntityId: null,
          goalId: goal.id,
          title: objectives[0].dataValues.title,
          status: objectives[0].dataValues.status,
          objectiveTemplateId: null,
          onAR: true,
          onApprovedAR: false,
          createdVia: 'activityReport',
          firstInProgressAt: null,
          lastInProgressAt: null,
          firstSuspendedAt: null,
          lastSuspendedAt: null,
          firstCompleteAt: null,
          lastCompleteAt: null,
          rtrOrder: 1,
          topics: [topic],
          resources: [{
            id: resource.id,
            value: url,
          }],
          files: [file],
          value: 149873,
          ids: objectives.map((o) => o.dataValues.id),
          ttaProvided,
          isNew: false,
          arOrder: 1,
        }],
        goalNumbers: [],
        grants: [],
        grantIds: grantIds.filter((id) => !recipientsWhoHaveGoalsThatShouldBeRemoved.includes(id)),
        isNew: false,
        isActivelyEdited: true,
      }],
      // eslint-disable-next-line max-len
      activityRecipients: arecips.filter((ar) => !recipientsWhoHaveGoalsThatShouldBeRemoved.includes(ar.grantId)),
      duration: 2,
      version: 2,
      approverUserIds: [],
      pageState: {
        1: 'Complete', 2: 'Complete', 3: 'Complete', 4: 'Complete',
      },
    };

    const updatedReport = await createOrUpdate(request, report);

    // prior to the change this test validates, the test would error out here
    // if it runs, then the behavior is correct

    expect(
      updatedReport.activityRecipients.length,
    ).toBe(
      arecips.length - recipientsWhoHaveGoalsThatShouldBeRemoved.length,
    );
  });
});
