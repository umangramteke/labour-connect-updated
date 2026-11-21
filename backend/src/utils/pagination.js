function createPageResponse(content, totalElements, page, size) {
  const safePage = Math.max(0, parseInt(page, 10) || 0);
  const safeSize = Math.max(1, parseInt(size, 10) || 10);
  const totalPages = Math.ceil(totalElements / safeSize) || 1;

  return {
    content,
    pageable: {
      pageNumber: safePage,
      pageSize: safeSize,
      sort: { empty: false, sorted: true, unsorted: false },
      offset: safePage * safeSize,
      paged: true,
      unpaged: false
    },
    totalPages,
    totalElements,
    last: safePage >= totalPages - 1,
    size: safeSize,
    number: safePage,
    sort: { empty: false, sorted: true, unsorted: false },
    numberOfElements: content.length,
    first: safePage === 0,
    empty: content.length === 0
  };
}

module.exports = { createPageResponse };

