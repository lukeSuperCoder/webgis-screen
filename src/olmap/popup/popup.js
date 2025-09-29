import { Overlay } from 'ol';
import { fromLonLat } from 'ol/proj';

class Popup {
  constructor(map) {
    this.map = map;
    this.popupElement = document.createElement('div');
    this.popupElement.className = 'ol-popup';
    this.popupOverlay = new Overlay({
      element: this.popupElement,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });

    this.map.addOverlay(this.popupOverlay);
    this._addClickEvent();
  }

  _addClickEvent() {
    this.map.on('singleclick', (event) => {
      const coordinate = event.coordinate;
      this.popupOverlay.setPosition(coordinate);
      this.popupElement.innerHTML = ''; // 清空之前的内容
      this.popupElement.style.display = 'block'; // 显示弹框
    });
  }

  setContent(html) {
    this.popupElement.innerHTML = html; // 设置自定义 HTML 内容
  }

  close() {
    this.popupElement.style.display = 'none'; // 隐藏弹框
  }
}

export default Popup;
