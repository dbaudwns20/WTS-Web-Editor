// 상태 타입 정의
export type PreferenceState = {
  autoMove: boolean;
  skipCompleted: boolean;
};

// 액션 타입 정의
export type PreferenceAction =
  | { type: "autoMove"; payload: boolean }
  | { type: "skipCompleted"; payload: boolean };

// 초기 상태 정의
export const preferenceInitState: PreferenceState = {
  autoMove: false,
  skipCompleted: false,
};

// 리듀서 함수 정의
export function preferenceReducer(
  state: PreferenceState,
  action: PreferenceAction
) {
  let newState: PreferenceState = state;
  switch (action.type) {
    case "autoMove":
      newState = {
        ...state,
        autoMove: action.payload,
      };
      break;
    case "skipCompleted":
      newState = {
        ...state,
        skipCompleted: action.payload,
      };
      break;
  }
  localStorage.setItem("preference", JSON.stringify(newState));
  return newState;
}
