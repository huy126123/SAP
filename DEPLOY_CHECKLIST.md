# Báo Cáo Kiểm Tra Môi Trường & Hướng Dẫn Hoàn Thành Deploy SAP BTP / Work Zone

Tài liệu này tổng hợp kết quả kiểm tra tự động môi trường thực tế trên máy Windows của bạn đối với dự án **SAP UI5 Freestyle Fiori (`sap.ui.demo.productmanager`)**, cùng hướng dẫn chi tiết từng lệnh để bạn tự hoàn tất các bước còn lại và deploy lên **SAP BTP Cockpit** & **SAP Build Work Zone**.

---

## 1. Bảng Trạng Thái Kiểm Tra Môi Trường (Live Status)

| # | Công cụ / Cấu hình | Trạng thái | Phiên bản / Chi tiết | Ghi chú |
| :-: | :--- | :---: | :--- | :--- |
| **1** | **Node.js (Runtime)** | ✅ **Đã cài đặt** | `v20.11.1` (LTS) | Đạt chuẩn để chạy UI5 Tooling và CLI. |
| **2** | **UI5 Tooling & Dependencies** | ✅ **Thành công** | `@ui5/cli`, `@sap/ux-ui5-tooling`, `ui5-task-zipper` | Đã kiểm thử `npm run build:ui5` tạo ra thư mục `dist/` và `.zip` không lỗi. |
| **3** | **Cloud MTA Build Tool (`mbt`)** | ✅ **Thành công** | `v1.2.47` (qua `npx mbt`) | Cung cấp sẵn trong devDependencies của dự án. |
| **4** | **Cloud Foundry CLI (`cf` / `cf8`)** | ✅ **Đã cài đặt** | `v8.7.11` | Công cụ giao tiếp với BTP Cockpit đã sẵn sàng trong PATH. |
| **5** | **GNU Make (`make.exe`)** | ❌ **Chưa có trong PATH** | *Chưa tìm thấy lệnh `make`* | Bắt buộc phải có để `mbt build` đóng gói file `.mtar`. |
| **6** | **Kết nối BTP (`cf target` / login)** | ❌ **Chưa đăng nhập** | *Chưa kết nối API Endpoint* | Bắt buộc phải login vào Subaccount/Org/Space trên BTP Cockpit. |
| **7** | **BTP Service Quotas / Entitlements** | ⚠️ **Cần xác nhận** | *Hạn mức Cloud Foundry trên BTP* | Cần có quyền khởi tạo 3 dịch vụ: `html5-apps-repo`, `destination`, `xsuaa`. |

---

## 2. Hướng Dẫn Hoàn Thành Các Bước Còn Thiếu (❌)

### ❌ BƯỚC 1: Cài đặt và cấu hình lệnh `make` (GNU Make)

Lệnh `mbt build` (để tạo file mtar deploy BTP) sử dụng trình biên dịch `make` dưới nền. Do máy bạn chưa có lệnh này trong Biến môi trường (`%PATH%`), bạn có thể chọn **1 trong 2 cách sau** để bổ sung:

#### Cách A: Cài qua Winget và thêm PATH thủ công (Khuyên dùng - Chuẩn GnuWin32)
1. Mở PowerShell với quyền Administrator (hoặc user thông thường) và chạy:
   ```powershell
   winget install -e --id GnuWin32.Make --silent
   ```
2. Sau khi cài xong, thư mục mặc định của GnuWin32 là `C:\Program Files (x86)\GnuWin32\bin`. Bạn chạy lệnh PowerShell sau để đưa thư mục này vào Biến môi trường PATH của máy tính:
   ```powershell
   $oldPath = [Environment]::GetEnvironmentVariable("Path", "User")
   if ($oldPath -notlike "*GnuWin32*") {
       [Environment]::SetEnvironmentVariable("Path", "$oldPath;C:\Program Files (x86)\GnuWin32\bin", "User")
       Write-Host "Đã thêm GnuWin32 vào PATH User thành công!" -ForegroundColor Green
   }
   ```
