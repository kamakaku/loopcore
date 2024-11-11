import { 
  collection,
  query,
  where,
  orderBy,
  limit,
  type Query,
  type WhereFilterOp,
  type OrderByDirection
} from 'firebase/firestore';
import { db } from './config';

export const createQuery = (
  collectionName: string,
  constraints?: {
    where?: [string, WhereFilterOp, any][];
    orderBy?: [string, OrderByDirection][];
    limitTo?: number;
  }
): Query => {
  const queryConstraints = [];
  const collectionRef = collection(db, collectionName);

  if (constraints?.where) {
    constraints.where.forEach(([field, operator, value]) => {
      if (value !== undefined && value !== null) {
        queryConstraints.push(where(field, operator, value));
      }
    });
  }

  if (constraints?.orderBy) {
    constraints.orderBy.forEach(([field, direction]) => {
      queryConstraints.push(orderBy(field, direction));
    });
  }

  if (constraints?.limitTo) {
    queryConstraints.push(limit(constraints.limitTo));
  }

  return query(collectionRef, ...queryConstraints);
};