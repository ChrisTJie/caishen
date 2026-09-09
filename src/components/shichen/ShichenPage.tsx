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
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
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

function TianShenYiJi({ mark }: { mark: TianShenMark }) {
  return (
    <div className="text-sm leading-relaxed text-yellow-100/80">
      <p className="text-yellow-200/80">{mark.office}</p>
      {mark.yi.length > 0 ? (
        <p>
          <span className="font-bold text-yellow-300/90">宜</span>
          <span className="ml-1">{mark.yi.join('、')}</span>
        </p>
      ) : null}
      {mark.ji.length > 0 ? (
        <p>
          <span className="font-bold text-stone-300">忌</span>
          <span className="ml-1">{mark.ji.join('、')}</span>
        </p>
      ) : null}
      <p className="mt-0.5 text-yellow-200/60">{mark.note}</p>
    </div>
  );
}

function NowBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full border border-yellow-300/50 bg-yellow-400/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-yellow-100 shadow-[0_0_10px_rgba(250,204,21,0.28)]">
      {children}
    </span>
  );
}

function tableRowClass(isClock: boolean, isSolar: boolean): string {
  const base = 'border-b [&>td]:align-top';
  if (isClock) {
    return `${base} border-yellow-400/25 bg-[linear-gradient(90deg,rgba(250,204,21,0.12)_0%,rgba(250,204,21,0.045)_36%,rgba(250,204,21,0)_100%)] shadow-[inset_0_1px_0_rgba(253,224,71,0.28),inset_0_-1px_0_rgba(253,224,71,0.1)]`;
  }
  if (isSolar) {
    return `${base} border-yellow-500/15 bg-[linear-gradient(90deg,rgba(253,224,71,0.08)_0%,rgba(253,224,71,0)_52%)]`;
  }
  return `${base} border-yellow-500/10`;
}

function firstColClass(isClock: boolean, isSolar: boolean): string {
  const base = 'border-l-[3px] py-3 pr-3 pl-4';
  if (isClock) return `${base} border-l-yellow-400`;
  if (isSolar) return `${base} border-l-yellow-400/60`;
  return `${base} border-l-transparent`;
}

function cardClass(isClock: boolean, isSolar: boolean): string {
  const base = 'rounded-xl border px-3 py-3';
  if (isClock) {
    return `${base} border-yellow-400/40 bg-gradient-to-br from-yellow-400/10 via-red-950/30 to-red-950/45 pl-4 shadow-[inset_3px_0_0_#facc15,0_0_16px_rgba(250,204,21,0.14)]`;
  }
  if (isSolar) {
    return `${base} border-yellow-400/35 bg-red-950/45 pl-4 shadow-[inset_3px_0_0_rgba(250,204,21,0.55)]`;
  }
  return `${base} border-yellow-500/15 bg-red-950/40`;
}

