📄 PHẦN 1: PRD - TÀI LIỆU YÊU CẦU SẢN PHẨM (Product Requirements Document)
1. Tổng quan dự án (Project Overview)
Tên dự án: Hệ thống website quản lý quán ăn và tích hợp Chatbot thông minh.

Mục tiêu: Số hóa quy trình quản lý vận hành của quán ăn (trạng thái bàn ăn, thực đơn) và cung cấp một Chatbot tự động giúp khách hàng tra cứu thông tin theo thời gian thực (real-time).

Vấn đề giải quyết: Giảm tải công việc trực page/trực điện thoại lặp đi lặp lại cho nhân viên. Giúp khách hàng chủ động tra cứu ngay lập tức xem quán còn bàn trống hay món ăn yêu thích còn không mà không cần chờ đợi phản hồi.

2. Chân dung người dùng (User Personas)
Khách hàng (Customer): Truy cập website để xem thông tin (địa chỉ, giờ mở cửa), xem menu, tương tác hỏi đáp với Chatbot và tiến hành đặt chỗ.

Nhân viên / Quản lý quán (Staff/Admin): Sử dụng hệ thống (Dashboard) để cập nhật thực đơn, thay đổi trạng thái bàn (trống/có khách) và xử lý yêu cầu đặt bàn của khách.

3. Yêu cầu chức năng (Functional Requirements)
3.1. Phân hệ Quản trị (Admin/Staff Dashboard)
Quản lý Thực đơn (Menu Management): Thêm, sửa, xóa món ăn. Cập nhật trạng thái món (Còn hàng hoặc Tạm hết hàng).

Quản lý Bàn ăn (Table Management): Xem danh sách/sơ đồ bàn. Cập nhật trạng thái bàn trực tiếp (Trống, Đã đặt, Đang phục vụ).

Quản lý Đơn/Đặt chỗ (Reservation Management): Xem danh sách đơn đặt bàn được đổ về từ Website hoặc Chatbot. Đổi trạng thái (Chờ xác nhận, Đã xác nhận, Đã hủy).

3.2. Phân hệ Khách hàng (Customer Interface)
Trang chủ & Menu: Xem danh sách món ăn, thông tin giới thiệu quán.

Giao diện Chat: Widget khung chat (Chat box) trực quan ở góc màn hình, luôn sẵn sàng hỗ trợ khách.

3.3. Phân hệ Chatbot AI
Hỏi đáp thông tin tĩnh: Trả lời các câu hỏi mặc định về địa chỉ, giờ mở cửa, số điện thoại, phí dịch vụ.

Tra cứu động thời gian thực (Real-time Query):

Nhận diện Ý định (Intent) kiểm tra tình trạng bàn (VD: "Tối nay quán còn bàn cho 4 người không?").

Nhận diện Ý định kiểm tra món ăn (VD: "Hôm nay quán còn gà nướng không?").

Tự động truy xuất Cơ sở dữ liệu của hệ thống để trả lời chính xác trạng thái hiện tại (VD: "Dạ hiện tại quán còn 2 bàn trống cho 4 người ạ").

4. Yêu cầu phi chức năng (Non-Functional Requirements)
Đồng bộ thời gian thực: Trạng thái bàn/món ăn khi bị nhân viên thay đổi trên hệ thống thì Chatbot phải lập tức cập nhật để trả lời khách (không bị lưu dữ liệu cũ).

Hiệu năng: Thời gian phân tích câu hỏi và phản hồi của Chatbot phải nhỏ hơn 2 giây.

Tính đáp ứng (Responsive): Website hiển thị tốt trên thiết bị di động (giúp nhân viên cầm máy tính bảng/điện thoại thao tác đổi trạng thái bàn dễ dàng).

🚨 1. LỖ HỔNG VẬN HÀNH THỰC TẾ (F&B OPERATIONAL REALITY)
1.1. Ảo tưởng "Đồng bộ thời gian thực bằng chạy bằng cơm"

