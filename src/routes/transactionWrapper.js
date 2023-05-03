import newrelic from 'newrelic';
import { sequelize } from '../models';
import { addAuditTransactionSettings, removeFromAuditedTransactions } from '../models/auditModelGenerator';
import handleErrors from '../lib/apiErrorHandler';

const namespace = 'SERVICE:WRAPPER';

const logContext = {
  namespace,
};

function newRelicMiddleware(req) {
  let ender;

  newrelic.startWebTransaction(req.path, () => {
    console.log('start new relic transaction');
    let transaction = newrelic.getTransaction();
    ender = () => {
      console.log('end new relic transaction');
      if (transaction) {
        transaction.end();
        transaction = null;
      }
    };
  });

  return ender;
}

export default function transactionWrapper(originalFunction) {
  return async function wrapper(req, res, next) {
    console.log('!!!!!', req);
    const endTransaction = newRelicMiddleware(req);

    let error;
    try {
      return sequelize.transaction(async () => {
        let result;
        try {
          await addAuditTransactionSettings(sequelize, null, null, 'transaction', originalFunction.name);
          result = await originalFunction(req, res, next);
          removeFromAuditedTransactions();
        } catch (err) {
          error = err;
          throw err;
        }

        endTransaction();
        return result;
      });
    } catch (err) {
      endTransaction();
      return handleErrors(req, res, error || err, logContext);
    }
  };
}
