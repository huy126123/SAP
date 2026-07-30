sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/Device",
  "sap/ui/demo/productmanager/model/models"
], function (UIComponent, Device, models) {
  "use strict";

  return UIComponent.extend("sap.ui.demo.productmanager.Component", {

    metadata: {
      manifest: "json"
    },

    /**
     * Khởi tạo component và cấu hình model, router
     */
    init: function () {
      // Gọi init của lớp cha UIComponent
      UIComponent.prototype.init.apply(this, arguments);

      // Thiết lập Device Model
      this.setModel(models.createDeviceModel(), "device");

      // Khởi tạo router (định tuyến ứng dụng)
      this.getRouter().initialize();
    },

    /**
     * Xác định class density phù hợp cho thiết bị (compact cho desktop, cozy cho touch)
     * @returns {string} tên class css density
     */
    getContentDensityClass: function () {
      if (this._sContentDensityClass === undefined) {
        // Kiểm tra khả năng tương tác cảm ứng của thiết bị
        if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
          this._sContentDensityClass = "";
        } else if (!Device.support.touch) {
          this._sContentDensityClass = "sapUiSizeCompact";
        } else {
          this._sContentDensityClass = "sapUiSizeCozy";
        }
      }
      return this._sContentDensityClass;
    }

  });
});
