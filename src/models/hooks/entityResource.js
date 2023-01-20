import { Op } from 'sequelize';
import { AUTOMATIC_CREATION, ENTITY_TYPES } from '../../constants';
import { getSingularOrPluralData } from '../helpers/hookMetadata';

const autoPopulateOnAR = (sequelize, instance, options) => {
  if (instance.entityType === ENTITY_TYPES.OBJECTIVE
    || instance.entityType === ENTITY_TYPES.GOAL) {
    if (instance.onAR === undefined
      || instance.onAR === null) {
      instance.set('onAR', false);
      if (!options.fields.includes('onAR')) {
        options.fields.push('onAR');
      }
    }
  }
};

const autoPopulateOnApprovedAR = (sequelize, instance, options) => {
  if (instance.entityType === ENTITY_TYPES.OBJECTIVE
    || instance.entityType === ENTITY_TYPES.GOAL) {
    if (instance.onApprovedAR === undefined
      || instance.onApprovedAR === null) {
      instance.set('onApprovedAR', false);
      if (!options.fields.includes('onApprovedAR')) {
        options.fields.push('onApprovedAR');
      }
    }
  }
};

// When a new resource is added to an objective, add the resource to the template or update the
// updatedAt value.
const propagateCreateToTemplate = async (sequelize, instance, options) => {
  if (instance.entityType === ENTITY_TYPES.OBJECTIVE) {
    const objective = await sequelize.models.Objective.findOne({
      attributes: [
        'id',
        'objectiveTemplateId',
      ],
      where: {
        id: instance.objectiveId,
        objectiveTemplateId: { [Op.not]: null },
      },
      include: [
        {
          model: sequelize.models.ObjectiveTemplate,
          as: 'objectiveTemplate',
          required: true,
          attributes: ['id', 'creationMethod'],
        },
      ],
      transaction: options.transaction,
    });
    if (objective
      && objective.objectiveTemplateId !== null
      && objective.objectiveTemplate.creationMethod === AUTOMATIC_CREATION) {
      const [otr] = await sequelize.models.ObjectiveTemplateResource.findOrCreate({
        where: {
          objectiveTemplateId: objective.objectiveTemplateId,
          userProvidedUrl: instance.userProvidedUrl,
        },
        transaction: options.transaction,
      });
      await sequelize.models.ObjectiveTemplateResource.update(
        {
          updatedAt: new Date(),
        },
        {
          where: { id: otr.id },
          transaction: options.transaction,
          individualHooks: true,
        },
      );
    }
  }
};

const propagateDestroyToTemplate = async (sequelize, instance, options) => {
  if (instance.entityType === ENTITY_TYPES.OBJECTIVE) {
    const objective = await sequelize.models.Objective.findOne({
      attributes: [
        'id',
        'objectiveTemplateId',
      ],
      where: {
        id: instance.objectiveId,
        objectiveTemplateId: { [Op.not]: null },
      },
      include: [
        {
          model: sequelize.models.ObjectiveTemplate,
          as: 'objectiveTemplate',
          required: true,
          attributes: ['id', 'creationMethod'],
        },
      ],
      transaction: options.transaction,
    });
    if (objective
      && objective.objectiveTemplateId !== null
      && objective.objectiveTemplate.creationMethod === AUTOMATIC_CREATION) {
      const otr = await sequelize.models.ObjectiveTemplateResource.findOne({
        attributes: ['id'],
        where: {
          objectiveTemplateId: objective.objectiveTemplateId,
          userProvidedUrl: instance.userProvidedUrl,
        },
        include: [
          {
            model: sequelize.models.ObjectiveTemplate,
            as: 'objectiveTemplate',
            required: true,
            include: [
              {
                model: sequelize.models.Objective,
                as: 'objectives',
                required: true,
                attributes: ['id'],
                where: { onApprovedAR: true },
              },
            ],
          },
        ],
        transaction: options.transaction,
      });
      if (otr.objectiveTemplate.objectives.length > 0) {
        await sequelize.models.ObjectiveTemplateResource.update(
          {
            updatedAt: new Date(),
          },
          {
            where: { id: otr.id },
            transaction: options.transaction,
            individualHooks: true,
          },
        );
      } else {
        await sequelize.models.ObjectiveTemplateResource.destroy(
          {
            where: { id: otr.id },
            individualHooks: true,
            transaction: options.transaction,
          },
        );
      }
    }
  }
};

const recalculateOnAR = async (sequelize, instance, options) => {
  // check to see if objectiveId or objectiveIds is validly defined
  // when defined a more efficient search can be used
  const objectiveIds = getSingularOrPluralData(options, 'objectiveId', 'objectiveIds');

  let resourceOnReport;
  if (objectiveIds !== undefined
    && Array.isArray(objectiveIds)
    && objectiveIds.map((i) => typeof i).every((i) => i === 'number')) {
    resourceOnReport = `
      SELECT
        r."id",
        COUNT(aror.id) > 0 "onAR"
      FROM "ObjectiveResources" r
      LEFT JOIN "ActivityReportObjectives" aro
      ON r."objectiveId" = aro."objectiveId"
      JOIN "ActivityReportObjectiveResources" aror
      ON aro.id = aror."activityReportObjectiveId"
      AND r."userProvidedUrl" = aror."userProvidedUrl"
      WHERE r."objectiveId" IN (${objectiveIds.join(',')})
      AND r."userProvidedUrl" = '${instance.userProvidedUrl}'
      AND aro.id != ${instance.activityReportObjectiveId}
      GROUP BY r."id"`;
  } else {
    resourceOnReport = `
      SELECT
        r."id",
        COUNT(aror.id) > 0 "onAR"
      FROM "ObjectiveResources" r
      JOIN "ActivityReportObjectives" arox
      ON r."objectiveId" = arox."objectiveId"
      LEFT JOIN "ActivityReportObjectives" aro
      ON r."objectiveId" = aro."objectiveId"
      JOIN "ActivityReportObjectiveResources" aror
      ON aro.id = aror."activityReportObjectiveId"
      AND r."userProvidedUrl" = aror."userProvidedUrl"
      WHERE arox.id = ${instance.activityReportObjectiveId}
      AND r."userProvidedUrl" = '${instance.userProvidedUrl}'
      AND aro.id != ${instance.activityReportObjectiveId}
      GROUP BY r."id"`;
  }

  await sequelize.query(`
    WITH
      "ResourceOnReport" AS (${resourceOnReport})
    UPDATE "ObjectiveResources" r
    SET "onAR" = rr."onAR"
    FROM "ResourceOnReport" rr
    WHERE r.id = rr.id;
  `, { transaction: options.transaction });
};

const beforeValidate = async (sequelize, instance, options) => {
  if (!Array.isArray(options.fields)) {
    options.fields = []; //eslint-disable-line
  }
  autoPopulateOnAR(sequelize, instance, options);
  autoPopulateOnApprovedAR(sequelize, instance, options);
};

const afterCreate = async (sequelize, instance, options) => {
  await propagateCreateToTemplate(sequelize, instance, options);
};

const afterDestroy = async (sequelize, instance, options) => {
  await propagateDestroyToTemplate(sequelize, instance, options);
  await recalculateOnAR(sequelize, instance, options);
};

export {
  autoPopulateOnAR,
  autoPopulateOnApprovedAR,
  propagateCreateToTemplate,
  propagateDestroyToTemplate,
  beforeValidate,
  afterCreate,
  afterDestroy,
};
