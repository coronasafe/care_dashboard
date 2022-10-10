import React, { useMemo, useState } from 'react'
import {
  FacilitySummaryQuery,
  useFacilitySummary,
} from '../../api/queries/useFacilitySummary'
import { FacilityCapacityTableCard } from '../../components/FacilityCapacityTableCard'
import { Pagination } from '../../components/Pagination'
import RadialCard from '../../components/RadialCard'
import { TableExportHeader } from '../../components/TableExportHeader'
import { ValuePill } from '../../components/ValuePill'
import {
  AVAILABILITY_TYPES,
  AVAILABILITY_TYPES_ORDERED,
  AVAILABILITY_TYPES_TOTAL_ORDERED,
} from '../../utils/constants'
import {
  getDateFromQuery,
  getNDateAfter,
  getNDateBefore,
  toDateString,
} from '../../utils/date'
import {
  processCapacityExportData,
  processFacilityCapacityTableData,
  processFacilityData,
  processFacilityTrivia,
} from '../../utils/facility/capacity'
import { usePaginateData } from '../../utils/hooks/usePaginateData'
import { getDistrictByName } from '../../utils/url'
import { useQueryParams } from 'raviger'
import { UrlQuery } from '../../types/urlQuery'

interface Props {
  districtName?: string
}

export default function Capacity({ districtName }: Props) {
  const [searchValue, setSearchValue] = useState('')
  const [{ date }, setQuery] = useQueryParams<UrlQuery>()

  const queryDate = getDateFromQuery(date)
  const query: FacilitySummaryQuery = {
    district: getDistrictByName(districtName)?.id,
    start_date: toDateString(getNDateBefore(queryDate, 1)),
    end_date: toDateString(getNDateAfter(queryDate, 1)),
    limit: 1000,
  }

  const { data, isLoading } = useFacilitySummary(query)

  const filtered = useMemo(
    () => processFacilityData(data?.results, []),
    [data?.results]
  )
  const facilitiesTrivia = useMemo(
    () => processFacilityTrivia(filtered, toDateString(queryDate)),
    [filtered, queryDate]
  )
  const exportData = useMemo(
    () => processCapacityExportData(filtered, toDateString(queryDate)),
    [filtered, queryDate]
  )

  const tableData = useMemo(
    () => processFacilityCapacityTableData(filtered),
    [filtered]
  )

  const { handlePageChange, page, paginatedData, totalPage, totalResults } =
    usePaginateData({
      data: tableData,
      keys: ['facility_name'],
      searchValue,
    })

  return (
    <>
      <section className="my-4">
        <div className="2xl:max-w-7xl mx-auto px-4">
          <div className="grid gap-1 grid-rows-none mb-8 sm:grid-flow-col-dense sm:grid-rows-1 sm:place-content-end my-5">
            <ValuePill
              isLoading={isLoading}
              title="Facility Count"
              value={facilitiesTrivia.current.count}
            />
            <ValuePill
              isLoading={isLoading}
              title="Oxygen Capacity"
              value={facilitiesTrivia.current.oxygen}
            />
            <ValuePill
              isLoading={isLoading}
              title="Live Patients"
              value={facilitiesTrivia.current.actualLivePatients}
            />
            <ValuePill
              isLoading={isLoading}
              title="Discharged Patients"
              value={facilitiesTrivia.current.actualDischargedPatients}
            />
          </div>
          <div className="mx-auto grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 my-5">
            {AVAILABILITY_TYPES_TOTAL_ORDERED.map((k) => {
              return (
                <RadialCard
                  label={k.name}
                  isLoading={isLoading}
                  reverseIndicator
                  current={facilitiesTrivia.current[k.id]}
                  previous={facilitiesTrivia.previous[k.id]}
                  key={k.id}
                />
              )
            })}
            {AVAILABILITY_TYPES_ORDERED.map((key, i) => {
              return (
                <RadialCard
                  isLoading={isLoading}
                  label={AVAILABILITY_TYPES[key]}
                  current={facilitiesTrivia.current[key]}
                  previous={facilitiesTrivia.previous[key]}
                  reverseIndicator
                  key={i}
                />
              )
            })}
          </div>
        </div>
      </section>
      {!isLoading ? (
        <section className="my-4 mt-16">
          <div className="2xl:max-w-7xl mx-auto px-4">
            <TableExportHeader
              label="Facilities"
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              exportData={exportData}
            />
            <div className="mt-8">
              {paginatedData.map((data, i) => (
                <FacilityCapacityTableCard data={data} key={i} />
              ))}
            </div>
            <Pagination
              curPage={page}
              handlePageChange={handlePageChange}
              totalPages={totalPage}
              resultsPerPage={10}
              resultsLength={totalResults}
            />
          </div>
        </section>
      ) : null}
    </>
  )
}
