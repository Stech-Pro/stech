// src/hooks/useVideoSettings.js

import { useState, useEffect, useCallback } from 'react';

const SETTINGS_STORAGE_KEY = 'video_player_settings';

// Default settings
const DEFAULT_SETTINGS = {
  playbackRate: 1.0,
  skipTime: 1,
  language: 'ko',
  screenRatio: '1920:1080',
  teamRank: 1,
  leaguePosition: 1,
  hotkeys: {
    forward: 'D',
    backward: 'A',
    nextVideo: 'N',
    prevVideo: 'M',
  },
};

// KeyCode를 알파벳으로 변환하는 매핑
const KEY_CODE_MAP = {
  'KeyA': 'A', 'KeyB': 'B', 'KeyC': 'C', 'KeyD': 'D', 'KeyE': 'E',
  'KeyF': 'F', 'KeyG': 'G', 'KeyH': 'H', 'KeyI': 'I', 'KeyJ': 'J',
  'KeyK': 'K', 'KeyL': 'L', 'KeyM': 'M', 'KeyN': 'N', 'KeyO': 'O',
  'KeyP': 'P', 'KeyQ': 'Q', 'KeyR': 'R', 'KeyS': 'S', 'KeyT': 'T',
  'KeyU': 'U', 'KeyV': 'V', 'KeyW': 'W', 'KeyX': 'X', 'KeyY': 'Y',
  'KeyZ': 'Z',
  'Digit0': '0', 'Digit1': '1', 'Digit2': '2', 'Digit3': '3', 'Digit4': '4',
  'Digit5': '5', 'Digit6': '6', 'Digit7': '7', 'Digit8': '8', 'Digit9': '9',
};

export const useVideoSettings = () => {
  const [settings, setSettings] = useState(() => {
    try {
      const storedSettingsJSON = localStorage.getItem(SETTINGS_STORAGE_KEY);

      if (storedSettingsJSON) {
        const storedSettings = JSON.parse(storedSettingsJSON);
        const mergedSettings = {
          ...DEFAULT_SETTINGS,
          ...storedSettings,
          hotkeys: {
            ...DEFAULT_SETTINGS.hotkeys,
            ...(storedSettings.hotkeys || {}),
          },
        };
        return mergedSettings;
      }

      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
  };

  const updateHotkey = (action, key) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      hotkeys: {
        ...prevSettings.hotkeys,
        [action]: key.toUpperCase(),
      },
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  // 이벤트에서 실제 키 값을 추출하는 함수
  const getKeyFromEvent = useCallback((event) => {
    // 1. event.code를 우선 사용 (물리적 키 위치)
    if (event.code && KEY_CODE_MAP[event.code]) {
      return KEY_CODE_MAP[event.code];
    }
    
    // 2. event.key가 영어 알파벳이나 숫자인 경우
    const key = event.key.toUpperCase();
    if (key.length === 1 && /[A-Z0-9]/.test(key)) {
      return key;
    }
    
    // 3. 한글 등 다른 문자인 경우 code로 다시 확인
    if (event.code && event.code.startsWith('Key')) {
      return event.code.replace('Key', '');
    }
    
    return null;
  }, []);

  // 핫키 체크 함수 - 언어 설정과 관계없이 작동
  const checkHotkey = useCallback((event, action) => {
    const actualKey = getKeyFromEvent(event);
    const hotkeyForAction = settings.hotkeys[action];
    
    return hotkeyForAction && actualKey === hotkeyForAction;
  }, [settings.hotkeys, getKeyFromEvent]);

  // 전역 핫키 리스너
  const handleGlobalHotkey = useCallback((event) => {
    // 입력 필드에 포커스가 있을 때는 무시
    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' ||
        event.target.contentEditable === 'true') {
      return;
    }

    const actualKey = getKeyFromEvent(event);
    if (!actualKey) return;
    
    // 각 핫키 액션에 대한 처리
    Object.entries(settings.hotkeys).forEach(([action, key]) => {
      if (actualKey === key) {
        const customEvent = new CustomEvent('hotkey-pressed', {
          detail: { action, key: actualKey }
        });
        window.dispatchEvent(customEvent);
      }
    });
  }, [settings.hotkeys, getKeyFromEvent]);

  useEffect(() => {
    const enableGlobalHotkeys = true;
    
    if (enableGlobalHotkeys) {
      window.addEventListener('keydown', handleGlobalHotkey);
      return () => window.removeEventListener('keydown', handleGlobalHotkey);
    }
  }, [handleGlobalHotkey]);

  return {
    settings,
    updateSetting,
    updateHotkey,
    resetSettings,
    checkHotkey,
    getKeyFromEvent, // 키 추출 함수도 내보내기
  };
};