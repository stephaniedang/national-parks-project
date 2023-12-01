export function formatVisitorCount(count) {
  if (count < 1000000) {
    return count.toLocaleString();
  } else {
    return `${(count / 1000000).toFixed(1)} million`;
  }
};

export function formatVisitorCountAbbrev(count) {
  if (count < 1000000) {
    return count.toLocaleString();
  } else {
    return `${(count / 1000000).toFixed(1)}` + 'M';
  }
};