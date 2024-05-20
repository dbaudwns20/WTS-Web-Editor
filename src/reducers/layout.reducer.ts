// 상태 타입 정의
export type LayoutState = {
  showStringList: boolean;
  stringEditorMode: "vertical" | "horizontal";
};

// 액션 타입 정의
export type LayoutAction =
  | { type: "showStringList"; payload: boolean }
  | { type: "stringEditorMode"; payload: "vertical" | "horizontal" };

// 초기 상태 정의
export const layoutInitState: LayoutState = {
  showStringList: true,
  stringEditorMode: "horizontal",
};

// 리듀서 함수 정의
export function layoutReducer(state: LayoutState, action: LayoutAction) {
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