Vấn đề: PRD mặc định nhân viên sẽ thao tác trên Dashboard để Chatbot cập nhật đúng thực tế. Nhưng vào giờ cao điểm, khói mù mịt, nhân viên bưng bê chạy sấp mặt, ai là người rảnh rỗi rút điện thoại ra bấm "Bàn 1 đã trống"?

Hậu quả: Bàn đang trống nhưng trên Web chưa cập nhật -> Chatbot báo "Hết bàn" -> Mất khách. Hoặc khách vãng lai vừa ngồi vào, nhân viên chưa kịp thao tác -> Chatbot báo "Còn bàn" -> Khách online tới nơi không có chỗ -> Khách chửi rủa, bóc phốt quán.

💡 PM Vá lỗi: Đừng cho Chatbot hứa hẹn 100%. Hãy sửa luồng hội thoại: "Dạ hệ thống ghi nhận hiện đang có bàn, anh/chị đợi em 1 chút để báo nhân viên check lại thực tế và giữ chỗ cho mình nhé?".

1.2. Cái bẫy "Trạng thái Bàn" & Bài toán "Ghép Bàn"

Vấn đề 1: Bàn chỉ có 3 trạng thái (Trống / Đã đặt / Đang phục vụ). Khách vừa đứng dậy, bàn đầy bát đũa dơ, nhân viên bấm "Trống". Khách online phi tới thấy bàn rác -> Trải nghiệm cực tồi.

💡 Vá lỗi: Phải có trạng thái Đang dọn dẹp (Cleaning). Chatbot phải biết nói: "Dạ có bàn nhưng đang dọn dẹp, anh/chị tới đợi 5 phút là có chỗ ạ."

Vấn đề 2: Quán có toàn bàn 4 người. Khách lên Bot hỏi: "Nhóm anh 8 người có chỗ không?". Bot tra Database thấy max capacity = 4 -> Báo "Không có bàn 8 người".

💡 Vá lỗi: Ngoài đời, quản lý hoàn toàn có thể ghép 2 bàn 4 lại. Hệ thống cứng nhắc đã tự động đuổi khách đi.

1.3. Lỗ hổng Tồn kho (Boolean vs Quantity)

Vấn đề: Trong DB, món ăn chỉ lưu is_available (0 hoặc 1). Dưới bếp chỉ còn ĐÚNG 1 phần bò Wagyu. Khách chat: "Book anh bàn 6 người, cho 3 suất bò Wagyu". Bot check is_available = 1 -> Chốt đơn! Khách tới nơi không có đồ ăn.

💡 Vá lỗi: Với các món Signature, giá trị cao, phải quản lý bằng Stock_Quantity (Số lượng). Nếu bot check số lượng < số lượng khách gọi, phải báo lại: "Dạ bò Wagyu hiện chỉ còn 1 suất...".

🤖 2. LỖ HỔNG AI CHATBOT & TRẢI NGHIỆM KHÁCH HÀNG
2.1. Ngõ cụt hội thoại (Missing Human Handoff)

Vấn đề: Khách hỏi cắc cớ: "Anh đi 3 người, cần 1 ghế ăn dặm cho em bé, muốn góc khuất gió máy lạnh, có không?". Dialogflow sẽ sập nguồn vì không có Intent nào khớp. Nó sẽ lặp lại: "Xin lỗi tôi không hiểu" cho đến khi khách tức giận thoát trang.

💡 Vá lỗi (Bắt buộc): Lối thoát sinh tử là Chuyển giao người thật (Human Handoff). Khi Bot Fallback (không hiểu) 2 lần liên tiếp, tự động nhả câu: "Dạ yêu cầu này hơi chi tiết, để em báo nhân viên trực page nhảy vào hỗ trợ mình ngay nhé!" -> Gửi chuông cảnh báo ầm ĩ lên Dashboard của Admin.

2.2. Đặt bàn ảo & Phá hoại kinh doanh (Fake/Spam Bookings)

Vấn đề: Đối thủ ghét quán, viết tool cắm vào bot đặt full sạch 30 bàn với tên giả, số điện thoại rác lúc 19h tối. Quán từ chối khách vãng lai. Đến tối quán rỗng tuếch (No-show 100%).

