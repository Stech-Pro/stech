import { useMemo, useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import CalendarDropdown from './Calendar.jsx';
import './DateTimeDropdown.css';

export default function DateTimeDropdown({
  value,
  onChange,
  onClose,
  minuteStep = 10,
}) {
  const init = dayjs(value || new Date());
  const [date, setDate] = useState(init.startOf('day'));
  const [hour, setHour] = useState(init.hour());
  const [minute, setMinute] = useState(Math.floor(init.minute() / minuteStep) * minuteStep);

  // 최신 핸들러를 ref로 유지 (의존성 루프 방지)
  const onChangeRef = useRef(onChange);
  const onCloseRef  = useRef(onClose);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { onCloseRef.current  = onClose;  }, [onClose]);

  // 바깥 클릭 닫기 (핸들러는 ref로, 의존성 없음)
  const popRef = useRef(null);
  useEffect(() => {
    const out = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) onCloseRef.current?.();
    };
    document.addEventListener('mousedown', out);
    return () => document.removeEventListener('mousedown', out);
  }, []);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(
    () => Array.from({ length: Math.floor(60 / minuteStep) }, (_, i) => i * minuteStep),
    [minuteStep]
  );

  // 상위로 값 전파 (동일 타임스탬프면 호출 안 함)
  const prevTsRef = useRef(null);
  useEffect(() => {
    const next = date.hour(hour).minute(minute).second(0).millisecond(0);
    const ts = next.valueOf();

    // NaN 방어
    if (Number.isNaN(ts)) return;

    if (prevTsRef.current !== ts) {
      prevTsRef.current = ts;
      onChangeRef.current?.(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, hour, minute]); // ref 의존성은 제외(의도)

  // 외부 value ←→ 내부 state 동기화 (외부가 바뀔 때만)
  useEffect(() => {
    if (!value) return;
    const v = dayjs(value).second(0).millisecond(0);
    const roundedMin = Math.floor(v.minute() / minuteStep) * minuteStep;
    const want = v.minute(roundedMin);
    const cur  = date.hour(hour).minute(minute).second(0).millisecond(0);

    if (cur.valueOf() !== want.valueOf()) {
      setDate(want.startOf('day'));
      setHour(want.hour());
      setMinute(roundedMin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, minuteStep]); // 내부 state 의존성 제외(루프 방지)

  return (
    <div className="dtpPopover" ref={popRef} role="dialog" aria-label="날짜/시간 선택">
      <div className="dtpWrap">
        <div className="dtpCalendar">
          <CalendarDropdown
            value={date}
            onChange={(d) => setDate(dayjs(d).startOf('day'))}
          />
        </div>

        <div className="dtpSide">
          <div className="dtpPreview">
            {date.hour(hour).minute(minute).format('YYYY-MM-DD (ddd) HH:mm')}
          </div>

          <div className="dtpRow">
            <label className="dtpLabel" htmlFor="dtp-hour">시간</label>
            <select
              id="dtp-hour"
              className="dtpSelect"
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
            >
              {hours.map((h) => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
              ))}
            </select>
          </div>

          <div className="dtpRow">
            <label className="dtpLabel" htmlFor="dtp-minute">분</label>
            <select
              id="dtp-minute"
              className="dtpSelect"
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
            >
              {minutes.map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>

          <div className="dtpActions">
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                const now = dayjs();
                setDate(now.startOf('day'));
                setHour(now.hour());
                setMinute(Math.floor(now.minute() / minuteStep) * minuteStep);
              }}
            >
              지금으로
            </button>
            <button type="button" className="btn" onClick={() => onCloseRef.current?.()}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
