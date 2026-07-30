sap.ui.define([], function () {
  "use strict";

  return {
    /**
     * Định dạng trạng thái kho thành màu sắc Fiori (ValueState)
     * @param {string} sStatus trạng thái sản phẩm
     * @returns {string} ValueState tương ứng
     */
    statusState: function (sStatus) {
      if (sStatus === "In Stock") {
        return "Success";
      } else if (sStatus === "Low Stock") {
        return "Warning";
      } else if (sStatus === "Out of Stock") {
        return "Error";
      }
      return "None";
    },

    /**
     * Định dạng giá tiền kèm loại tiền tệ
     * @param {number} fPrice số tiền
     * @param {string} sCurrency loại tiền tệ
     * @returns {string} chuỗi định dạng hiển thị
     */
    currencyFormat: function (fPrice, sCurrency) {
      if (!fPrice) {
        return "0.00 " + (sCurrency || "USD");
      }
      var oNumberFormat = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: sCurrency || "USD"
      });
      return oNumberFormat.format(fPrice);
    },

    /**
     * Biểu tượng tương ứng với trạng thái kho
     * @param {string} sStatus trạng thái sản phẩm
     * @returns {string} icon uri
     */
    statusIcon: function (sStatus) {
      if (sStatus === "In Stock") {
        return "sap-icon://accept";
      } else if (sStatus === "Low Stock") {
        return "sap-icon://alert";
      } else if (sStatus === "Out of Stock") {
        return "sap-icon://error";
      }
      return "sap-icon://product";
    }
  };
});
