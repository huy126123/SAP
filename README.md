# SAP UI5 Freestyle Fiori Application - Product & Category Manager

[![SAPUI5](https://img.shields.io/badge/SAPUI5-v1.120.0-blue.svg)](https://ui5.sap.com/)
[![SAP BTP](https://img.shields.io/badge/Deploy-SAP%20BTP%20HTML5%20Repository-orange.svg)](https://www.sap.com/products/technology-platform.html)
[![SAP Build Work Zone](https://img.shields.io/badge/Integration-SAP%20Build%20Work%20Zone-008FD3.svg)](https://www.sap.com/products/build-work-zone.html)

Dự án **SAP UI5 Freestyle Fiori Application (Product & Category Manager)** được xây dựng theo tiêu chuẩn **SAP Fiori Design Guidelines (Horizon Theme)**, quản lý danh sách sản phẩm hiển thị dạng bảng (Table), tích hợp bộ lọc đa tiêu chí (Tên, Danh mục, Giá) và tính năng Thêm / Sửa / Xóa (CRUD) tương tác trực tiếp với dữ liệu local (`data.json`).

Dự án được cấu hình sẵn sàng cho việc đóng gói Multi-Target Application (**MTA**) và deploy lên **SAP BTP Cockpit (HTML5 Application Repository)** cũng như tích hợp vào **SAP Build Work Zone Launchpad**.

---

## 📋 Mục lục
- [1. Tính năng nổi bật](#1-tính-năng-nổi-bật)
- [2. Cấu trúc Dự án](#2-cấu-trúc-dự-án)
- [3. Hướng dẫn Cài đặt & Chạy Local](#3-hướng-dẫn-cài-đặt--chạy-local)
- [4. Đóng gói & Build (UI5 & MTA)](#4-đóng-gói--build-ui5--mta)
- [5. Hướng dẫn Deploy lên SAP BTP Cockpit](#5-hướng-dẫn-deploy-lên-sap-btp-cockpit)
- [6. Cấu hình & Tích hợp vào SAP Build Work Zone](#6-cấu-hình--tích-hợp-vào-sap-build-work-zone)

---

## 1. Tính năng nổi bật

- 📊 **Table Sản phẩm chuẩn Fiori (`sap.m.Table`)**: Hiển thị danh sách sản phẩm gồm ID, Tên, Mô tả, Danh mục (dạng Tag/Badge), Giá tiền (định dạng chuẩn tiền tệ), Số lượng tồn kho và Trạng thái màu sắc (Success: *In Stock*, Warning: *Low Stock*, Error: *Out of Stock*).
- 🔍 **Bộ lọc (FilterBar / Subheader Filter)**:
  - **Search**: Tìm kiếm tức thì theo **Tên** hoặc **Mô tả**.
  - **Category**: Lọc theo danh mục sản phẩm (`Electronics`, `Accessories`, `Furniture`, `Software`, `Office Supplies`).
  - **Max Price**: Lọc sản phẩm có giá thấp hơn hoặc bằng mức giá cấu hình.
  - **Clear Filters**: Đặt lại bộ lọc với 1 nút bấm.
- 🛠️ **Thao tác CRUD Đầy đủ**:
  - **Create**: Click `+ Add Product`, nhập thông tin trên Fiori Dialog (`SimpleForm`), tự động tạo ID và chèn vào bảng.
  - **Update**: Click icon `Edit` trên dòng sản phẩm, cập nhật giá/tên/kho và tự động tính toán lại trạng thái.
  - **Delete**: Click icon `Delete`, hiển thị hộp thoại xác nhận `MessageBox.confirm` và xóa sản phẩm.
- ☁️ **Sẵn sàng cho Cloud**: Đầy đủ descriptor `mta.yaml`, `xs-security.json`, `xs-app.json` và cấu hình `crossNavigation.inbounds` trong `manifest.json`.

---

## 2. Cấu trúc Dự án

```
SAP/
├── package.json                   # UI5 Tooling dependencies & scripts
├── ui5.yaml                       # Cấu hình UI5 development server (Local)
├── ui5-dist.yaml                  # Cấu hình UI5 production build cho BTP HTML5 Repo
├── mta.yaml                       # BTP Cloud Foundry Multi-Target Application descriptor
├── xs-security.json               # Cấu hình XSUAA Security Profile
├── xs-app.json                    # Router cấu hình cho BTP HTML5 Repo Host
└── webapp/
    ├── index.html                 # Trang Standalone local launcher (CDN UI5 1.120.0)
    ├── manifest.json              # Application descriptor (Models, Routing, FLP Tile inbounds)
    ├── Component.js               # Component lifecycle & density handling
    ├── css/style.css              # Custom styling theo phong cách Horizon
    ├── i18n/                      # Quốc tế hóa (i18n.properties & i18n_en.properties)
    ├── model/
    │   ├── data.json              # Dữ liệu ban đầu (10 Products & Categories)
    │   ├── formatter.js           # Hàm định dạng tiền tệ & trạng thái kho
    │   └── models.js              # Khởi tạo Device Model
    ├── test/
    │   └── flpSandbox.html        # Môi trường giả lập SAP Build Work Zone Launchpad local
    ├── view/
    │   ├── App.view.xml           # Root App View
    │   ├── ProductList.view.xml   # Trang chính hiển thị Bộ lọc & Bảng sản phẩm
    │   └── fragment/
    │       └── ProductDialog.fragment.xml # Fragment Dialog cho Create & Update
    └── controller/
        ├── App.controller.js      # Root Controller
        └── ProductList.controller.js  # Xử lý Logic Filter & CRUD
```

---

## 3. Hướng dẫn Cài đặt & Chạy Local

### Yêu cầu hệ thống (Prerequisites)
- [Node.js](https://nodejs.org/) (phiên bản v18 hoặc v20 LTS).
- [Git](https://git-scm.com/).
- [Cloud Foundry CLI (`cf-cli`)](https://github.com/cloudfoundry/cli#downloads) (để deploy lên BTP).
- [Cloud MTA Build Tool (`mbt`)](https://sap.github.io/cloud-mta-build-tool/) (cài toàn cục: `npm install -g mbt`).

### Cài đặt Dependencies
Mở Terminal / PowerShell tại thư mục dự án và chạy:
```powershell
npm install
```

### Chạy ứng dụng tại Local Development Server
```powershell
npm start
```
- Ứng dụng Standalone sẽ tự động mở tại trình duyệt:  
  👉 **`http://localhost:8080/index.html`**
- Để kiểm thử giao diện **Launchpad Tile** giống như trên SAP Build Work Zone, truy cập URL Sandbox:  
  👉 **`http://localhost:8080/test/flpSandbox.html`**

---

## 4. Đóng gói & Build (UI5 & MTA)

### 1. Build gói HTML5 Application (`Component-preload.js` & Archive ZIP)
Lệnh này sử dụng `@ui5/cli` kết hợp `@sap/ux-ui5-tooling` và `ui5-task-zipper` để tối ưu hóa code và đóng gói vào thư mục `dist/`:
```powershell
npm run build:ui5
```

### 2. Build gói Multi-Target Application (`.mtar` archive)
Để tạo file lưu trữ chuẩn Cloud Foundry `.mtar` (chứa HTML5 module + Destination module + cấu hình Service), chạy lệnh:
```powershell
mbt build
```
*(Hoặc `npm run build:mta`). File `.mtar` sau khi build sẽ được tạo trong thư mục `mta_archives/sap.ui.demo.productmanager_1.0.0.mtar`.*

---

## 5. Hướng dẫn Deploy lên SAP BTP Cockpit

### Bước 1: Đăng nhập vào Cloud Foundry CLI (`cf login`)
```powershell
cf login -a https://api.cf.eu10.hana.ondemand.com
```
*(Thay URL API `eu10` hoặc `us10` tương ứng với region của Subaccount SAP BTP của bạn. Sau đó chọn đúng Org và Space).*

### Bước 2: Deploy file MTAR lên BTP
```powershell
cf deploy mta_archives/sap.ui.demo.productmanager_1.0.0.mtar
```

Khi tiến trình hoàn tất, Cloud Foundry sẽ tự động tạo/liên kết 3 dịch vụ được định nghĩa trong `mta.yaml`:
- **`sapui5-fiori-html5-repo-host`**: Lưu trữ gói webapp HTML5 tĩnh.
- **`sapui5-fiori-destination-service`**: Tạo Destination `sapui5fiorimanager-rt` và tự động cập nhật metadata lên HTML5 Application Repository để Work Zone có thể phát hiện.
- **`sapui5-fiori-xsuaa-service`**: Quản lý bảo mật XSUAA và Role Templates (`Viewer`, `Manager`).

Bạn có thể kiểm tra ứng dụng trong **SAP BTP Cockpit → HTML5 Applications**.

---

## 6. Cấu hình & Tích hợp vào SAP Build Work Zone

Ứng dụng đã được cấu hình section `crossNavigation.inbounds` trong file `webapp/manifest.json`:
```json
"crossNavigation": {
  "inbounds": {
    "Product-manage": {
      "semanticObject": "Product",
      "action": "manage",
      "title": "Product Manager",
      "subTitle": "Freestyle UI5 App",
      "icon": "sap-icon://product"
    }
  }
}
```

### Các bước tích hợp trên trang Quản trị SAP Build Work Zone (Site Manager):
1. **Đồng bộ nội dung (Content Explorer)**:
   - Trong SAP Build Work Zone (Standard or Advanced Edition) → chọn **Channel Manager** hoặc **Content Explorer**.
   - Nhấn **Update** tại **HTML5 Apps** (hoặc Custom Content Provider).
   - Chọn ứng dụng `Product Manager (sap.ui.demo.productmanager)` và chọn **Add to My Content**.
2. **Tạo Catalog / Group**:
   - Vào **My Content** → Nhấn vào ứng dụng **Product Manager**.
   - Gán ứng dụng vào một **Group** hoặc **Catalog** (ví dụ: *Product Administration*).
3. **Phân quyền Role**:
   - Vào tab **Roles** → Chọn Role mong muốn (ví dụ: `Everyone` hoặc tạo Role mới `ProductManagerRole`).
   - Gán ứng dụng `Product Manager` vào Role này để người dùng có thể xem được Tile.
4. **Hiển thị trên Site Launchpad**:
   - Vào **Site Directory** → Mở **Site** của bạn (hoặc tạo Site mới).
   - Truy cập trang chủ Launchpad, bạn sẽ thấy **Tile "Product Manager"** xuất hiện. Nhấp vào Tile để khởi chạy ứng dụng!

---

## 💡 Hỗ trợ & Khắc phục sự cố (Troubleshooting)

- **Lỗi không tìm thấy `mbt` khi build mta**: Đảm bảo bạn đã cài đặt Cloud MTA Build Tool (`npm i -g mbt`) và đã thêm vào biến môi trường PATH.
- **Lỗi 404 khi gọi `/resources` từ local**: Kiểm tra kết nối mạng hoặc SSL proxy, Custom Middleware `fiori-tools-proxy` trong `ui5.yaml` sẽ tự động tải các tài nguyên từ CDN `https://ui5.sap.com`.
