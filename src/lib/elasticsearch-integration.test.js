import { ActivityReport, Grantee, User, sequelize } from "../models";
import { REPORT_STATUSES } from "../constants";
import { initElasticsearchIntegration } from "./elasticsearch";

const USERS = {
  user: {
    id: 3000,
    hsesUsername: "user",
    hsesUserId: "3000",
    homeRegionId: 1,
  },
  manager: {
    id: 3001,
    hsesUsername: "manager",
    hsesUserId: "3001",
    homeRegionId: 2,
  },
};

const GRANTEES = {
  grantee1: {
    id: 3010,
  },
};

const REPORTS = {
  report1: {
    id: 3020,
    activityRecipients: [{ activityRecipientId: GRANTEES.grantee1.id }],
    activityRecipientType: "grantee",
    approvingManagerId: USERS.manager.id,
    deliveryMethod: "in-person",
    duration: 1,
    ECLKCResourcesUsed: ["test"],
    endDate: "2000-01-01T12:00:00Z",
    lastUpdatedById: USERS.user.id,
    numberOfParticipants: 11,
    participants: ["participants", "genies"],
    programTypes: ["type"],
    reason: ["here is a unique word for search purposes: rutabaga"],
    requester: "requester",
    regionId: 1,
    startDate: "2000-01-01T12:00:00Z",
    status: REPORT_STATUSES.APPROVED,
    targetPopulations: ["pop"],
    topics: ["Program Planning and Services"],
    ttaType: ["technical-assistance"],
    userId: USERS.user.id,
  },
  report2: {
    id: 3021,
    activityRecipients: [{ activityRecipientId: GRANTEES.grantee1.id }],
    activityRecipientType: "grantee",
    approvingManagerId: USERS.manager.id,
    deliveryMethod: "in-person",
    duration: 1,
    ECLKCResourcesUsed: ["test"],
    endDate: "2000-01-01T12:00:00Z",
    lastUpdatedById: USERS.user.id,
    numberOfParticipants: 11,
    participants: ["participants", "genies"],
    programTypes: ["type"],
    reason: ["here is a unique word for search purposes: kumquat"],
    requester: "requester",
    regionId: 1,
    startDate: "2000-01-01T12:00:00Z",
    status: REPORT_STATUSES.APPROVED,
    targetPopulations: ["pop"],
    topics: ["Program Planning and Services"],
    ttaType: ["technical-assistance"],
    userId: USERS.user.id,
  },
};

async function createFixtures() {
  try {
    await sequelize.transaction(async (transaction) => {
      await User.bulkCreate(Object.values(USERS), { transaction });
      await Grantee.bulkCreate(Object.values(GRANTEES), { transaction });
    });
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to create fixtures: ${err.message}`);
  }
}

async function deleteFixtures(removeActivityReportFromIndex) {
  await Promise.all(
    [
      [ActivityReport, REPORTS],
      [Grantee, GRANTEES],
      [User, USERS],
    ].map(async ([model, data]) => {
      await model.destroy({
        where: {
          id: Object.values(data).map(({ id }) => id),
        },
      });
    })
  );

  if (removeActivityReportFromIndex) {
    await Promise.all(
      Object.values(REPORTS).map(({ id }) =>
        removeActivityReportFromIndex({ id })
      )
    );
  }
}

describe("Real live Elasticsearch", () => {
  const {
    enabled,
    indexActivityReport,
    removeActivityReportFromIndex,
    searchActivityReports,
  } = initElasticsearchIntegration();

  const t = enabled ? test : test.skip;

  beforeAll(async () => {
    await deleteFixtures();
    await createFixtures();
  });

  afterAll(deleteFixtures.bind(undefined, removeActivityReportFromIndex));

  t("can index + delete an ActivityReport", async () => {
    const report = await ActivityReport.create(REPORTS.report1, {
      hooks: false,
    });

    await indexActivityReport(report);
    
    const found = await searchActivityReports("rutabaga");
    
    expect(found.body.hits.hits.map(({ _id }) => _id)).toEqual([REPORTS.report1.id.toString()]);

    await removeActivityReportFromIndex(report);


    const foundAfterRemove = await searchActivityReports("rutabaga");
    
    expect(foundAfterRemove.body.hits.hits.map(({ _id }) => _id)).toEqual([]);

  });
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}