const getPagination = (page, limit) => {
  let pageNumber = Number(page);
  let limitNumber = Number(limit);

  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  if (isNaN(limitNumber) || limitNumber < 1) {
    limitNumber = 20;
  } else if (limitNumber > 50) {
    limitNumber = 50;
  }

  return {
    pageNumber,
    limitNumber,
    skip: (pageNumber - 1) * limitNumber,
  };
};

export default getPagination;
