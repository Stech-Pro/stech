// src/components/DateTimeDropdown.jsx
import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import './DateTimeDropdown.css';

export default function DateTimeDropdown({ 
  value, 
  onChange, 
  minuteStep = 15, 
  buttonClass = 'dtpButton' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? dayjs(value) : dayjs());
  const containerRef = useRef(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 날짜 변경
  const handleDateChange = (date) => {
    const newDateTime = selectedDate
      .year(date.year())
      .month(date.month())
      .date(date.date());
    setSelectedDate(newDateTime);
    onChange?.(newDateTime);
  };

  // 시간 변경
  const handleTimeChange = (hour, minute) => {
    const newDateTime = selectedDate.hour(hour).minute(minute).second(0);
    setSelectedDate(newDateTime);
    onChange?.(newDateTime);
  };

  // 현재 시간으로 설정
  const setToCurrentTime = () => {
    const now = dayjs();
    const roundedMinutes = Math.round(now.minute() / minuteStep) * minuteStep;
    const newDateTime = selectedDate
      .hour(now.hour())
      .minute(roundedMinutes)
      .second(0);
    setSelectedDate(newDateTime);
    onChange?.(newDateTime);
  };

  return (
    <div className="datetime-dropdown" ref={containerRef}>
      <button
        type="button"
        className={`datetime-trigger ${buttonClass}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedDate.format('YYYY-MM-DD HH:mm')}
        <span className="dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="datetime-popup">
          <div className="datetime-content">
            {/* 날짜 선택 영역 */}
            <div className="date-section">
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>

            {/* 시간 선택 영역 */}
            <div className="time-section">
              <TimePicker
                value={selectedDate}
                onChange={handleTimeChange}
                minuteStep={minuteStep}
              />
              
              <div className="time-actions">
                <button
                  type="button"
                  className="btn-current-time"
                  onClick={setToCurrentTime}
                >
                  현재 시간
                </button>
              </div>
            </div>
          </div>

          <div className="datetime-footer">
            <button
              type="button"
              className="btn-close"
              onClick={() => setIsOpen(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 날짜 선택기 컴포넌트
function DatePicker({ value, onChange }) {
  const [viewDate, setViewDate] = useState(dayjs(value));

  const goToPrevMonth = () => setViewDate(viewDate.subtract(1, 'month'));
  const goToNextMonth = () => setViewDate(viewDate.add(1, 'month'));

  // 달력 날짜 생성
  const generateCalendarDays = () => {
    const firstDayOfMonth = viewDate.startOf('month');
    const lastDayOfMonth = viewDate.endOf('month');
    const startDate = firstDayOfMonth.startOf('week');
    const endDate = lastDayOfMonth.endOf('week');

    const days = [];
    let current = startDate;

    while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
      days.push(current);
      current = current.add(1, 'day');
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = dayjs();

  return (
    <div className="date-picker">
      {/* 헤더 */}
      <div className="date-header">
        <button type="button" onClick={goToPrevMonth} className="nav-btn">
          ‹
        </button>
        <span className="month-year">
          {viewDate.format('YYYY년 MM월')}
        </span>
        <button type="button" onClick={goToNextMonth} className="nav-btn">
          ›
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="weekdays">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="calendar-grid">
        {calendarDays.map(day => {
          const isCurrentMonth = day.month() === viewDate.month();
          const isToday = day.isSame(today, 'day');
          const isSelected = day.isSame(value, 'day');

          return (
            <button
              key={day.format('YYYY-MM-DD')}
              type="button"
              className={`calendar-day ${
                isCurrentMonth ? '' : 'other-month'
              } ${
                isToday ? 'today' : ''
              } ${
                isSelected ? 'selected' : ''
              }`}
              onClick={() => onChange(day)}
            >
              {day.format('D')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 시간 선택기 컴포넌트
function TimePicker({ value, onChange, minuteStep }) {
  const currentHour = value.hour();
  const currentMinute = value.minute();

  // 시간 옵션 생성 (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  
  // 분 옵션 생성 (minuteStep 간격)
  const minuteOptions = Array.from(
    { length: Math.floor(60 / minuteStep) },
    (_, i) => i * minuteStep
  );

  return (
    <div className="time-picker">
      <div className="time-selectors">
        {/* 시간 선택 */}
        <div className="time-column">
          <label>시</label>
          <select
            value={currentHour}
            onChange={(e) => onChange(parseInt(e.target.value), currentMinute)}
            className="time-select"
          >
            {hourOptions.map(hour => (
              <option key={hour} value={hour}>
                {String(hour).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        <div className="time-separator">:</div>

        {/* 분 선택 */}
        <div className="time-column">
          <label>분</label>
          <select
            value={currentMinute}
            onChange={(e) => onChange(currentHour, parseInt(e.target.value))}
            className="time-select"
          >
            {minuteOptions.map(minute => (
              <option key={minute} value={minute}>
                {String(minute).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 빠른 시간 설정 버튼들 */}
      <div className="quick-time-buttons">
        <button
          type="button"
          className="quick-time-btn"
          onClick={() => onChange(9, 0)}
        >
          09:00
        </button>
        <button
          type="button"
          className="quick-time-btn"
          onClick={() => onChange(14, 0)}
        >
          14:00
        </button>
        <button
          type="button"
          className="quick-time-btn"
          onClick={() => onChange(16, 0)}
        >
          16:00
        </button>
        <button
          type="button"
          className="quick-time-btn"
          onClick={() => onChange(19, 0)}
        >
          19:00
        </button>
      </div>
    </div>
  );
}