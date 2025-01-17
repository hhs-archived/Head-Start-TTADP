import { Op } from 'sequelize';
import moment from 'moment';
import { REPORT_STATUSES, TOTAL_HOURS_AND_RECIPIENT_GRAPH_TRACE_IDS } from '@ttahub/common';
import { sequelize, ActivityReport } from '../models';

function addOrUpdateResponse(res, ttaTypeKey, xValue, duration, month) {
  const domain = res[ttaTypeKey];

  if (!domain) {
    return;
  }

  const keyIndex = domain.x.findIndex((x) => x === xValue);
  if (keyIndex === -1) {
    domain.x.push(xValue);
    domain.y.push(parseFloat(duration));
    domain.month.push(month);
  } else {
    domain.y[keyIndex] += parseFloat(duration);
  }
}

export default async function totalHrsAndRecipientGraph(scopes, query) {
  // Build out return Graph data.
  const res = {
    'technical-assistance': {
      name: 'Hours of Technical Assistance',
      x: [],
      y: [],
      month: [],
      id: TOTAL_HOURS_AND_RECIPIENT_GRAPH_TRACE_IDS.TECHNICAL_ASSISTANCE,
      trace: 'circle',
    },
    'training,technical-assistance': {
      name: 'Hours of Both',
      x: [],
      y: [],
      month: [],
      id: TOTAL_HOURS_AND_RECIPIENT_GRAPH_TRACE_IDS.BOTH,
      trace: 'triangle',
    },
    training: {
      name: 'Hours of Training',
      x: [],
      y: [],
      month: [],
      id: TOTAL_HOURS_AND_RECIPIENT_GRAPH_TRACE_IDS.TRAINING,
      trace: 'square',
    },
  };
  // Get the Date Range.
  const dateRange = query['startDate.win'];

  // Parse out Start and End Date.
  let startDate;
  let endDate;
  let useDays = true;
  let multipleYrs = false;

  if (dateRange) {
    const dates = dateRange.split('-');
    // Check if we have a Start Date.
    if (dates.length > 0) {
    // eslint-disable-next-line prefer-destructuring
      startDate = dates[0];
    }

    // Check if we have and End Date.
    if (dates.length > 1) {
    // eslint-disable-next-line prefer-destructuring
      endDate = dates[1];
    }
  }

  if (startDate && endDate) {
    // Determine if we have more than 31 days.
    const sdDate = moment(startDate);
    const edDate = moment(endDate);
    const daysDiff = edDate.diff(sdDate, 'days');
    useDays = daysDiff <= 31;

    // Determine if we have more than 1 year in the range.
    // const yearDiff = edDate.diff(sdDate, 'years', true);
    // multipleYrs = yearDiff > 1;
    multipleYrs = moment(sdDate).format('YY') !== moment(edDate).format('YY');
  } else {
    multipleYrs = true;
    useDays = false;
  }

  // Query Approved AR's.
  const reports = await ActivityReport.findAll({
    attributes: [
      'startDate',
      'ttaType',
      [sequelize.fn('sum', sequelize.col('duration')), 'duration'],
    ],
    where: {
      [Op.and]: [scopes.activityReport],
      calculatedStatus: REPORT_STATUSES.APPROVED,
      startDate: {
        [Op.not]: null,
      },
    },
    group: ['ttaType', 'startDate'],
    includeIgnoreAttributes: false,
    order: [['startDate', 'ASC']],
  });

  reports.forEach((r) => {
    let xValue;
    const sd = moment(r.startDate, 'MM/DD/YYYY');
    if (useDays) {
      xValue = sd.format('MMM-DD');
    } else if (multipleYrs) {
      xValue = sd.format('MMM-YY');
    } else {
      xValue = sd.format('MMM');
    }

    const month = useDays ? sd.format('MMM') : false;

    const ttaTypeKey = r.ttaType.join(',');
    addOrUpdateResponse(res, ttaTypeKey, xValue, r.duration, month);
  });

  return Object.values(res);
}
