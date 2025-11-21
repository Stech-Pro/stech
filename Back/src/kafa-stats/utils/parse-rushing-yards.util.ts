/**
 * KAFA 러싱 야드 문자열 파싱 유틸리티
 */

export interface ParsedRushingYards {
  totalYards: number;
  forwardYards: number;
  backwardYards: number;
  rawString: string;
}

/**
 * "383 (전진 : 434 / 후퇴 : -51)" 형태의 문자열을 파싱
 * @param yardString KAFA 사이트의 러싱 야드 문자열
 * @returns 파싱된 야드 정보
 */
export function parseRushingYards(yardString: string): ParsedRushingYards {
  // 기본값
  const result: ParsedRushingYards = {
    totalYards: 0,
    forwardYards: 0,
    backwardYards: 0,
    rawString: yardString
  };

  try {
    // 전체 야드 추출 (첫 번째 숫자)
    const totalMatch = yardString.match(/^(-?\d+)/);
    if (totalMatch) {
      result.totalYards = parseInt(totalMatch[1]);
    }

    // 전진 야드 추출
    const forwardMatch = yardString.match(/전진\s*:\s*(\d+)/);
    if (forwardMatch) {
      result.forwardYards = parseInt(forwardMatch[1]);
    }

    // 후퇴 야드 추출 (음수값으로 저장)
    const backwardMatch = yardString.match(/후퇴\s*:\s*(-?\d+)/);
    if (backwardMatch) {
      result.backwardYards = parseInt(backwardMatch[1]);
      // 만약 양수로 들어왔다면 음수로 변환
      if (result.backwardYards > 0) {
        result.backwardYards = -result.backwardYards;
      }
    }

    // 검증: total = forward + backward
    const calculatedTotal = result.forwardYards + result.backwardYards;
    if (Math.abs(calculatedTotal - result.totalYards) > 1) {
      console.warn(`야드 계산 불일치: ${yardString}`);
    }

  } catch (error) {
    console.error(`러싱 야드 파싱 실패: ${yardString}`, error);
  }

  return result;
}

/**
 * 사용 예시
 * 
 * const parsed = parseRushingYards("383 (전진 : 434 / 후퇴 : -51)");
 * console.log(parsed);
 * // {
 * //   totalYards: 383,
 * //   forwardYards: 434,
 * //   backwardYards: -51,
 * //   rawString: "383 (전진 : 434 / 후퇴 : -51)"
 * // }
 */