export function ShichenPage() {
  const now = useTaipeiClock();
  const todayYmd = getTaipeiDateTime(now).ymd;
  const [ymd, setYmd] = useState(todayYmd);
  const [cityId, setCityId] = useState(DEFAULT_CITY_ID);

  const table = useMemo(() => buildShichenTable({ ymd, cityId, now }), [ymd, cityId, now]);
  const almanac = useMemo(() => getAlmanacDay(ymd), [ymd]);

  const clockRow = table?.rows.find((row) => row.period.id === table.clockPeriodId);
  const solarName = table?.rows.find((row) => row.period.id === table.solarPeriodId)?.period.name;
  const clockName = clockRow?.period.name;
  const clockMark = clockRow && almanac ? almanac.tianShenByBranch[clockRow.period.branch] : undefined;

  return (
    <div className="animate-fade-in mx-auto w-full">
      <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-b from-[#5c0b0b] to-[#2a0505] p-5 shadow-2xl sm:rounded-3xl sm:p-8 lg:p-10">
        <header className="relative mb-8 text-center md:mb-10">
          <h2 className="mb-3 bg-gradient-to-b from-yellow-200 to-yellow-600 bg-clip-text text-3xl font-black text-transparent sm:text-4xl md:text-6xl">
            時辰真實表
          </h2>
          <p className="text-sm tracking-wide text-yellow-200/80 md:tracking-widest">
            查閱當日農曆、十二時辰、黃黑道與傳統宜忌
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
            <p>
              宜忌為該時辰值神的傳統職司與常見擇時考量，與黃曆「宜／忌」欄不是同一套；具體辦事仍應以各家通書為準，僅供民俗參考。
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
                className="mb-6 rounded-2xl border border-yellow-300/40 bg-gradient-to-b from-yellow-400/10 to-transparent px-4 py-3 text-center text-yellow-50 shadow-[0_0_24px_rgba(250,204,21,0.08)]"
                role="status"
              >
                <p className="text-sm font-bold tracking-wide">
                  {`此刻鐘錶為${clockName}${
                    table.clockDiffersFromSolar && solarName ? `，真太陽時為${solarName}` : ''
                  }${table.nearBoundary ? '；接近時辰交界，請一併核對真太陽時。' : '。'}`}
                </p>
                {clockMark ? (
                  <div className="mt-2 text-left sm:mx-auto sm:max-w-xl">
                    <p className="mb-1 text-sm text-yellow-100/90">
                      <TianShenLabel mark={clockMark} />
                    </p>
                    <TianShenYiJi mark={clockMark} />
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mb-6 text-center text-sm text-yellow-100/70">指定日期不顯示此刻，僅列出該日完整時辰。</p>
            )}

            <p className="mb-2 text-center text-xs leading-relaxed text-yellow-100/70">
              {`${table.city.name}東經 ${table.city.longitude.toFixed(2)}° · 經度修正 ${formatSignedMinutes(table.longitudeOffsetMinutes)} · 均時差 ${formatSignedMinutes(table.equationOfTimeMinutes)} · 合計 ${formatSignedMinutes(table.totalOffsetMinutes)}`}
            </p>
            <p className="mb-4 text-center text-xs leading-relaxed text-yellow-100/60">
              黃道吉以金點標示，黑道凶以灰點標示。宜忌隨值神而變，不是當日黃曆宜忌欄。子時為
              23:00–01:00，跨兩個公曆日。
            </p>

            <div className="hidden md:block">
              <table className="w-full table-fixed border-collapse text-left text-sm text-yellow-100">
                <caption className="sr-only">
                  {table.ymd} {table.city.name}十二時辰、真太陽時、黃黑道與宜忌對照
                </caption>
                <colgroup>
                  <col className="w-[11%]" />
                  <col className="w-[8%]" />
                  <col className="w-[18%]" />
                  <col className="w-[35%]" />
                  <col className="w-[14%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-yellow-500/30 text-yellow-200">
                    <th className="border-l-[3px] border-l-transparent py-3 pr-3 pl-4 font-bold">時辰</th>
                    <th className="py-3 pr-3 font-bold">生肖</th>
                    <th className="py-3 pr-3 font-bold">黃黑道</th>
                    <th className="py-3 pr-3 font-bold">宜忌考量</th>
                    <th className="py-3 pr-3 font-bold">鐘錶時間</th>
                    <th className="py-3 font-bold">真太陽時</th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row) => {
                    const isClock = table.isToday && row.isClockNow;
                    const isSolar = table.isToday && row.isSolarNow;
                    const current = isClock || isSolar;
                    const mark = almanac?.tianShenByBranch[row.period.branch];
                    return (
                      <tr
                        key={row.period.id}
                        aria-current={current ? 'true' : undefined}
                        className={tableRowClass(isClock, isSolar)}
                      >
                        <td
                          className={`${firstColClass(isClock, isSolar)} font-black ${
                            current ? 'text-yellow-100 drop-shadow-[0_0_8px_rgba(250,204,21,0.35)]' : 'text-yellow-50'
                          }`}
                        >
                          {row.period.name}
                        </td>
                        <td className="py-3 pr-3 text-yellow-100/80">{row.period.animal}</td>
                        <td className="py-3 pr-3">{mark ? <TianShenLabel mark={mark} /> : '—'}</td>
                        <td className="py-3 pr-3 break-words">
                          {mark ? <TianShenYiJi mark={mark} /> : '—'}
                        </td>
                        <td className="py-3 pr-3 font-mono text-xs tabular-nums xl:text-sm">
                          <span className="whitespace-nowrap">{row.clockLabel}</span>
                          {isClock ? (
                            <span className="mt-1.5 block">
                              <NowBadge>此刻</NowBadge>
                            </span>
                          ) : null}
                        </td>
                        <td className="py-3 font-mono text-xs tabular-nums xl:text-sm">
                          <span className="whitespace-nowrap">{row.solarClockLabel}</span>
                          {isSolar ? (
                            <span className="mt-1.5 block">
                              <NowBadge>真太陽</NowBadge>
                            </span>
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
                const isClock = table.isToday && row.isClockNow;
                const isSolar = table.isToday && row.isSolarNow;
                const current = isClock || isSolar;
                const mark = almanac?.tianShenByBranch[row.period.branch];
                return (
                  <li
                    key={row.period.id}
                    aria-current={current ? 'true' : undefined}
                    className={cardClass(isClock, isSolar)}
                  >
                    <p className="mb-1 flex items-baseline justify-between gap-2">
                      <span
                        className={`font-black ${
                          current ? 'text-yellow-100 drop-shadow-[0_0_8px_rgba(250,204,21,0.35)]' : 'text-yellow-50'
                        }`}
                      >
                        {row.period.name}
                        <span className="ml-2 text-sm font-bold text-yellow-200/70">{row.period.animal}</span>
                      </span>
                      {isClock ? <NowBadge>此刻</NowBadge> : null}
                    </p>
                    {mark ? (
                      <div className="mb-2 space-y-1">
                        <p className="text-sm text-yellow-100/90">
                          <TianShenLabel mark={mark} />
                        </p>
                        <TianShenYiJi mark={mark} />
                      </div>
                    ) : null}
                    <p className="font-mono text-sm tabular-nums text-yellow-100/90">鐘錶 {row.clockLabel}</p>
                    <p className="font-mono text-sm tabular-nums text-yellow-100/90">
                      真太陽 {row.solarClockLabel}
                      {isSolar && !isClock ? (
                        <span className="ml-2">
                          <NowBadge>真太陽</NowBadge>
                        </span>
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
