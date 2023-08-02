const {
  prepMigration,
  removeTables,
} = require('../lib/migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await prepMigration(queryInterface, transaction, __filename);

      await queryInterface.createSchema('monitoring', { transaction });
      await queryInterface.createTable('AMS_CLASS_SUMMARYGrants', {
        ReviewId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        GrantNumber: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        Domain_ES: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        Domain_CO: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        Domain_IS: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        PC: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        NC: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        TS: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        RSP: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        BM: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        PD: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        ILF: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        CD: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        QF: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        LM: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        ReportDeliveryDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        ReportAttachmentId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('AMS_Findings', {
        findingId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        statusId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        findingType: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        source: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        hs: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        ehs: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        arra: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        correctionDeadline: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        reportedDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        closedDate: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        fiscalInd: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        programInd: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('AMS_FindingGrants', {
        findingId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        granteeId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        statusId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        findingType: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        source: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        hs: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        ehs: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        arra: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        correctionDeadline: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        reportedDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        fiscalInd: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        programInd: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('FindingHistory', {
        findingHistoryId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        findingId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        reviewId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        statusId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        narrative: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        ordinal: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        determination: {
          type: Sequelize.STRING,
          allowNull: true,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('AMS_FindingHistoryStatus', {
        statusId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('AMS_FindingStandards', {
        findingId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        standardId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('AMS_FindingStatus', {
        StatusId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        Name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('AMS_Reviews', {
        ReviewId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        NationalScheduleId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        ContentId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        StatusId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        Name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        StartDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        EndDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        ReviewType: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        ReportAttachmentId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        ReportDeliveryDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        Outcome: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        UnannouncedInd: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('AMS_Reviewers', {
        reviewerId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        userId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        firstName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        lastName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        vendorId: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        activeInd: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('AMS_ReviewerRoles', {
        roleId: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('AMS_ReviewGrantees', {
        reviewId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        granteeId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        createTime: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updateBy: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        updateTime: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        grantNumber: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('AMS_ReviewStatus', {
        statusId: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('AMS_ReviewTeams', {
        reviewId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        reviewerId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        roleId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        effectiveDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        statusId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('ReviewTeamStatus', {
        statusId: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('AMS_Standards', {
        contentId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        standardId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        citation: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        text: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        guidance: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        citable: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('CLASS_SUMMARY', {
        ReviewId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        Domain_ES: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        Domain_CO: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        Domain_IS: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        PC: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        NC: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        TS: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        RSP: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        BM: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        PD: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        ILF: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        CD: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        QF: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        LM: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        ReportDeliveryDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        ReportAttachmentId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('CLASS_SUMMARYGrants', {
        ReviewId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        GrantNumber: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        Domain_ES: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        Domain_CO: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        Domain_IS: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        PC: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        NC: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        TS: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        RSP: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        BM: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        PD: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        ILF: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        CD: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        QF: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        LM: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        ReportDeliveryDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        ReportAttachmentId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('Contents', {
        contentId: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        name: {
          type: Sequelize.STRING,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('Findings', {
        findingId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        granteeId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        statusId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        findingType: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        source: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        hs: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        ehs: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        arra: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        correctionDeadline: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        reportedDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        closedDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        droppedReason: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        fiscalInd: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        programInd: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('FindingGrants', {
        findingId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        granteeId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        statusId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        findingType: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        source: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        hs: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        ehs: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        arra: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        correctionDeadline: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        reportedDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        closedDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        fiscalInd: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        programInd: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        droppedReason: {
          type: Sequelize.STRING,
          allowNull: true,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('FindingHistories', {
        findingHistoryId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        findingId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        reviewId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        statusId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        narrative: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        ordinal: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        determination: {
          type: Sequelize.STRING,
          allowNull: true,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('FindingHistoryStatus', {
        statusId: {
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('FindingStandards', {
        findingId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        standardId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('FindingStatus', {
        statusId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('Grantees', {
        granteeId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        regionId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        statusId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        sourceId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        grantNbr: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        organizationType: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        addressLine1: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        addressLine2: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        city: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        state: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        postalCode: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('GranteeStatuses', {
        statusId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('NationalSchedules', {
        nationalScheduleId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('Regions', {
        regionId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('Reviews', {
        reviewId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        granteeId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        contentId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        statusId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        startDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        endDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        reviewType: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        reportAttachmentId: {
          type: Sequelize.UUID,
          allowNull: true,
        },
        reportDeliveryDate: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        outcome: {
          type: Sequelize.STRING,
          allowNull: true,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('Reviewers', {
        reviewerId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        userId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        firstName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        lastName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        vendorId: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        activeInd: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('ReviewerRoles', {
        roleId: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('ReviewGrantees', {
        reviewId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        granteeId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        createTime: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updateBy: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        updateTime: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('ReviewStatuses', {
        statusId: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('ReviewTeams', {
        reviewId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        reviewerId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        roleId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        effectiveDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        statusId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        expirationDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('ReviewTeamStatus', {
        statusId: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('Standards', {
        contentId: {
          type: Sequelize.STRING,
        },
        standardId: {
          type: Sequelize.INTEGER,
        },
        citation: {
          type: Sequelize.STRING,
        },
        text: {
          type: Sequelize.TEXT,
        },
        citable: {
          type: Sequelize.INTEGER,
        },
      }, { schema: 'monitoring', transaction });

      await queryInterface.createTable('SystemInfos', {
        updateTime: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      }, { schema: 'monitoring', transaction });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await prepMigration(queryInterface, transaction, __filename);

      await Promise.all([
        'AMS_CLASS_SUMMARYGrants',
        'AMS_FindingGrants',
        'FindingHistory',
        'AMS_FindingHistoryStatus',
        'AMS_FindingStandards',
        'AMS_FindingStatus',
        'AMS_Reviews',
        'AMS_Reviewers',
        'AMS_ReviewerRoles',
        'AMS_ReviewGrantees',
        'AMS_ReviewStatus',
        'AMS_ReviewTeams',
        'ReviewTeamStatus',
        'AMS_Standards',
        'CLASS_SUMMARY',
        'CLASS_SUMMARYGrants',
        'Contents',
        'Findings',
        'FindingGrants',
        'FindingHistories',
        'FindingHistoryStatus',
        'FindingStandards',
        'FindingStatus',
        'Grantees',
        'GranteeStatuses',
        'NationalSchedules',
        'Regions',
        'Reviews',
        'Reviewers',
        'ReviewerRoles',
        'ReviewGrantees',
        'ReviewStatuses',
        'ReviewTeams',
        'ReviewTeamStatus',
        'Standards',
        'SystemInfos',
      ].map(async (table) => queryInterface.dropTable(table, { schema: 'monitoring', transaction })));

      await queryInterface.dropSchema('monitoring', { transaction });
    });
  },
};
