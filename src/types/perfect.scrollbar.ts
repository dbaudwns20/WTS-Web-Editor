import PS from "perfect-scrollbar";
import { isMacintosh } from "@/utils/validator";

export class PerfectScrollbar {
  perfectScrollbar: PS | null = null;

  constructor(container: HTMLElement) {
    if (!container) return;
    // 스타일 적용
    container.style.position = "relative";
    // PerfectScrollbar 생성
    this.perfectScrollbar = new PS(container, {
      minScrollbarLength: 15,
      ...(!isMacintosh() && { wheelSpeed: 0.5 }),
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

  private easeInOutQuad = (t: number, b: number, c: number, d: number) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  smoothScroll(element: HTMLElement, target: number, duration: number) {
    const start = element.scrollTop;
    const change = target - start;
    const increment = 20;
    let currentTime = 0;

    const animateScroll = () => {
      currentTime += increment;
      const val = this.easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val;
      if (currentTime < duration) {
        requestAnimationFrame(animateScroll);
      }
    };
    animateScroll();
  }
}
