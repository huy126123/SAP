sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("sap.ui.demo.productmanager.controller.App", {

    onInit: function () {
      // Áp dụng class density (compact / cozy) lên root App control
      this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
    }

  });
});
