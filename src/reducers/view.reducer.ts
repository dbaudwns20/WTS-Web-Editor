// 상태 타입 정의
export type ViewState = {
  showStringList: boolean;
  stringEditorMode: "vertical" | "horizontal";
};

// 액션 타입 정의
export type ViewAction =
  | { type: "showStringList"; payload: boolean }
  | { type: "stringEditorMode"; payload: "vertical" | "horizontal" };

// 초기 상태 정의
export const viewInitState: ViewState = {
  showStringList: true,
  stringEditorMode: "horizontal",
};

// 리듀서 함수 정의
export function viewReducer(state: ViewState, action: ViewAction) {
  switch (action.type) {
    case "showStringList":
      return {
        ...state,
        showStringList: action.payload,
      };
    case "stringEditorMode":
      return {
        ...state,
        stringEditorMode: action.payload,
      };
    default:
      return state;
  }
}
