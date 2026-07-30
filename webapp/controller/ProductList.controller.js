sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/demo/productmanager/model/formatter"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, formatter) {
  "use strict";

  return Controller.extend("sap.ui.demo.productmanager.controller.ProductList", {

    formatter: formatter,

    /**
     * Khởi tạo controller và View Model
     */
    onInit: function () {
      var oViewModel = new JSONModel({
        isEdit: false,
        currentProduct: {},
        editPath: ""
      });
      this.getView().setModel(oViewModel, "view");
    },

    /**
     * Định dạng tiêu đề số lượng sản phẩm
     * @param {string} sTitle chuỗi mẫu từ i18n
     * @param {Array} aProducts mảng sản phẩm
     * @returns {string} tiêu đề hoàn chỉnh
     */
    formatProductTitle: function (sTitle, aProducts) {
      var iCount = aProducts ? aProducts.length : 0;
      return sTitle ? sTitle.replace("{0}", iCount) : "Products (" + iCount + ")";
    },

    /**
     * Xử lý lọc danh sách sản phẩm theo Tên, Category và Giá tối đa
     */
    onFilterChange: function () {
      var aFilters = [];

      // 1. Lọc theo tên hoặc mô tả
      var sQuery = this.byId("searchField").getValue();
      if (sQuery && sQuery.trim() !== "") {
        var oNameFilter = new Filter("name", FilterOperator.Contains, sQuery.trim());
        var oDescFilter = new Filter("description", FilterOperator.Contains, sQuery.trim());
        aFilters.push(new Filter({
          filters: [oNameFilter, oDescFilter],
          and: false
        }));
      }

      // 2. Lọc theo Category
      var sCategory = this.byId("categorySelect").getSelectedKey();
      if (sCategory && sCategory !== "All") {
        aFilters.push(new Filter("category", FilterOperator.EQ, sCategory));
      }

      // 3. Lọc theo Max Price
      var sMaxPrice = this.byId("priceInput").getValue();
      if (sMaxPrice && !isNaN(sMaxPrice) && Number(sMaxPrice) > 0) {
        aFilters.push(new Filter("price", FilterOperator.LE, Number(sMaxPrice)));
      }

      // Áp dụng bộ lọc vào bảng
      var oTable = this.byId("productsTable");
      var oBinding = oTable.getBinding("items");
      if (oBinding) {
        oBinding.filter(aFilters, "Application");
      }
    },

    /**
     * Xóa toàn bộ bộ lọc
     */
    onClearFilters: function () {
      this.byId("searchField").setValue("");
      this.byId("categorySelect").setSelectedKey("All");
      this.byId("priceInput").setValue("");

      var oTable = this.byId("productsTable");
      var oBinding = oTable.getBinding("items");
      if (oBinding) {
        oBinding.filter([], "Application");
      }
      MessageToast.show("Filters cleared.");
    },

    /**
     * Làm mới dữ liệu bảng
     */
    onRefreshData: function () {
      this.onClearFilters();
      MessageToast.show("Data refreshed.");
    },

    /**
     * Mở Dialog để Thêm mới Sản phẩm
     */
    onOpenAddDialog: function () {
      var oViewModel = this.getView().getModel("view");
      oViewModel.setProperty("/isEdit", false);
      oViewModel.setProperty("/editPath", "");
      oViewModel.setProperty("/currentProduct", {
        name: "",
        category: "Electronics",
        price: 199.00,
        currency: "USD",
        stock: 10,
        description: ""
      });

      this._openProductDialog();
    },

    /**
     * Mở Dialog để Sửa Sản phẩm đang chọn
     * @param {sap.ui.base.Event} oEvent sự kiện press từ nút Edit
     */
    onOpenEditDialog: function (oEvent) {
      var oContext = oEvent.getSource().getBindingContext();
      var oProduct = Object.assign({}, oContext.getObject());
      var sPath = oContext.getPath();

      var oViewModel = this.getView().getModel("view");
      oViewModel.setProperty("/isEdit", true);
      oViewModel.setProperty("/editPath", sPath);
      oViewModel.setProperty("/currentProduct", oProduct);

      this._openProductDialog();
    },

    /**
     * Helper load và mở Dialog Fragment
     * @private
     */
    _openProductDialog: function () {
      var oView = this.getView();
      if (!this._pDialog) {
        this._pDialog = this.loadFragment({
          name: "sap.ui.demo.productmanager.view.fragment.ProductDialog"
        }).then(function (oDialog) {
          oView.addDependent(oDialog);
          return oDialog;
        });
      }

      this._pDialog.then(function (oDialog) {
        oDialog.open();
      });
    },

    /**
     * Lưu thông tin từ Dialog vào Model (Thêm mới hoặc Cập nhật)
     */
    onSaveProduct: function () {
      var oViewModel = this.getView().getModel("view");
      var oProductData = oViewModel.getProperty("/currentProduct");
      var bIsEdit = oViewModel.getProperty("/isEdit");
      var sEditPath = oViewModel.getProperty("/editPath");

      // Validate dữ liệu cơ bản
      if (!oProductData.name || oProductData.name.trim() === "") {
        MessageBox.error("Please enter a valid Product Name.");
        return;
      }

      var fPrice = parseFloat(oProductData.price);
      if (isNaN(fPrice) || fPrice < 0) {
        MessageBox.error("Please enter a valid Price.");
        return;
      }

      var iStock = parseInt(oProductData.stock, 10);
      if (isNaN(iStock) || iStock < 0) {
        MessageBox.error("Please enter a valid Stock quantity.");
        return;
      }

      // Tự động tính trạng thái theo số lượng tồn kho
      oProductData.price = fPrice;
      oProductData.stock = iStock;
      if (iStock === 0) {
        oProductData.status = "Out of Stock";
      } else if (iStock <= 10) {
        oProductData.status = "Low Stock";
      } else {
        oProductData.status = "In Stock";
      }

      // Xác định icon theo Category
      oProductData.icon = this._getIconForCategory(oProductData.category);
      oProductData.currency = oProductData.currency || "USD";

      var oModel = this.getView().getModel();
      var aProducts = oModel.getProperty("/products") || [];

      if (!bIsEdit) {
        // Tạo mới ID
        var iNextId = aProducts.length + 1;
        oProductData.id = "PRD-" + ("000" + iNextId).slice(-3);

        aProducts.unshift(oProductData);
        oModel.setProperty("/products", aProducts);
        MessageToast.show("Product successfully added!");
      } else {
        // Cập nhật dòng đang chỉnh sửa
        oModel.setProperty(sEditPath, oProductData);
        MessageToast.show("Product successfully updated!");
      }

      this.onCancelDialog();
    },

    /**
     * Helper xác định icon theo Category
     * @private
     */
    _getIconForCategory: function (sCategory) {
      var mIcons = {
        "Electronics": "sap-icon://laptop",
        "Accessories": "sap-icon://mouse",
        "Furniture": "sap-icon://chair",
        "Software": "sap-icon://cloud",
        "Office Supplies": "sap-icon://print"
      };
      return mIcons[sCategory] || "sap-icon://product";
    },

    /**
     * Đóng Dialog
     */
    onCancelDialog: function () {
      if (this._pDialog) {
        this._pDialog.then(function (oDialog) {
          oDialog.close();
        });
      }
    },

    /**
     * Xóa Sản phẩm khỏi Bảng với hộp thoại xác nhận
     * @param {sap.ui.base.Event} oEvent sự kiện bấm nút Xóa
     */
    onDeleteProduct: function (oEvent) {
      var oContext = oEvent.getSource().getBindingContext();
      var oProduct = oContext.getObject();
      var sPath = oContext.getPath();
      var oModel = this.getView().getModel();

      MessageBox.confirm('Are you sure you want to delete product "' + oProduct.name + '"?', {
        title: "Confirm Deletion",
        icon: MessageBox.Icon.WARNING,
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        emphasizedAction: MessageBox.Action.YES,
        onClose: function (sAction) {
          if (sAction === MessageBox.Action.YES) {
            var iIndex = parseInt(sPath.split("/").pop(), 10);
            var aProducts = oModel.getProperty("/products");
            if (aProducts && !isNaN(iIndex)) {
              aProducts.splice(iIndex, 1);
              oModel.setProperty("/products", aProducts);
              MessageToast.show('Product "' + oProduct.name + '" deleted.');
            }
          }
        }
      });
    }

  });
});
