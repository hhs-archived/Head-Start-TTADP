/* eslint-disable import/prefer-default-export */
import { v4 as uuidv4 } from 'uuid';
import { isArray } from 'lodash';

export function buildDefaultRegionFilters(regions) {
  const allRegionFilters = [];
  for (let i = 0; i < regions.length; i += 1) {
    allRegionFilters.push({
      id: uuidv4(),
      topic: 'region',
      condition: 'is',
      query: regions[i],
    });
  }
  return allRegionFilters;
}

export function showFilterWithMyRegions(allRegionsFilters, filters, setFilters) {
  // Exclude region filters we dont't have access to and show.
  const accessRegions = [...new Set(allRegionsFilters.map((r) => r.query))];
  const newFilters = filters.filter((f) => f.topic !== 'region' || (f.topic === 'region' && accessRegions.includes(parseInt(f.query[0], 10))));

  // Check if any region filters where added else add all we can access.
  const containsRegionFilter = newFilters.find((f) => f.topic === 'region');
  if (!containsRegionFilter) {
    setFilters([...allRegionsFilters,
      ...newFilters]);
  } else {
    setFilters(newFilters);
  }
}

export function filtersContainAllRegions(filters, allUserRegions) {
  const passedRegionFilters = filters.filter((f) => f.topic === 'region').map((r) => {
    if (isArray(r.query)) {
      return parseInt(r.query[0], 10);
    }
    return r.query;
  });

  let containsAllRegions = true;
  if (allUserRegions) {
    allUserRegions.forEach((r) => {
      if (!passedRegionFilters.includes(r)) {
        containsAllRegions = false;
      }
    });
  }
  return containsAllRegions;
}
