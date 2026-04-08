# SpecCrew - Khung Kỹ thuật Phần mềm Điều khiển bởi AI

<p align="center">
  <a href="./README.md">简体中文</a> |
  <a href="./README.zh-TW.md">繁體中文</a> |
  <a href="./README.en.md">English</a> |
  <a href="./README.ko.md">한국어</a> |
  <a href="./README.de.md">Deutsch</a> |
  <a href="./README.es.md">Español</a> |
  <a href="./README.fr.md">Français</a> |
  <a href="./README.it.md">Italiano</a> |
  <a href="./README.da.md">Dansk</a> |
  <a href="./README.ja.md">日本語</a> |
  <a href="./README.pl.md">Polski</a> |
  <a href="./README.ru.md">Русский</a> |
  <a href="./README.bs.md">Bosanski</a> |
  <a href="./README.ar.md">العربية</a> |
  <a href="./README.no.md">Norsk</a> |
  <a href="./README.pt-BR.md">Português (Brasil)</a> |
  <a href="./README.th.md">ไทย</a> |
  <a href="./README.tr.md">Türkçe</a> |
  <a href="./README.uk.md">Українська</a> |
  <a href="./README.bn.md">বাংলা</a> |
  <a href="./README.el.md">Ελληνικά</a> |
  <a href="./README.vi.md">Tiếng Việt</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/speccrew"><img src="https://img.shields.io/npm/v/speccrew.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/speccrew"><img src="https://img.shields.io/npm/dm/speccrew.svg" alt="npm downloads"></a>
  <a href="https://github.com/charlesmu99/speccrew/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/speccrew.svg" alt="license"></a>
</p>

> Một đội phát triển AI ảo cho phép triển khai kỹ thuật nhanh chóng cho bất kỳ dự án phần mềm nào

## SpecCrew là gì?

SpecCrew là một khung đội phát triển AI ảo được nhúng. Nó chuyển đổi các quy trình kỹ thuật phần mềm chuyên nghiệp (PRD → Feature Design → System Design → Dev → Test) thành các quy trình Agent có thể tái sử dụng, giúp các đội phát triển đạt được Specification-Driven Development (SDD), đặc biệt phù hợp cho các dự án hiện có.

Bằng cách tích hợp các Agent và Skill vào các dự án hiện có, các đội có thể nhanh chóng khởi tạo hệ thống tài liệu dự án và đội phần mềm ảo, triển khai các tính năng mới và sửa đổi theo các quy trình kỹ thuật tiêu chuẩn từng bước.

---

## ✨ Điểm Nổi Bật Chính

### 🏭 Đội Phần Mềm Ảo
Tạo bằng một cú nhấp chuột **7 vai trò Agent chuyên nghiệp** + **38 quy trình Skill**, xây dựng đội phần mềm ảo hoàn chỉnh:
- **Team Leader** - Lập kế hoạch toàn cầu và quản lý lặp lại
- **Product Manager** - Phân tích yêu cầu và xuất PRD
- **Feature Designer** - Thiết kế tính năng + hợp đồng API
- **System Designer** - Thiết kế hệ thống Frontend/Backend/Mobile/Desktop
- **System Developer** - Phát triển song song đa nền tảng
- **Test Manager** - Điều phối kiểm thử ba giai đoạn
- **Task Worker** - Thực thi tác vụ phụ song song

### 📐 Mô hình hóa ISA-95 Sáu Giai đoạn
Dựa trên phương pháp luận mô hình hóa quốc tế **ISA-95**, chuẩn hóa chuyển đổi yêu cầu nghiệp vụ thành hệ thống phần mềm:
```
Domain Descriptions → Functions in Domains → Functions of Interest
     ↓                       ↓                      ↓
Information Flows → Categories of Information → Information Descriptions
```
- Mỗi giai đoạn tương ứng với biểu đồ UML cụ thể (use case, sequence, class)
- Yêu cầu nghiệp vụ được "tinh chế từng bước", không mất thông tin
- Đầu ra có thể sử dụng trực tiếp cho phát triển

