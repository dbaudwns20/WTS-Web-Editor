// 상태 타입 정의
export type PreviewState = {
  original: boolean;
  translate: boolean;
};

// 액션 타입 정의
export type PreviewAction =
  | { type: "original"; payload: boolean }
  | { type: "translate"; payload: boolean };

// 초기 상태 정의
export const previewInitState: PreviewState = {
  original: false,
  translate: false,
};

// 리듀서 함수 정의
export function previewReducer(state: PreviewState, action: PreviewAction) {
  switch (action.type) {
    case "original":
      return {
        ...state,
        original: action.payload,
      };
    case "translate":
      return {
        ...state,
        translate: action.payload,
      };
    default:
      return state;
  }
}
