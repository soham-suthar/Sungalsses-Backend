const getSort = (sort, allowedSortField) => {
  let sortQuery = {
    createdAt: -1,
  };

  if (!sort) {
    return sortQuery;
  }

  const descending = sort.startsWith("-");
  const field = descending ? sort.slice(1) : sort.toString();

  const direction = descending ? -1 : 1;

  if (!allowedSortField.includes(field)) {
    return {
      createdAt: -1,
    };
  }

  sortQuery = {
    [field]: direction,
  };

  return sortQuery;
};

export default getSort;