### 📚 Hệ thống Cơ sở Kiến thức
Kiến trúc cơ sở kiến thức ba tầng đảm bảo AI luôn làm việc dựa trên "nguồn sự thật duy nhất":

| Tầng | Thư mục | Nội dung | Mục đích |
|------|---------|----------|----------|
| L1 Kiến thức Hệ thống | `knowledge/techs/` | Stack công nghệ, kiến trúc, quy ước | AI hiểu ranh giới kỹ thuật của dự án |
| L2 Kiến thức Nghiệp vụ | `knowledge/bizs/` | Chức năng module, luồng nghiệp vụ, thực thể | AI hiểu logic nghiệp vụ |
| L3 Tạo phẩm Lặp | `iterations/iXXX/` | PRD, tài liệu thiết kế, báo cáo kiểm thử | Chuỗi truy xuất đầy đủ cho yêu cầu hiện tại |

### 🔄 Pipeline Kiến thức Bốn Giai đoạn
**Kiến trúc tạo kiến thức tự động**, tự động tạo tài liệu nghiệp vụ/kỹ thuật từ mã nguồn:
```
Giai đoạn 1: Quét mã nguồn → Tạo danh sách module
Giai đoạn 2: Phân tích song song → Trích xuất tính năng (nhiều Worker song song)
Giai đoạn 3: Tóm tắt song song → Hoàn thành tổng quan module (nhiều Worker song song)
Giai đoạn 4: Tổng hợp hệ thống → Tạo toàn cảnh hệ thống
```
- Hỗ trợ **đồng bộ hóa đầy đủ** và **đồng bộ hóa tăng dần** (dựa trên Git diff)
- Một người tối ưu hóa, cả đội chia sẻ

---

## Giải quyết 8 Vấn đề Cốt lõi

### 1. AI Bỏ qua Tài liệu Dự án Hiện có (Khoảng trống Kiến thức)
**Vấn đề**: Các phương pháp SDD hoặc Vibe Coding hiện có phụ thuộc vào AI tóm tắt các dự án theo thời gian thực, dễ dàng bỏ lỡ bối cảnh quan trọng và gây ra kết quả phát triển lệch khỏi kỳ vọng.

**Giải pháp**: Kho lưu trữ `knowledge/` đóng vai trò là "nguồn sự thật duy nhất" của dự án, tích lũy thiết kế kiến trúc, các mô-đun chức năng và quy trình kinh doanh để đảm bảo các yêu cầu vẫn đúng hướng từ nguồn.

### 2. Tài liệu Kỹ thuật Trực tiếp từ PRD (Bỏ sót Nội dung)
**Vấn đề**: Nhảy trực tiếp từ PRD đến thiết kế chi tiết dễ dàng bỏ sót các chi tiết yêu cầu, khiến các tính năng được triển khai lệch khỏi yêu cầu.

**Giải pháp**: Giới thiệu giai đoạn **Tài liệu Feature Design**, chỉ tập trung vào khung yêu cầu mà không có chi tiết kỹ thuật:
- Bao gồm những trang và thành phần nào?
- Các luồng thao tác trang
- Logic xử lý backend
- Cấu trúc lưu trữ dữ liệu

Phát triển chỉ cần "điền nội dung" dựa trên ngăn xếp công nghệ cụ thể, đảm bảo các tính năng phát triển "gần xương (yêu cầu)".

### 3. Phạm vi Tìm kiếm Agent Không chắc chắn (Sự không chắc chắn)
**Vấn đề**: Trong các dự án phức tạp, tìm kiếm rộng mã và tài liệu bởi AI mang lại kết quả không chắc chắn, làm cho tính nhất quán khó đảm bảo.

**Giải pháp**: Các cấu trúc thư mục tài liệu rõ ràng và các mẫu, được thiết kế dựa trên nhu cầu của từng Agent, triển khai **tiết lộ dần dần và tải theo yêu cầu** để đảm bảo sự tất định.

### 4. Thiếu Các Bước và Nhiệm vụ (Đứt gãy Quy trình)
**Vấn đề**: Thiếu bao phủ đầy đủ quy trình kỹ thuật dễ dàng bỏ sót các bước quan trọng, làm cho chất lượng khó đảm bảo.

