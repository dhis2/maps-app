import { timeFormat } from 'd3-time-format';

export const getDateFromString = (dateString, pattern = '%Y-%m-%d') => {
    const date = new Date(dateString);
    const formatter = timeFormat(pattern);
    return formatter(date);
};
