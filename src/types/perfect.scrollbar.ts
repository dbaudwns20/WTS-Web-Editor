import PS from "perfect-scrollbar";

export class PerfectScrollbar {
  perfectScrollbar: PS | null = null;

  constructor(container: HTMLElement) {
    if (!container) return;
    // 스타일 적용
    container.style.position = "relative";
    // PerfectScrollbar 생성
    this.perfectScrollbar = new PS(container, {
      wheelSpeed: 0.5,
      minScrollbarLength: 30,
    });
    this.update();
  }

  update() {
    this.perfectScrollbar!.update();
  }

  destroy() {
    this.perfectScrollbar!.destroy();
    this.perfectScrollbar = null;
  }
}