**Giải pháp**: Bao phủ toàn bộ vòng đời kỹ thuật phần mềm:
```
PRD (Yêu cầu) → Feature Design (Thiết kế Tính năng) → API Contract (Hợp đồng)
    → System Design (Thiết kế Hệ thống) → Dev (Phát triển) → Test (Kiểm thử)
```
- Đầu ra của mỗi giai đoạn là đầu vào của giai đoạn tiếp theo
- Mỗi bước yêu cầu xác nhận của con người trước khi tiếp tục
- Tất cả các thực thi Agent có danh sách todo với tự kiểm tra sau khi hoàn thành

### 5. Hiệu quả Hợp tác Đội thấp (Các hầm chứa Kiến thức)
**Vấn đề**: Kinh nghiệm lập trình AI khó chia sẻ giữa các đội, dẫn đến các lỗi lặp lại.

**Giải pháp**: Tất cả các Agent, Skill và tài liệu liên quan được kiểm soát phiên bản với mã nguồn:
- Tối ưu hóa của một người được chia sẻ bởi đội
- Kiến thức được tích lũy trong cơ sở mã
- Cải thiện hiệu quả hợp tác đội

### 7. Ngữ cảnh Đơn Agent Quá dài (Điểm nghẽn Hiệu suất)
**Vấn đề**: Các nhiệm vụ phức tạp lớn vượt qua cửa sổ ngữ cảnh đơn Agent, gây ra sự lệch lạc trong hiểu biết và giảm chất lượng đầu ra.

**Giải pháp**: **Cơ chế Tự động Điều phối Sub-Agent**:
- Các nhiệm vụ phức tạp được tự động nhận diện và chia thành các nhiệm vụ con
- Mỗi nhiệm vụ con được thực thi bởi một Sub-Agent độc lập với ngữ cảnh được cô lập
- Agent cha điều phối và tổng hợp để đảm bảo tính nhất quán tổng thể
- Tránh mở rộng ngữ cảnh đơn Agent, đảm bảo chất lượng đầu ra

### 8. Sự hỗn loạn Lặp lại Yêu cầu (Khó khăn Quản lý)
**Vấn đề**: Nhiều yêu cầu trộn lẫn trong cùng một nhánh ảnh hưởng lẫn nhau, làm cho việc theo dõi và quay lại trở nên khó khăn.

**Giải pháp**: **Mỗi Yêu cầu như một Dự án Độc lập**:
- Mỗi yêu cầu tạo một thư mục lặp lại độc lập `iterations/iXXX-[tên-yêu-cầu]/`
- Cô lập hoàn toàn: tài liệu, thiết kế, mã và kiểm thử được quản lý độc lập
- Lặp lại nhanh chóng: giao hàng độ hạt nhỏ, xác minh nhanh, triển khai nhanh
- Lưu trữ linh hoạt: sau khi hoàn thành, lưu trữ trong `archive/` với khả năng truy xuất lịch sử rõ ràng

### 6. Trì hoãn Cập nhật Tài liệu (Sự xuống cấp Kiến thức)
**Vấn đề**: Tài liệu trở nên lỗi thời khi các dự án phát triển, khiến AI làm việc với thông tin sai.

**Giải pháp**: Các Agent có khả năng cập nhật tài liệu tự động, đồng bộ hóa các thay đổi dự án theo thời gian thực để giữ cho cơ sở kiến thức chính xác.

---

## Thông tin Bổ sung

- **Bản đồ Kiến thức Agent**: [speccrew-workspace/docs/agent-knowledge-map.md](./speccrew-workspace/docs/agent-knowledge-map.md)
- **npm**: https://www.npmjs.com/package/speccrew
- **GitHub**: https://github.com/charlesmu99/speccrew
- **Gitee**: https://gitee.com/amutek/speccrew
- **Qoder IDE**: https://qoder.com/

---

> **SpecCrew không nhằm mục đích thay thế các nhà phát triển, mà tự động hóa các phần nhàm chán để các đội có thể tập trung vào công việc có giá trị hơn.**
