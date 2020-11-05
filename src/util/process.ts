import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

export const processDataES = (data: Array<{ hash_id: string; vendor: string; timestamp: number }>) => {
  const timeSeries: { [key: string]: string[] } = {};
  const hashVendorPair: { [key: string]: string } = {};
  let hashvendor: string[] = [];

  data.map(item => {
    if (!timeSeries[item.hash_id]) {
      hashVendorPair[item.hash_id] = item.vendor;
      timeSeries[item.hash_id] = [
        dayjs
          .unix(item.timestamp)
          .tz('Europe/Berlin')
          .format('YYYY-MM-DDTHH:mm:s'),
      ];
    } else {
      timeSeries[item.hash_id].push(
        dayjs
          .unix(item.timestamp)
          .tz('Europe/Berlin')
          .format('YYYY-MM-DDTHH:mm:s')
      );
    }
  });

  const returnData = Object.keys(timeSeries).map((hash, index) => ({
    id: hash,
    data: timeSeries[hash]
      .slice()
      .reverse()
      .map(timePoint => ({ x: timePoint, y: index + 1 })),
  }));

  hashvendor = Object.keys(hashVendorPair).map(hash => `${hash} - ${hashVendorPair[hash]}`);

  return { data: returnData, hashvendor };
};
