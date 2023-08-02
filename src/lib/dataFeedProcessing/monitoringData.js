/* eslint-disable quote-props */
import { DataTypes } from 'sequelize'; // eslint-disable-line import/no-import-module-exports
import { generateImportModels, steamFileFromUrlToS3 } from './dataLoading';
import { getBucketName } from '../s3';

const monitoringTableSchemas = {
  'AMS_CLASS_SUMMARYGrants': {
    ReviewId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    GrantNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Domain_ES: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    Domain_CO: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    Domain_IS: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    PC: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    NC: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    TS: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    RSP: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    BM: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    PD: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    ILF: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    CD: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    QF: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    LM: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    ReportDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ReportAttachmentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },

  'AMS_Findings': {
    findingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    findingType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hs: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ehs: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    arra: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    correctionDeadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reportedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    closedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fiscalInd: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    programInd: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },

  'AMS_FindingGrants': {
    findingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    granteeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    findingType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hs: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ehs: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    arra: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    correctionDeadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reportedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fiscalInd: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    programInd: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },

  'FindingHistory': {
    findingHistoryId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    findingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reviewId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    narrative: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ordinal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    determination: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },

  'AMS_FindingHistoryStatus': {
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },

  'AMS_FindingStandards': {
    findingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    standardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },

  'AMS_FindingStatus': {
    StatusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },

  'AMS_Reviews': {
    ReviewId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    NationalScheduleId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    ContentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    StatusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    StartDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    EndDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ReviewType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ReportAttachmentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    ReportDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    Outcome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    UnannouncedInd: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },

  'AMS_Reviewers': {
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vendorId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    activeInd: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },

  'AMS_ReviewerRoles': {
    roleId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  },

  'AMS_ReviewGrantees': {
    reviewId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    granteeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    createTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updateBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    updateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    grantNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },

  'AMS_ReviewStatus': {
    statusId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  },

  'AMS_ReviewTeams': {
    reviewId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    effectiveDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },

  'AMS_Standards': {
    contentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    standardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    citation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    guidance: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    citable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },

  'CLASS_SUMMARY': {
    ReviewId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    Domain_ES: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    Domain_CO: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    Domain_IS: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    PC: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    NC: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    TS: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    RSP: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    BM: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    PD: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    ILF: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    CD: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    QF: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    LM: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    ReportDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ReportAttachmentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },

  'CLASS_SUMMARYGrants': {
    ReviewId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    GrantNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Domain_ES: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    Domain_CO: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    Domain_IS: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    PC: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    NC: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    TS: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    RSP: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    BM: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    PD: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    ILF: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    CD: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    QF: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    LM: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    ReportDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ReportAttachmentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },

  'Contents': {
    contentId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
    },
  },

  'Findings': {
    findingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    granteeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    findingType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hs: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ehs: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    arra: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    correctionDeadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reportedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    closedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    droppedReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fiscalInd: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    programInd: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },

  'FindingGrants': {
    findingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    granteeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    findingType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hs: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ehs: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    arra: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    correctionDeadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reportedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    closedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fiscalInd: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    programInd: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    droppedReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },

  'FindingHistories': {
    findingHistoryId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    findingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reviewId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    narrative: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ordinal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    determination: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },

  'FindingHistoryStatus': {
    statusId: {
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
    },
  },

  'FindingStandards': {
    findingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    standardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },

  'FindingStatus': {
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },

  'Grantees': {
    granteeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    regionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sourceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    grantNbr: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    organizationType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addressLine1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addressLine2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },

  'GranteeStatuses': {
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },

  'NationalSchedules': {
    nationalScheduleId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
  },

  'Regions': {
    regionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },

  'Reviews': {
    reviewId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    granteeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    contentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reviewType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reportAttachmentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reportDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    outcome: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },

  'Reviewers': {
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vendorId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    activeInd: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },

  'ReviewerRoles': {
    roleId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  },

  'ReviewGrantees': {
    reviewId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    granteeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    createTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updateBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    updateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },

  'ReviewStatuses': {
    statusId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  },

  'ReviewTeams': {
    reviewId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    effectiveDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },

  'ReviewTeamStatus': {
    statusId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  },

  'Standards': {
    contentId: {
      type: DataTypes.STRING,
    },
    standardId: {
      type: DataTypes.INTEGER,
    },
    citation: {
      type: DataTypes.STRING,
    },
    text: {
      type: DataTypes.TEXT,
    },
    citable: {
      type: DataTypes.INTEGER,
    },
  },

  'SystemInfos': {
    updateTime: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
};

const monitoringModels = generateImportModels(monitoringTableSchemas);

const loadMonitoringData = async (url) => {
  // await steamFileFromUrlToS3(url, getBucketName(), );
};