3. **Đóng và mở lại cửa sổ PowerShell/Terminal mới**, gõ thử `make -v`. Nếu hiện `GNU Make 3.81` là thành công ✅.

#### Cách B: Dùng trình quản lý gói Scoop hoặc Chocolatey (Nếu máy có sẵn)
- **Nếu dùng Chocolatey**:
  ```powershell
  choco install make -y
  ```
- **Nếu dùng Scoop**:
  ```powershell
  scoop install make
  ```

---

### ❌ BƯỚC 2: Đăng nhập vào SAP BTP Cockpit (`cf login`)

Sau khi có `make`, bước tiếp theo là kết nối máy tính của bạn với tài khoản SAP BTP Cockpit thông qua `cf` CLI:

1. **Lấy API Endpoint của Subaccount**:
   - Đăng nhập vào trang [SAP BTP Cockpit](https://account.hanatrial.ondemand.com/cockpit).
   - Vào **Subaccount** của bạn (ví dụ: *Trial* hoặc *Production*).
   - Ở trang **Overview**, tìm mục **Cloud Foundry Environment** -> Sao chép địa chỉ **API Endpoint** (ví dụ: `https://api.cf.eu10.hana.ondemand.com` hoặc `https://api.cf.us10-001.hana.ondemand.com`).

2. **Chạy lệnh đăng nhập SSO an toàn trên PowerShell**:
   ```powershell
   cf login -a https://api.cf.eu10.hana.ondemand.com --sso
   ```
   *(Thay `eu10` bằng region thực tế của bạn).*
   - Terminal sẽ hiển thị một đường dẫn URL (ví dụ: `https://login.cf.eu10.hana.ondemand.com/passcode`).
   - Mở URL đó trên trình duyệt -> Đăng nhập bằng tài khoản BTP -> Nhận một đoạn **Passcode**.
   - Dán mã Passcode vào Terminal và nhấn **Enter**.
   - Chọn đúng **Organization (Org)** và **Space** (ví dụ: `dev`).

3. **Kiểm tra trạng thái đăng nhập thành công**:
   ```powershell
   cf target
   ```
   *Nếu hiển thị đúng thông tin `API endpoint`, `User`, `Org`, và `Space` tức là đã sẵn sàng deploy ✅.*

---

### ⚠️ BƯỚC 3: Kiểm tra Service Entitlements (Quyền hạn dịch vụ) trên BTP Cockpit

Trước khi deploy file Multi-Target Application (`.mtar`), hãy đảm bảo Subaccount của bạn đã bật **Entitlements (Hạn mức)** cho 3 dịch vụ được định nghĩa trong `mta.yaml`:

1. **HTML5 Application Repository Service**:
   - Service: `html5-apps-repo`
   - Plan: `app-host` (để lưu trữ ứng dụng tĩnh) và `app-runtime` / `app-runtime-lite`.
2. **Destination Service**:
   - Service: `destination`
   - Plan: `lite`
3. **Authorization & Trust Management Service (XSUAA)**:
   - Service: `xsuaa`
   - Plan: `application`

👉 **Cách kiểm tra trên BTP Cockpit**:  
Vào **Subaccount -> Entitlements -> Configure Entitlements -> Add Service Plans**, kiểm tra và thêm 3 dịch vụ trên nếu chưa có.

---

## 3. Quy Trình 3 Bước Hoàn Tất Build & Deploy Lên Cloud

Sau khi bạn đã có dấu check xanh ✅ cho toàn bộ các mục ở bảng trên, chỉ cần thực hiện lần lượt 3 lệnh sau tại thư mục gốc của dự án (`c:\Users\ASUS\OneDrive\Desktop\Shit Code\SAP`):

### 1️⃣ Đóng gói ứng dụng Fiori HTML5
```powershell
npm run build:ui5
```
*Lệnh này sẽ compile và tạo thư mục `dist/` chứa `Component-preload.js` cùng file zip `sapuidemoproductmanager.zip`.*

### 2️⃣ Build gói Cloud Foundry Multi-Target Application (`.mtar`)
```powershell
npm run build:mta
```
*Lệnh này gọi `mbt build`, đóng gói toàn bộ metadata, destination config và html5 repo thành file `.mtar` tại:  
`mta_archives/sap.ui.demo.productmanager_1.0.0.mtar`.*

### 3️⃣ Deploy lên SAP BTP Cockpit
```powershell
cf deploy mta_archives/sap.ui.demo.productmanager_1.0.0.mtar
```
*Quá trình deploy mất khoảng 2 - 3 phút. Khi thành công, Terminal sẽ báo `Process finished` và tự động đăng ký ứng dụng vào HTML5 Repo Host & Destination Content.*

---

## 4. Kiểm Tra Sau Khi Deploy & Gắn Vào SAP Build Work Zone

Sau khi lệnh `cf deploy` hoàn tất 100%:
1. Mở trang quản trị **SAP Build Work Zone (Site Manager)**.
2. Vào **Channel Manager / Content Explorer** -> Nhấn **Update** ở nguồn **HTML5 Apps**.
3. Tìm ứng dụng **Product Manager (`sap.ui.demo.productmanager`)** -> Nhấn **Add to My Content**.
4. Vào **My Content** -> Gán ứng dụng vào **Catalog / Group** -> Phân quyền cho **Role** (`Everyone`).
5. Mở trang chủ Launchpad Site, bạn sẽ thấy **Tile "Product Manager"** sẵn sàng phục vụ người dùng!

---

## 5. Khắc Phục Lỗi Thường Gặp Khi Build MTA (`make: *** [pre_validate] Error 1`)

Nếu khi chạy `npm run build:mta` (`mbt build`) bạn gặp lỗi:
```
''C:' is not recognized as an internal or external command,
operable program or batch file.
make: *** [pre_validate] Error 1
```
### 💡 Nguyên nhân
- Lệnh `mbt build` sinh ra file `Makefile_...mta` chứa đường dẫn tuyệt đối của dự án (`C:/Users/ASUS/OneDrive/Desktop/Shit Code/SAP`).
- Do thư mục dự án của bạn có **khoảng trắng** (`Shit Code`), Makefile buộc phải bọc đường dẫn trong dấu ngoặc kép (`"C:/..."`).
- Phiên bản **GnuWin32 `make.exe` 3.81** (bản cũ) khi gọi lệnh `cmd.exe /c` trên Windows gặp lỗi parse dấu ngoặc kép và dấu hai chấm (`:`), dẫn đến lỗi `'C:' is not recognized...`.

### ✅ Cách Xử Lý Triệt Để (Chọn 1 trong 2 cách):

#### Cách 1: Đơn giản nhất — Chuyển thư mục dự án sang đường dẫn không có khoảng trắng
Vì lỗi chỉ xảy ra khi đường dẫn có dấu cách, bạn chỉ cần di chuyển thư mục `SAP` ra chỗ không có khoảng trắng, ví dụ:
- Chuyển sang: `C:\Users\ASUS\Desktop\SAP` hoặc `C:\Projects\SAP`
- Khi đó lệnh `npm run build:mta` với `make 3.81` sẽ chạy thành công 100% ngay lập tức mà không gặp bất kỳ lỗi quote nào!

#### Cách 2: Cập nhật lên Make 4.x (Ezwinports / MSYS2 / Chocolatey)
Nếu muốn giữ nguyên tên thư mục có dấu cách, bạn cần dùng phiên bản **GNU Make 4.3+** thay cho bản 3.81 cũ:
```powershell
# Cài bản Make mới qua Chocolatey
choco install make -y
```
*(Bản Make 4.3 xử lý hoàn hảo dấu ngoặc kép và đường dẫn chứa khoảng trắng trên Windows).*
