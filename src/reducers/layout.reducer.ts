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
  let newState: LayoutState = state;
  switch (action.type) {
    case "showStringList":
      newState = {
        ...state,
        showStringList: action.payload,
      };
      break;
    case "stringEditorMode":
      newState = {
        ...state,
        stringEditorMode: action.payload,
      };
      break;
  }
  localStorage.setItem("layout", JSON.stringify(newState));
  return newState;
}
