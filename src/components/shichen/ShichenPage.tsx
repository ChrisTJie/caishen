import { useMemo, useState } from 'react';
import { GameRules } from '../lottery/GameRules';
import { useTaipeiClock } from '../../hooks/useTaipeiClock';
import { getAlmanacDay, type TianShenMark } from '../../lib/almanac';
import {
  buildShichenTable,
  DEFAULT_CITY_ID,
  formatSignedMinutes,
  getTaipeiDateTime,
  TAIWAN_CITIES,
} from '../../lib/shichen';

function TianShenLabel({ mark }: { mark: TianShenMark }) {
  const lucky = mark.luck === '吉';
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
          lucky ? 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.75)]' : 'bg-stone-400/85'
        }`}
        aria-hidden="true"
      />
      <span>
        {mark.name}
        <span className="ml-1 text-yellow-200/65">
          {mark.path}
          {mark.luck}
        </span>
      </span>
    </span>
  );
}

export function ShichenPage() {
  const now = useTaipeiClock();
  const todayYmd = getTaipeiDateTime(now).ymd;
  const [ymd, setYmd] = useState(todayYmd);
  const [cityId, setCityId] = useState(DEFAULT_CITY_ID);

  const table = useMemo(() => buildShichenTable({ ymd, cityId, now }), [ymd, cityId, now]);
  const almanac = useMemo(() => getAlmanacDay(ymd), [ymd]);

  const clockName = table?.rows.find((row) => row.period.id === table.clockPeriodId)?.period.name;
  const solarName = table?.rows.find((row) => row.period.id === table.solarPeriodId)?.period.name;

  return (
    <div className="animate-fade-in mx-auto max-w-4xl">
      <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-b from-[#5c0b0b] to-[#2a0505] p-5 shadow-2xl sm:rounded-3xl sm:p-8 md:p-12">
        <header className="relative mb-8 text-center md:mb-10">
          <h2 className="mb-3 bg-gradient-to-b from-yellow-200 to-yellow-600 bg-clip-text text-3xl font-black text-transparent sm:text-4xl md:text-6xl">
            時辰真實表
          </h2>
          <p className="text-sm tracking-wide text-yellow-200/80 md:tracking-widest">
            查閱當日農曆、十二時辰與黃黑道
          </p>
        </header>

        <div className="mb-6">
          <GameRules title="說明">
            <p>
              本表依台灣標準時間（東經 120°）加上當地經度與均時差，估算真太陽時。僅供民俗計時參考，與樂透選號、開獎無關，也不會改變中獎機率。
            </p>
            <p>
              黃黑道為常見十二天神輪值排法，各家黃曆可能不同。本表以該公曆日的日支排滿十二時辰；子時跨日，若依晚子時換日，23:00
              起的值神會改屬次日。
            </p>
          </GameRules>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <span className="ml-1 block text-sm font-bold text-yellow-500/80">日期</span>
            <div className="flex gap-2">
              <label className="min-w-0 flex-1">
                <span className="sr-only">查詢日期</span>
                <input
                  type="date"
                  value={ymd}
                  onChange={(event) => setYmd(event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-yellow-500/20 bg-red-950/50 px-4 py-2 text-base text-yellow-100 focus:border-yellow-500/50 focus:outline-none"
                />
              </label>
              <button
                type="button"
                onClick={() => setYmd(todayYmd)}
                className="min-h-11 shrink-0 rounded-xl border border-yellow-500/40 px-3 text-sm font-bold text-yellow-50 hover:bg-yellow-500/10"
              >
                今天
              </button>
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="ml-1 text-sm font-bold text-yellow-500/80">地點（經度）</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="查詢城市">
              {TAIWAN_CITIES.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => setCityId(city.id)}
                  className={`min-h-11 rounded-full border px-4 text-sm font-bold ${
                    cityId === city.id
                      ? 'border-yellow-400 bg-yellow-500/30 text-yellow-100'
                      : 'border-yellow-500/20 bg-red-950/40 text-yellow-200/70'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {table ? (
          <>
            {almanac ? (
              <section
                className="mb-6 rounded-2xl border border-yellow-500/25 bg-red-950/40 px-4 py-4 text-center text-yellow-50"
                aria-label="當日農曆與干支"
              >
                <p className="text-lg font-black tracking-wide">{almanac.lunarDate}</p>
                <p className="mt-2 text-sm text-yellow-100/90">
                  {`${almanac.yearGanZhi}（${almanac.yearShengXiao}）年 · ${almanac.monthGanZhi}月 · ${almanac.dayGanZhi}日`}
                </p>
                <p className="mt-1 text-sm text-yellow-100/75">
                  {[almanac.weekday, almanac.jieQi, ...almanac.festivals].filter(Boolean).join(' · ')}
                </p>
                {almanac.lichunYearDiffers ? (
                  <p className="mt-2 text-xs leading-relaxed text-yellow-200/70">
                    {`農曆年依春節；立春年柱為${almanac.yearGanZhiByLiChun}（${almanac.yearShengXiaoByLiChun}）。`}
                  </p>
                ) : null}
              </section>
            ) : null}

            {table.isToday && clockName ? (
              <div
                className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-center text-yellow-50"
                role="status"
              >
                <p className="text-sm font-bold tracking-wide">
                  {`此刻鐘錶為${clockName}${
                    table.clockDiffersFromSolar && solarName ? `，真太陽時為${solarName}` : ''
                  }${table.nearBoundary ? '；接近時辰交界，請一併核對真太陽時。' : '。'}`}
                </p>
              </div>
            ) : (
              <p className="mb-6 text-center text-sm text-yellow-100/70">指定日期不顯示此刻，僅列出該日完整時辰。</p>
            )}

            <p className="mb-2 text-center text-xs leading-relaxed text-yellow-100/70">
              {`${table.city.name}東經 ${table.city.longitude.toFixed(2)}° · 經度修正 ${formatSignedMinutes(table.longitudeOffsetMinutes)} · 均時差 ${formatSignedMinutes(table.equationOfTimeMinutes)} · 合計 ${formatSignedMinutes(table.totalOffsetMinutes)}`}
            </p>
            <p className="mb-4 text-center text-xs leading-relaxed text-yellow-100/60">
              黃道吉以金點標示，黑道凶以灰點標示。子時為 23:00–01:00，跨兩個公曆日。
            </p>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[40rem] border-collapse text-left text-sm text-yellow-100">
                <caption className="sr-only">
                  {table.ymd} {table.city.name}十二時辰、真太陽時與黃黑道對照
                </caption>
                <thead>
                  <tr className="border-b border-yellow-500/30 text-yellow-200">
                    <th className="py-3 pr-3 font-bold">時辰</th>
                    <th className="py-3 pr-3 font-bold">生肖</th>
                    <th className="py-3 pr-3 font-bold">黃黑道</th>
                    <th className="py-3 pr-3 font-bold">鐘錶時間</th>
                    <th className="py-3 font-bold">真太陽時（鐘錶）</th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row) => {
                    const current = table.isToday && (row.isClockNow || row.isSolarNow);
                    const mark = almanac?.tianShenByBranch[row.period.branch];
                    return (
                      <tr
                        key={row.period.id}
                        aria-current={current ? 'true' : undefined}
                        className={`border-b border-yellow-500/10 ${current ? 'bg-yellow-500/15' : ''}`}
                      >
                        <td className="py-3 pr-3 font-black text-yellow-50">{row.period.name}</td>
                        <td className="py-3 pr-3 text-yellow-100/80">{row.period.animal}</td>
                        <td className="py-3 pr-3">{mark ? <TianShenLabel mark={mark} /> : '—'}</td>
                        <td className="py-3 pr-3 font-mono tabular-nums">
                          {row.clockLabel}
                          {row.isClockNow ? <span className="ml-2 text-xs font-bold text-yellow-300">此刻</span> : null}
                        </td>
                        <td className="py-3 font-mono tabular-nums">
                          {row.solarClockLabel}
                          {row.isSolarNow ? (
                            <span className="ml-2 text-xs font-bold text-yellow-300">真太陽</span>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:hidden">
              {table.rows.map((row) => {
                const current = table.isToday && (row.isClockNow || row.isSolarNow);
                const mark = almanac?.tianShenByBranch[row.period.branch];
                return (
                  <li
                    key={row.period.id}
                    aria-current={current ? 'true' : undefined}
                    className={`rounded-xl border px-3 py-3 ${
                      current ? 'border-yellow-400 bg-yellow-500/15' : 'border-yellow-500/15 bg-red-950/40'
                    }`}
                  >
                    <p className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="font-black text-yellow-50">
                        {row.period.name}
                        <span className="ml-2 text-sm font-bold text-yellow-200/70">{row.period.animal}</span>
                      </span>
                      {row.isClockNow ? <span className="text-xs font-bold text-yellow-300">此刻</span> : null}
                    </p>
                    {mark ? (
                      <p className="mb-1 text-sm text-yellow-100/90">
                        <TianShenLabel mark={mark} />
                      </p>
                    ) : null}
                    <p className="font-mono text-sm tabular-nums text-yellow-100/90">鐘錶 {row.clockLabel}</p>
                    <p className="font-mono text-sm tabular-nums text-yellow-100/90">
                      真太陽 {row.solarClockLabel}
                      {row.isSolarNow && !row.isClockNow ? (
                        <span className="ml-2 text-xs font-bold text-yellow-300">此刻</span>
                      ) : null}
                    </p>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="text-center text-sm font-bold text-yellow-200" role="alert">
            請輸入有效日期。
          </p>
        )}
      </div>
    </div>
  );
}
