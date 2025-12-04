const DEFAULT_HOLIDAY_ENDPOINT = 'https://date.nager.at/api/v3/PublicHolidays'

const HOLIDAY_API_BASE =
  import.meta.env.VITE_HOLIDAY_API_URL?.replace(/\/$/, '') ?? DEFAULT_HOLIDAY_ENDPOINT
const HOLIDAY_COUNTRY = import.meta.env.VITE_HOLIDAY_COUNTRY ?? 'KR'

interface HolidayApiResponse {
  date: string
  localName?: string
  name: string
}

export async function fetchHolidayMap(
  year: number,
  signal?: AbortSignal
): Promise<Record<string, string>> {
  const url = `${HOLIDAY_API_BASE}/${year}/${HOLIDAY_COUNTRY}`
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`Failed to fetch holidays (${response.status})`)
  }

  const holidays = (await response.json()) as HolidayApiResponse[]
  return holidays.reduce<Record<string, string>>((map, holiday) => {
    map[holiday.date] = holiday.localName ?? holiday.name
    return map
  }, {})
}