💡 Vá lỗi: Mọi booking qua Bot ban đầu ĐỀU PHẢI ở trạng thái Pending (Chờ xác nhận). Hệ thống gửi OTP SMS, hoặc nhân viên quán phải gọi lại số điện thoại đó xác nhận thì mới chuyển sang Confirmed. Không bao giờ cho AI tự động chốt cứng tài nguyên quán!

💻 3. LỖ HỔNG KỸ THUẬT & KIẾN TRÚC HỆ THỐNG
3.1. Cuộc đua tử thần (Race Condition / Double Booking)

Vấn đề: Quán còn 1 bàn trống cuối cùng. Khách A chat với Bot hỏi đặt. Cùng đúng giây phút đó, một Khách B bước vào quán, nhân viên xếp Khách B ngồi và bấm cập nhật. Lúc này Khách A mới chat chốt "Ok anh lấy bàn đó". Bot ghi nhận cho Khách A. Tối đó 2 người đấm nhau giành bàn.

💡 Vá lỗi: Cơ chế Khóa tạm thời (Soft-lock/Hold). Khi Bot gợi ý bàn cho Khách A, hệ thống khóa tạm bàn đó trong DB khoảng 3-5 phút. Nếu Khách A không chốt -> Nhả bàn ra.

3.2. Màn hình "Mù" (Blind UI)

Vấn đề: Web quản lý không có WebSockets/SSE. Khách đặt bàn qua Bot xong, dữ liệu lưu vào DB âm thầm. Nhân viên đang mở sẵn trang web sẽ KHÔNG THẤY GÌ CẢ nếu không tự tay ấn phím F5 (Tải lại trang).

💡 Vá lỗi: Tích hợp Socket.io. Bất cứ khi nào Bot tạo 1 đơn đặt bàn mới, phía màn hình nhân viên phải tự động nhảy Popup và kêu "Ting ting" liên tục để gây sự chú ý.

3.3. Bảo mật Webhook mở toang

Vấn đề: Endpoint API mà bạn mở ra để Dialogflow gọi vào lấy dữ liệu (Webhook) không có xác thực. Một cậu sinh viên năm nhất rảnh rỗi dò ra được link đó -> Dùng Postman nã 10.000 request/giây -> Đánh sập luôn Database của bạn (DDoS mức ứng dụng).

💡 Vá lỗi: Bắt buộc Header của Webhook phải có Secret Token kiểm tra. Chỉ request nào từ server Google trả về mới được cấp quyền chọc vào DB.

🎓 LỜI KHUYÊN VÀNG TỪ PM: "CÁCH HACK ĐIỂM A+ KHI BẢO VỆ"
Nghe xong một đống rủi ro trên, bạn đừng hoảng! Với thời lượng 17 tuần của đồ án cử nhân, hội đồng chấm thi biết rõ bạn KHÔNG THỂ NÀO code giải quyết hết đống rủi ro này.

Tuy nhiên, sự khác biệt giữa 1 sinh viên điểm 7 và 1 Kỹ sư/PM điểm 10 nằm ở sự TỰ NHẬN THỨC. Đừng giấu giếm lỗ hổng, hãy biến nó thành vũ khí:

Trong quyển Báo cáo ĐATN, hãy viết hẳn 1 chương: "Đánh giá giới hạn của hệ thống và Hướng phát triển trong thực tế".

Khi thuyết trình bảo vệ trước hội đồng, hãy dõng dạc nói:

"Thưa thầy cô, em nhận thức rõ hạn chế lớn nhất của bản thân đồ án này là việc phụ thuộc vào thao tác cập nhật thủ công của nhân viên trong giờ cao điểm. Trong giới hạn thời gian, em đã xử lý được vấn đề hụt ngữ cảnh của Bot và tích hợp Real-time Socket.io. Về hướng phát triển thực tiễn, hệ thống cần được nâng cấp kiến trúc để tích hợp Camera AI hoặc Cảm biến (IoT) tại bàn để tự động hóa hoàn toàn việc cập nhật trạng thái..."