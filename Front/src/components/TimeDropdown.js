// src/components/TimeDropdown.jsx
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import './Calendar.css';

/**
 * props:
 *  - value: dayjs 인스턴스 (선택된 날짜/시간)
 *  - onChange: (dayjs) => void
 *  - minuteStep: 분 간격 (기본 10)
 */
export default function TimeDropdown({ value, onChange, minuteStep = 10 }) {
  const [local, setLocal] = useState(dayjs(value));

  // 0~23 시 격자 (4열 × 6행)
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  // 분 격자 (minuteStep 간격)
  const mins = useMemo(
    () => Array.from({ length: Math.floor(60 / minuteStep) }, (_, i) => i * minuteStep),
    [minuteStep]
  );

  const setHour = (h) => {
    const next = local.hour(h);
    setLocal(next);
    onChange?.(next);
  };

  const setMinute = (m) => {
    const next = local.minute(m).second(0);
    setLocal(next);
    onChange?.(next);
  };

  return (
    <div className="timeBox">
      <div className="timeSection">
        <div className="timeHeader">시간</div>
        <div className="timeGrid timeGrid-hours">
          {hours.map((h) => {
            const active = local.hour() === h;
            return (
              <button
                key={h}
                className={`timeCell ${active ? 'selected' : ''}`}
                onClick={() => setHour(h)}
              >
                {String(h).padStart(2, '0')}
              </button>
            );
          })}
        </div>
      </div>

      <div className="timeSection">
        <div className="timeHeader">분</div>
        <div className="timeGrid timeGrid-mins">
          {mins.map((m) => {
            const active = local.minute() === m;
            return (
              <button
                key={m}
                className={`timeCell ${active ? 'selected' : ''}`}
                onClick={() => setMinute(m)}
              >
                {String(m).padStart(2, '0')}
              </button>
            );
          })}
        </div>
        <div className="timeQuickRow">
          <button
            className="timeQuick"
            onClick={() => {
              const now = dayjs();
              const snapped = now.minute(Math.round(now.minute() / minuteStep) * minuteStep).second(0);
              setLocal(snapped);
              onChange?.(snapped);
            }}
          >
            지금으로
          </button>
          <button
            className="timeQuick ghost"
            onClick={() => {
              const clearMin = local.minute(0).second(0);
              setLocal(clearMin);
              onChange?.(clearMin);
            }}
          >
            정각
          </button>
        </div>
      </div>
    </div>
  );
}
