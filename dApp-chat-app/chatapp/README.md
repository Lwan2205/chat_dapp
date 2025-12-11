# Chat DApp - Hướng Dẫn Chạy & Test
## Yêu Cầu Hệ Thống

- **Node.js**: v18 hoặc cao hơn
- **npm**: v9 hoặc cao hơn  
- **MetaMask**: Cài đặt extension browser
- **Ví blockchain**: Có tối thiểu một tài khoản trên Sepolia testnet

---

## Cài Đặt & Chạy Project

### 1. Clone Project

```bash
git clone <repository-url>
cd chatapp
```

### 2. Cài Đặt Dependencies

```bash
npm install
```

Nếu gặp lỗi thiếu packages:
```bash
npm install sharp     # Cho image optimization
```



### 4. Chạy Development Server

```bash
npm run dev
```

Output sẽ hiển thị:
```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Environments: .env.local
```

Mở [http://localhost:3000](http://localhost:3000) trong browser.

---

## Hướng Dẫn Test Chi Tiết

### BƯỚC 1: Chuẩn Bị MetaMask

1. Mở MetaMask extension
2. Chuyển sang mạng **Sepolia Testnet**:
   - Click network dropdown (góc trên)
   - Chọn "Sepolia"
3. Lấy TestETH từ faucet:
   - Truy cập: https://www.sepoliafaucet.io/
   - Paste địa chỉ ví MetaMask
   - Claim TestETH

### BƯỚC 2: Test Kết Nối Ví

1. Trên [http://localhost:3000](http://localhost:3000)
2. Sẽ thấy nút "Connect Wallet"
3. Click nút → MetaMask popup sẽ hiện lên
4. Chọn account và click "Connect"

**Kết quả mong đợi:**
- Ví được kết nối
- Hiển thị địa chỉ ví (dạng 0x...)
- Giao diện chat được hiển thị

**Nếu lỗi:**
- Kiểm tra MetaMask đang ở **Sepolia Testnet**
- Refresh page (F5)
- Thử account khác

### BƯỚC 3: Test Tạo User

1. Sau khi kết nối ví, nhập **username**
2. Click "Create User"
3. MetaMask sẽ hiện popup ký transaction
4. Click "Sign"

**Kết quả mong đợi:**
- Transaction thành công (có gas fee)
- User được tạo trên blockchain
- Hiển thị username trên giao diện
- Balance giảm (vì đã pay gas)

**Nếu lỗi:**
```
Error: insufficient balance
→ Lấy thêm TestETH từ faucet
```

### BƯỚC 4: Test Thêm Bạn (Add Friend)

1. Click nút "Add Friend"
2. Nhập **địa chỉ ví bạn bè**:
   - Dùng account khác trong MetaMask
   - Hoặc bạn bè trên mạng Sepolia
   - Hoặc account test khác
3. Nhập **tên hiển thị** cho bạn (vd: "John")
4. Click "Add Friend"
5. MetaMask ký transaction

**Kết quả mong đợi:**
- Bạn bè xuất hiện trong danh sách "Friends"
- Hiển thị avatar & tên bạn
- Có thể chọn để nhắn tin

**Nếu lỗi:**
```
Error: Cannot send to self
→ Dùng địa chỉ bạn bè khác
```

### BƯỚC 5: Test Gửi Tin Nhắn

1. Từ danh sách Friends, chọn một bạn
2. Giao diện chat sẽ hiển thị
3. Nhập **nội dung tin nhắn**
4. Click nút "Send" 
5. MetaMask ký transaction

**Kết quả mong đợi:**
- Tin nhắn hiển thị trong chat window
- Tin nhắn của bạn ở bên phải (bubble-right)
- Có timestamp
- Được lưu trên blockchain

**Nếu lỗi:**
```
Error: Message too long
→ Tin nhắn không được vượt quá 1000 ký tự
```

### BƯỚC 6: Test Real-time Listener (WebSocket)

1. **Mở 2 tab browser** cùng một lúc:
   - Tab 1: Account A
   - Tab 2: Account B (hoặc Account A khác)

2. **Trên Tab 1**: Gửi tin nhắn cho Tab 2

3. **Quan sát Tab 2**: Tin nhắn mới sẽ xuất hiện **ngay lập tức** (không cần refresh)

**Kết quả mong đợi:**
- WebSocket listener hoạt động
- Tin nhắn cập nhật real-time
- Không cần refresh page
- Có event "MessageSent" từ blockchain

**Kiểm tra Console:**
```
Console Log:
WebSocket connecting...
Listening to MessageSent events
```

### BƯỚC 7: Test Sửa Tin Nhắn (Edit)

1. Hover vào tin nhắn bạn vừa gửi
2. Click nút "Edit"
3. Nhập nội dung mới
4. Click "Update"
5. MetaMask ký transaction

**Kết quả mong đợi:**
- Tin nhắn được cập nhật
- Hiển thị "[Edited]" tag
- Timestamp "editedAt" được set

### BƯỚC 8: Test Xóa Tin Nhắn (Delete)

1. Hover vào tin nhắn muốn xóa
2. Click nút "Delete"
3. Xác nhận xóa
4. MetaMask ký transaction

**Kết quả mong đợi:**
- Tin nhắn biến mất khỏi giao diện
- Block isDeleted = true trên blockchain
- Không thể khôi phục

---

