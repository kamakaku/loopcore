import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import i18next from 'i18next';

export const formatDate = (timestamp: Date | Timestamp | number | string | undefined | null) => {
  if (!timestamp) {
    return '';
  }
  
  try {
    let date: Date;
    
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      return '';
    }

    if (isNaN(date.getTime())) {
      return '';
    }

    const locale = i18next.language.startsWith('de') ? de : undefined;

    if (isToday(date)) {
      return i18next.t('common.today');
    }

    if (isYesterday(date)) {
      return i18next.t('common.yesterday');
    }

    // For dates within the last week, show relative time
    if (Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale 
      });
    }

    // For older dates, show the full date
    return format(date, 'dd.MM.yyyy', { locale });
  } catch (err) {
    console.error('Error formatting date:', err);
    return '';
  }
}